-- Create deals table for managing special offers and promotions
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Status & Priority
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  
  -- Pricing Tiers (supports up to 3 quantity-based price tiers)
  tier_1_qty INT NOT NULL DEFAULT 1,
  tier_1_price DECIMAL(10,2) NOT NULL,
  tier_2_qty INT,
  tier_2_price DECIMAL(10,2),
  tier_3_qty INT,
  tier_3_price DECIMAL(10,2),
  
  -- Expiration
  expiration_type VARCHAR(20) CHECK (expiration_type IN ('date', 'quantity', 'both', 'none')),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_quantity INT,
  sold_quantity INT DEFAULT 0,
  
  -- Payment Restrictions
  payment_methods TEXT[],
  payment_surcharge_check_month DECIMAL(10,2) DEFAULT 0,
  payment_surcharge_check_week DECIMAL(10,2) DEFAULT 0,
  payment_notes TEXT,
  
  -- Product Specifications
  allowed_colors TEXT[],
  required_importer VARCHAR(20),
  is_esim BOOLEAN,
  additional_specs JSONB,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_deals_active ON deals(is_active) WHERE is_active = true;
CREATE INDEX idx_deals_product ON deals(product_id);
CREATE INDEX idx_deals_expires ON deals(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_deals_priority ON deals(priority DESC);

-- Function to check if deal is still valid
CREATE OR REPLACE FUNCTION is_deal_valid(deal_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  deal_record RECORD;
BEGIN
  SELECT * INTO deal_record FROM deals WHERE id = deal_id;
  
  IF NOT deal_record.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check expiration by date
  IF deal_record.expiration_type IN ('date', 'both') AND deal_record.expires_at IS NOT NULL THEN
    IF NOW() > deal_record.expires_at THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check expiration by quantity
  IF deal_record.expiration_type IN ('quantity', 'both') AND deal_record.max_quantity IS NOT NULL THEN
    IF deal_record.sold_quantity >= deal_record.max_quantity THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get deal price for quantity
CREATE OR REPLACE FUNCTION get_deal_price(deal_id UUID, quantity INT) RETURNS DECIMAL AS $$
DECLARE
  deal_record RECORD;
BEGIN
  SELECT * INTO deal_record FROM deals WHERE id = deal_id;
  
  -- Return best tier price based on quantity
  IF deal_record.tier_3_qty IS NOT NULL AND quantity >= deal_record.tier_3_qty THEN
    RETURN deal_record.tier_3_price;
  ELSIF deal_record.tier_2_qty IS NOT NULL AND quantity >= deal_record.tier_2_qty THEN
    RETURN deal_record.tier_2_price;
  ELSE
    RETURN deal_record.tier_1_price;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_updated_at();

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active deals
CREATE POLICY "Anyone can view active deals"
  ON deals FOR SELECT
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage deals"
  ON deals FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE deals IS 'Stores special deals and promotions with tiered pricing and expiration rules';

