-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE product_condition AS ENUM ('new', 'refurbished', 'used', 'activated', 'open_box');
CREATE TYPE product_category AS ENUM ('iphone', 'samsung', 'android_phone', 'tablet', 'smartwatch', 'earphones', 'chargers', 'cases', 'accessories');
CREATE TYPE order_status AS ENUM ('draft', 'reserved', 'delivered', 'closed');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'check', 'credit');
CREATE TYPE return_reason AS ENUM ('defective', 'unsold', 'trade_in');
CREATE TYPE return_condition AS ENUM ('returned', 'refurbish', 'restocked');
CREATE TYPE return_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Alerts table
CREATE TABLE public.alerts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type = ANY (ARRAY['low_stock'::text, 'undelivered'::text, 'overdue_payment'::text, 'reserved_stale'::text, 'new_order'::text])),
  ref_id uuid,
  message text NOT NULL,
  severity text DEFAULT 'warning'::text CHECK (severity = ANY (ARRAY['info'::text, 'warning'::text, 'danger'::text])),
  delivered boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alerts_pkey PRIMARY KEY (id)
);

-- Clients table
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  phone character varying NOT NULL,
  address text,
  payment_terms character varying DEFAULT 'on_delivery'::character varying,
  custom_pricing jsonb,
  total_spent numeric DEFAULT 0,
  total_debt numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  clerk_user_id text UNIQUE,
  email text,
  city text,
  shop_name text,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);

-- Orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  status order_status NOT NULL DEFAULT 'draft'::order_status,
  total_price numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  promised_date date,
  source text,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

-- Order items table
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Outbound messages table
CREATE TABLE public.outbound_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel text NOT NULL CHECK (channel = 'whatsapp'::text),
  to_client_id uuid,
  template text NOT NULL,
  payload jsonb NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  to_phone text NOT NULL,
  sent_at timestamp with time zone,
  error text,
  CONSTRAINT outbound_messages_pkey PRIMARY KEY (id),
  CONSTRAINT outbound_messages_to_client_id_fkey FOREIGN KEY (to_client_id) REFERENCES public.clients(id)
);

-- Payments table
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  order_id uuid,
  amount numeric NOT NULL,
  method payment_method NOT NULL,
  date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  reference text,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

-- Products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  brand character varying NOT NULL,
  model character varying NOT NULL,
  storage character varying NOT NULL,
  condition product_condition NOT NULL,
  category product_category NOT NULL,
  total_stock integer NOT NULL DEFAULT 0,
  reserved_stock integer NOT NULL DEFAULT 0,
  min_stock_alert integer NOT NULL DEFAULT 5,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image_url text,
  purchase_price numeric DEFAULT 0,
  sale_price_default numeric DEFAULT 0,
  alert_threshold integer DEFAULT 10,
  importer text,
  warranty_provider text,
  warranty_months integer DEFAULT 0,
  is_promotion boolean DEFAULT false,
  tags text[] DEFAULT '{}'::text[],
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Returns table
CREATE TABLE public.returns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  client_id uuid,
  reason return_reason NOT NULL,
  condition return_condition NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  status return_status DEFAULT 'pending'::return_status,
  CONSTRAINT returns_pkey PRIMARY KEY (id),
  CONSTRAINT returns_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT returns_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand_model ON public.products USING btree (brand, model);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products USING btree (category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products USING btree (total_stock);
CREATE INDEX IF NOT EXISTS idx_products_image_url ON public.products USING btree (image_url) WHERE (image_url IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients USING btree (name);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients USING btree (phone);
CREATE INDEX IF NOT EXISTS idx_clients_clerk_user_id ON public.clients USING btree (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders USING btree (client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments USING btree (client_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments USING btree (date);
CREATE INDEX IF NOT EXISTS idx_returns_product_id ON public.returns USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_returns_client_id ON public.returns USING btree (client_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_updated_at_on_products 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_updated_at_on_clients 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_updated_at_on_orders 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for development (allow all operations)
CREATE POLICY "Allow all operations for authenticated users" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.order_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.returns
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.alerts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.outbound_messages
    FOR ALL USING (auth.role() = 'authenticated');