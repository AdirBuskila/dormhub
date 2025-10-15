-- Migration: Add product enhancements for B2B improvements
-- Run this in your Supabase SQL Editor

-- 1. Add new product fields
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sale_price_default DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS importer TEXT CHECK (importer IN ('official', 'parallel')) DEFAULT 'official',
  ADD COLUMN IF NOT EXISTS warranty_provider TEXT,
  ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Update the products_with_stock view to include new fields
CREATE OR REPLACE VIEW products_with_stock AS
SELECT 
  p.*,
  (p.total_stock - p.reserved_stock) AS available_stock
FROM products p;

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_is_promotion ON products(is_promotion);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_alert_threshold ON products(alert_threshold);

-- 4. Update the low stock check function to use alert_threshold
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  product_row RECORD;
BEGIN
  FOR product_row IN 
    SELECT id, brand, model, storage, total_stock, reserved_stock, alert_threshold
    FROM products
    WHERE (total_stock - reserved_stock) <= alert_threshold
  LOOP
    -- Check if alert already exists for today
    IF NOT EXISTS (
      SELECT 1 FROM alerts
      WHERE type = 'low_stock'
        AND ref_id = product_row.id
        AND created_at::date = CURRENT_DATE
    ) THEN
      INSERT INTO alerts (type, ref_id, message, severity)
      VALUES (
        'low_stock',
        product_row.id,
        format('Low stock: %s %s %s - Available: %s, Threshold: %s',
          product_row.brand,
          product_row.model,
          product_row.storage,
          (product_row.total_stock - product_row.reserved_stock),
          product_row.alert_threshold
        ),
        CASE 
          WHEN (product_row.total_stock - product_row.reserved_stock) = 0 THEN 'danger'
          ELSE 'warning'
        END
      );
      alert_count := alert_count + 1;
    END IF;
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Add comments for documentation
COMMENT ON COLUMN products.purchase_price IS 'Cost price of the product';
COMMENT ON COLUMN products.sale_price_default IS 'Default selling price';
COMMENT ON COLUMN products.alert_threshold IS 'Stock level threshold for low stock alerts';
COMMENT ON COLUMN products.importer IS 'Import source: official or parallel';
COMMENT ON COLUMN products.warranty_provider IS 'Warranty provider name';
COMMENT ON COLUMN products.warranty_months IS 'Warranty period in months';
COMMENT ON COLUMN products.is_promotion IS 'Whether this product is on promotion';
COMMENT ON COLUMN products.tags IS 'Product tags for filtering and categorization';
