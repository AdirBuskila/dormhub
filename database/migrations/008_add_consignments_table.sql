-- Migration: Add consignments table for tracking consignment inventory
-- Run this in your Supabase SQL Editor

-- 1. Create consignments table
CREATE TABLE IF NOT EXISTS consignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consignments_client_id ON consignments(client_id);
CREATE INDEX IF NOT EXISTS idx_consignments_product_id ON consignments(product_id);
CREATE INDEX IF NOT EXISTS idx_consignments_created_at ON consignments(created_at);

-- 3. Create updated_at trigger
CREATE TRIGGER update_updated_at_on_consignments 
  BEFORE UPDATE ON consignments 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for development (allow all operations)
CREATE POLICY "Allow all operations for development" ON consignments FOR ALL USING (true);

-- 6. Add comments for documentation
COMMENT ON TABLE consignments IS 'Consignment inventory tracking per client';
COMMENT ON COLUMN consignments.client_id IS 'Client who has the consignment';
COMMENT ON COLUMN consignments.product_id IS 'Product being consigned';
COMMENT ON COLUMN consignments.quantity IS 'Quantity of product consigned';
COMMENT ON COLUMN consignments.notes IS 'Additional notes about the consignment';
