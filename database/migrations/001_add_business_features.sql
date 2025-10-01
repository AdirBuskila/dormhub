-- Migration: Add business intelligence features
-- Run this in your Supabase SQL Editor

-- 1. Update products table with stock management
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reserved_stock INTEGER DEFAULT 0;

-- Rename stock to total_stock if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) THEN
        ALTER TABLE products RENAME COLUMN stock TO total_stock;
    END IF;
END $$;

-- 2. Update orders table with new fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promised_date DATE,
  ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('whatsapp', 'phone', 'portal'));

-- 3. Update payments table with new fields
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS reference TEXT;

-- Update payment method constraint to include 'credit'
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check 
  CHECK (method IN ('cash', 'transfer', 'check', 'credit'));

-- 4. Update returns table with status field
ALTER TABLE returns
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'inspected', 'restocked', 'refurbish', 'scrap')) DEFAULT 'pending';

-- 5. Create alerts table
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

-- 6. Create outbound_messages table for WhatsApp stubs
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

-- 7. Create view for available stock
CREATE OR REPLACE VIEW products_with_stock AS
SELECT 
  p.*,
  (p.total_stock - p.reserved_stock) AS available_stock
FROM products p;

-- 8. Create function to check low stock and create alerts
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

-- 9. Enable RLS on new tables
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_messages ENABLE ROW LEVEL SECURITY;

-- 10. Create policies for development (allow all operations)
CREATE POLICY "Allow all operations for development" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow all operations for development" ON outbound_messages FOR ALL USING (true);

-- 11. Add comments for documentation
COMMENT ON TABLE alerts IS 'System alerts for low stock, overdue payments, undelivered orders';
COMMENT ON TABLE outbound_messages IS 'Queue for outbound WhatsApp messages';
COMMENT ON COLUMN products.total_stock IS 'Total physical inventory';
COMMENT ON COLUMN products.reserved_stock IS 'Stock reserved for orders';
COMMENT ON COLUMN orders.promised_date IS 'Promised delivery date to customer';
COMMENT ON COLUMN orders.source IS 'How the order was created (whatsapp, phone, portal)';
COMMENT ON COLUMN payments.reference IS 'Check number, transfer ID, or other payment reference';
