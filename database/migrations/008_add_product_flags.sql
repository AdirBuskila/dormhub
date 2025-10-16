-- Migration 008: Add is_runner and is_best_seller flags to products
-- Created: 2025-10-16
-- Description: Adds boolean flags for runner and best seller products to replace tag-based filtering

-- Add new boolean columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_runner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false;

-- Create indexes for the new columns for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_is_runner ON public.products USING btree (is_runner) WHERE is_runner = true;
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products USING btree (is_best_seller) WHERE is_best_seller = true;

-- Optional: Migrate existing data from tags to boolean fields
-- Uncomment if you want to automatically convert existing tag-based products

-- UPDATE public.products 
-- SET is_runner = true 
-- WHERE 'Runner' = ANY(tags);

-- UPDATE public.products 
-- SET is_best_seller = true 
-- WHERE 'Best Seller' = ANY(tags);

-- Add comment for documentation
COMMENT ON COLUMN public.products.is_runner IS 'Marks product as a "Runner" - frequently ordered, high velocity item';
COMMENT ON COLUMN public.products.is_best_seller IS 'Marks product as a "Best Seller" - top selling item';

