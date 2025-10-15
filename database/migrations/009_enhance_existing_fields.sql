-- Migration: Enhance existing B2B fields with constraints and indexes
-- Run this in your Supabase SQL Editor

-- 1. Add constraints to existing fields
ALTER TABLE public.products 
  ADD CONSTRAINT IF NOT EXISTS products_importer_check 
  CHECK (importer IN ('official', 'parallel'));

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_is_promotion ON public.products(is_promotion);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_alert_threshold ON public.products(alert_threshold);
CREATE INDEX IF NOT EXISTS idx_products_purchase_price ON public.products(purchase_price);
CREATE INDEX IF NOT EXISTS idx_products_sale_price_default ON public.products(sale_price_default);

-- 3. Add indexes for client profile fields
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_city ON public.clients(city);
CREATE INDEX IF NOT EXISTS idx_clients_shop_name ON public.clients(shop_name);

-- 4. Update the best_sellers_60d view to include more details
CREATE OR REPLACE VIEW public.best_sellers_60d AS
SELECT
  oi.product_id,
  p.brand,
  p.model,
  p.storage,
  p.brand || ' ' || p.model || ' ' || p.storage AS name,
  SUM(oi.quantity)::int AS sold_count,
  SUM(oi.quantity * oi.price)::numeric AS revenue
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id
JOIN public.products p ON p.id = oi.product_id
WHERE o.created_at >= now() - interval '60 days'
  AND o.status IN ('delivered', 'closed')
GROUP BY oi.product_id, p.brand, p.model, p.storage
ORDER BY sold_count DESC;

-- 5. Create a view for low stock products
CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT 
  p.*,
  (p.total_stock - p.reserved_stock) AS available_stock
FROM public.products p
WHERE (p.total_stock - p.reserved_stock) <= p.alert_threshold;

-- 6. Add comments for documentation
COMMENT ON COLUMN public.products.purchase_price IS 'Cost price of the product';
COMMENT ON COLUMN public.products.sale_price_default IS 'Default selling price';
COMMENT ON COLUMN public.products.alert_threshold IS 'Stock level threshold for low stock alerts';
COMMENT ON COLUMN public.products.importer IS 'Import source: official or parallel';
COMMENT ON COLUMN public.products.warranty_provider IS 'Warranty provider name';
COMMENT ON COLUMN public.products.warranty_months IS 'Warranty period in months';
COMMENT ON COLUMN public.products.is_promotion IS 'Whether this product is on promotion';
COMMENT ON COLUMN public.products.tags IS 'Product tags for filtering and categorization';
COMMENT ON COLUMN public.clients.phone IS 'Client phone number';
COMMENT ON COLUMN public.clients.city IS 'Client city';
COMMENT ON COLUMN public.clients.shop_name IS 'Client shop name';
