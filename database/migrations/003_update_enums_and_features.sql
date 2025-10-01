-- Migration: Update enums and add clerk_user_id
-- Run this in your Supabase SQL Editor

-- 1. Update product_category enum to include more categories
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'tablet';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'earphones';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'accessories';

-- 2. Update order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'closed';

-- 3. Update payment_method enum
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cash';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'transfer';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'check';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'credit';

-- 4. Add new enum types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_source') THEN
        CREATE TYPE order_source AS ENUM ('whatsapp', 'phone', 'portal');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
        CREATE TYPE alert_type AS ENUM ('low_stock', 'undelivered', 'overdue_payment', 'reserved_stale');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
        CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'danger');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_status') THEN
        CREATE TYPE return_status AS ENUM ('pending', 'inspected', 'restocked', 'refurbish', 'scrap');
    END IF;
END $$;

-- 5. Update orders table to use order_source enum
ALTER TABLE orders 
  ALTER COLUMN source TYPE order_source USING source::order_source;

-- 6. Update returns table to use return_status enum
ALTER TABLE returns 
  ALTER COLUMN status TYPE return_status USING status::return_status;

-- 7. Update alerts table to use proper enums
ALTER TABLE alerts 
  ALTER COLUMN type TYPE alert_type USING type::alert_type,
  ALTER COLUMN severity TYPE alert_severity USING severity::alert_severity;

-- 8. Add clerk_user_id to clients table if not exists
ALTER TABLE clients ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Create index for clerk_user_id
CREATE INDEX IF NOT EXISTS idx_clients_clerk_user_id ON clients(clerk_user_id);

-- 9. Add email column to clients table if not exists
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;

-- 10. Update products table with image_url if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 11. Create updated view for products with stock
CREATE OR REPLACE VIEW products_with_stock AS
SELECT 
  p.*,
  (p.total_stock - COALESCE(p.reserved_stock, 0)) AS available_stock
FROM products p;

-- 12. Update function to handle new stock structure
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  product_row RECORD;
BEGIN
  FOR product_row IN 
    SELECT id, brand, model, storage, total_stock, COALESCE(reserved_stock, 0) as reserved_stock, min_stock_alert
    FROM products
    WHERE (total_stock - COALESCE(reserved_stock, 0)) <= min_stock_alert
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
        format('Low stock: %s %s %s - Available: %s, Min: %s',
          product_row.brand,
          product_row.model,
          product_row.storage,
          (product_row.total_stock - product_row.reserved_stock),
          product_row.min_stock_alert
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

-- 13. Enable RLS on new tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow all operations for development" ON alerts;
        CREATE POLICY "Allow all operations for development" ON alerts FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'outbound_messages') THEN
        ALTER TABLE outbound_messages ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow all operations for development" ON outbound_messages;
        CREATE POLICY "Allow all operations for development" ON outbound_messages FOR ALL USING (true);
    END IF;
END $$;

-- 14. Add comments for documentation
COMMENT ON COLUMN clients.clerk_user_id IS 'Clerk authentication user ID - links to Clerk user';
COMMENT ON COLUMN clients.email IS 'Client email address';
COMMENT ON COLUMN products.image_url IS 'URL to product image';
