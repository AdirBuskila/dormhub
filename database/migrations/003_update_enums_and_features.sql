-- Migration: Update enums and add business features
-- Run this in your Supabase SQL Editor

-- 1. Add 'credit' to payment_method enum type
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'credit';

-- 2. Add 'portal' to order_status enum if it doesn't exist (for source field later)
-- Note: We'll use a text field for source instead of enum for flexibility
DO $$ 
BEGIN
    -- Check if order_source type exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_source') THEN
        CREATE TYPE order_source AS ENUM ('whatsapp', 'phone', 'portal');
    END IF;
END $$;

-- 3. Add 'pending', 'inspected', 'restocked', 'refurbish', 'scrap' for returns status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_status') THEN
        CREATE TYPE return_status AS ENUM ('pending', 'inspected', 'restocked', 'refurbish', 'scrap');
    END IF;
END $$;

-- 4. Safely rename stock to total_stock in products table
DO $$ 
BEGIN
    -- Check if stock column exists and total_stock doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'total_stock'
    ) THEN
        ALTER TABLE products RENAME COLUMN stock TO total_stock;
    END IF;
    
    -- If total_stock doesn't exist at all, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'total_stock'
    ) THEN
        ALTER TABLE products ADD COLUMN total_stock INTEGER DEFAULT 0;
    END IF;
    
    -- Ensure reserved_stock exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'reserved_stock'
    ) THEN
        ALTER TABLE products ADD COLUMN reserved_stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- 5. Add new columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promised_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT;

-- 6. Add new columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference TEXT;

-- 7. Add status column to returns table using the new enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'returns' AND column_name = 'status'
    ) THEN
        ALTER TABLE returns ADD COLUMN status return_status DEFAULT 'pending';
    END IF;
END $$;

-- 8. Add clerk_user_id to clients table if not exists
ALTER TABLE clients ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_clients_clerk_user_id ON clients(clerk_user_id);

-- 9. Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'undelivered', 'overdue_payment', 'reserved_stale')),
  ref_id UUID,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'danger')) DEFAULT 'warning',
  delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_delivered ON alerts(delivered);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- 10. Create outbound_messages table for WhatsApp stubs
CREATE TABLE IF NOT EXISTS outbound_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp')),
  to_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  template TEXT NOT NULL,
  payload JSONB NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbound_messages_sent ON outbound_messages(sent);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_created_at ON outbound_messages(created_at);

-- 11. Create view for available stock
CREATE OR REPLACE VIEW products_with_stock AS
SELECT 
  p.*,
  (p.total_stock - p.reserved_stock) AS available_stock
FROM products p;

-- 12. Create function to check low stock and create alerts
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  product_row RECORD;
BEGIN
  FOR product_row IN 
    SELECT id, brand, model, storage, total_stock, reserved_stock, min_stock_alert
    FROM products
    WHERE (total_stock - reserved_stock) <= min_stock_alert
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

-- 14. Add helpful comments
COMMENT ON TABLE alerts IS 'System alerts for low stock, overdue payments, undelivered orders';
COMMENT ON TABLE outbound_messages IS 'Queue for outbound WhatsApp messages';
COMMENT ON COLUMN products.total_stock IS 'Total physical inventory';
COMMENT ON COLUMN products.reserved_stock IS 'Stock reserved for orders';

-- Success!
SELECT '✅ Migration completed successfully!' AS status;
