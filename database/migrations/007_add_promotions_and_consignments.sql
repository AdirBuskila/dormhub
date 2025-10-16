-- Migration 007: Add Promotions and Consignments Tables
-- Created: 2025-10-16
-- Description: Adds promotions management and consignment tracking

-- =============================================
-- PROMOTIONS TABLE
-- =============================================

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  title text NOT NULL,
  title_he text,
  description text,
  description_he text,
  promo_price numeric NOT NULL,
  original_price numeric,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  max_units integer,
  units_sold integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by text,
  CONSTRAINT promotions_pkey PRIMARY KEY (id),
  CONSTRAINT promotions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT promotions_dates_check CHECK (ends_at > starts_at),
  CONSTRAINT promotions_price_check CHECK (promo_price > 0),
  CONSTRAINT promotions_units_check CHECK (units_sold >= 0 AND (max_units IS NULL OR units_sold <= max_units))
);

-- Create indexes for promotions
CREATE INDEX IF NOT EXISTS idx_promotions_product_id ON public.promotions USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions USING btree (active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON public.promotions USING btree (starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_promotions_active_dates ON public.promotions USING btree (active, starts_at, ends_at) WHERE active = true;

-- Trigger for promotions updated_at
CREATE TRIGGER update_updated_at_on_promotions 
    BEFORE UPDATE ON public.promotions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- CONSIGNMENTS TABLE
-- =============================================

-- Create consignments table
CREATE TABLE IF NOT EXISTS public.consignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  client_id uuid,
  serial_number text,
  imei text,
  condition product_condition NOT NULL DEFAULT 'used'::product_condition,
  consigned_date timestamp with time zone DEFAULT now(),
  expected_price numeric,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'sold'::text, 'returned'::text, 'expired'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  sold_date timestamp with time zone,
  sold_price numeric,
  CONSTRAINT consignments_pkey PRIMARY KEY (id),
  CONSTRAINT consignments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT consignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
  CONSTRAINT consignments_price_check CHECK (expected_price >= 0 AND (sold_price IS NULL OR sold_price >= 0))
);

-- Create indexes for consignments
CREATE INDEX IF NOT EXISTS idx_consignments_product_id ON public.consignments USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_consignments_client_id ON public.consignments USING btree (client_id);
CREATE INDEX IF NOT EXISTS idx_consignments_status ON public.consignments USING btree (status);
CREATE INDEX IF NOT EXISTS idx_consignments_serial ON public.consignments USING btree (serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consignments_imei ON public.consignments USING btree (imei) WHERE imei IS NOT NULL;

-- Trigger for consignments updated_at
CREATE TRIGGER update_updated_at_on_consignments 
    BEFORE UPDATE ON public.consignments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- HELPER VIEWS
-- =============================================

-- View for active promotions
CREATE OR REPLACE VIEW active_promotions AS
SELECT 
  p.*,
  pr.brand,
  pr.model,
  pr.storage,
  pr.category,
  pr.image_url,
  (p.max_units IS NULL OR p.units_sold < p.max_units) as has_units_available,
  CASE 
    WHEN p.max_units IS NOT NULL THEN p.max_units - p.units_sold
    ELSE NULL
  END as units_remaining
FROM promotions p
JOIN products pr ON p.product_id = pr.id
WHERE p.active = true
  AND p.starts_at <= now()
  AND p.ends_at >= now()
ORDER BY p.starts_at DESC;

-- View for pending consignments
CREATE OR REPLACE VIEW pending_consignments AS
SELECT 
  c.*,
  pr.brand,
  pr.model,
  pr.storage,
  pr.category,
  cl.name as client_name,
  cl.phone as client_phone
FROM consignments c
JOIN products pr ON c.product_id = pr.id
LEFT JOIN clients cl ON c.client_id = cl.id
WHERE c.status = 'pending'
ORDER BY c.consigned_date DESC;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;

-- Promotions policies (allow all for authenticated users for now)
CREATE POLICY "Allow all operations for authenticated users" ON public.promotions
    FOR ALL USING (auth.role() = 'authenticated');

-- Consignments policies (allow all for authenticated users for now)
CREATE POLICY "Allow all operations for authenticated users" ON public.consignments
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if a product has active promotion
CREATE OR REPLACE FUNCTION has_active_promotion(product_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM promotions 
    WHERE product_id = product_uuid 
      AND active = true 
      AND starts_at <= now() 
      AND ends_at >= now()
      AND (max_units IS NULL OR units_sold < max_units)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current promo price for a product
CREATE OR REPLACE FUNCTION get_promo_price(product_uuid uuid)
RETURNS numeric AS $$
DECLARE
  promo_price numeric;
BEGIN
  SELECT p.promo_price INTO promo_price
  FROM promotions p
  WHERE p.product_id = product_uuid 
    AND p.active = true 
    AND p.starts_at <= now() 
    AND p.ends_at >= now()
    AND (p.max_units IS NULL OR p.units_sold < p.max_units)
  ORDER BY p.starts_at DESC
  LIMIT 1;
  
  RETURN promo_price;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.promotions IS 'Promotional campaigns for products with time limits and unit caps';
COMMENT ON TABLE public.consignments IS 'Tracks devices taken on consignment from customers';
COMMENT ON COLUMN public.promotions.title IS 'Promotion title in default language';
COMMENT ON COLUMN public.promotions.title_he IS 'Promotion title in Hebrew';
COMMENT ON COLUMN public.promotions.max_units IS 'Maximum units available at promo price (NULL = unlimited)';
COMMENT ON COLUMN public.promotions.units_sold IS 'Number of units sold at promotional price';
COMMENT ON COLUMN public.consignments.serial_number IS 'Device serial number';
COMMENT ON COLUMN public.consignments.imei IS 'Device IMEI for phones';
COMMENT ON COLUMN public.consignments.status IS 'pending: waiting to sell, sold: sold to customer, returned: returned to client, expired: time limit reached';

