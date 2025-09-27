-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE product_condition AS ENUM ('new', 'refurbished', 'used', 'activated', 'open_box');
CREATE TYPE product_category AS ENUM ('phone', 'tablet', 'earphones', 'accessories');
CREATE TYPE order_status AS ENUM ('draft', 'reserved', 'delivered', 'closed');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'check');
CREATE TYPE return_reason AS ENUM ('defective', 'unsold', 'trade_in');
CREATE TYPE return_condition AS ENUM ('returned', 'refurbish', 'restocked');

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    storage VARCHAR(50) NOT NULL,
    condition product_condition NOT NULL,
    category product_category NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_alert INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    payment_terms VARCHAR(100) DEFAULT 'on_delivery',
    custom_pricing JSONB,
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_debt DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'draft',
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    method payment_method NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Returns table
CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    reason return_reason NOT NULL,
    condition return_condition NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_brand_model ON products(brand, model);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_date ON payments(date);
CREATE INDEX idx_returns_product_id ON returns(product_id);
CREATE INDEX idx_returns_client_id ON returns(client_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update client totals
CREATE OR REPLACE FUNCTION update_client_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update total_spent
        UPDATE clients 
        SET total_spent = (
            SELECT COALESCE(SUM(oi.quantity * oi.price), 0)
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.client_id = NEW.client_id AND o.status = 'delivered'
        )
        WHERE id = NEW.client_id;
        
        -- Update total_debt
        UPDATE clients 
        SET total_debt = (
            SELECT COALESCE(SUM(oi.quantity * oi.price), 0) - COALESCE(SUM(p.amount), 0)
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN payments p ON p.client_id = o.client_id
            WHERE o.client_id = NEW.client_id AND o.status = 'delivered'
        )
        WHERE id = NEW.client_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Add triggers to update client totals
CREATE TRIGGER update_client_totals_on_order_item_change
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_client_totals();

CREATE TRIGGER update_client_totals_on_payment_change
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_client_totals();

-- Function to update order total price
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders 
    SET total_price = (
        SELECT COALESCE(SUM(quantity * price), 0)
        FROM order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Add trigger to update order total
CREATE TRIGGER update_order_total_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
-- Note: In production, you should create more restrictive policies
CREATE POLICY "Allow all operations for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON order_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON returns
    FOR ALL USING (auth.role() = 'authenticated');
