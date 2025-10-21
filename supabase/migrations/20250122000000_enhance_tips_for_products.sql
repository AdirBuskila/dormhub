-- Add image and product support to tips table
-- This allows tips to include images and product recommendations

ALTER TABLE public.tips
  ADD COLUMN images text[] DEFAULT '{}',
  ADD COLUMN is_product_tip boolean DEFAULT false,
  ADD COLUMN product_link text,
  ADD COLUMN estimated_cost_ils numeric(10,2),
  ADD COLUMN suitable_for text[] DEFAULT '{}';  -- Array like ['single', 'couple', 'single-balcony']

-- Add index for product tips
CREATE INDEX tips_is_product_idx ON public.tips(is_product_tip);

-- Comment for documentation
COMMENT ON COLUMN public.tips.images IS 'Array of image URLs for the tip';
COMMENT ON COLUMN public.tips.is_product_tip IS 'Whether this tip recommends a specific product';
COMMENT ON COLUMN public.tips.product_link IS 'URL to the product (Amazon, local store, etc.)';
COMMENT ON COLUMN public.tips.estimated_cost_ils IS 'Estimated cost in Israeli Shekels';
COMMENT ON COLUMN public.tips.suitable_for IS 'Apartment types this product fits: single, couple, single-balcony, etc.';


