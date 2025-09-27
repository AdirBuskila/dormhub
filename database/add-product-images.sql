-- Add image URL column to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products ADD COLUMN image_url TEXT;

-- Add index for better performance when filtering by images
CREATE INDEX idx_products_image_url ON products(image_url) WHERE image_url IS NOT NULL;

-- Update existing products with placeholder image URLs (you can replace these with real URLs later)
UPDATE products SET image_url = CASE
  WHEN category = 'phone' AND brand = 'Apple' THEN 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop'
  WHEN category = 'phone' AND brand = 'Samsung' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
  WHEN category = 'phone' AND brand = 'Xiaomi' THEN 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop'
  WHEN category = 'tablet' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
  WHEN category = 'earphones' THEN 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
  WHEN category = 'accessories' THEN 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop'
END;

-- Add comment to the column
COMMENT ON COLUMN products.image_url IS 'URL to product image - can be external URL or path to uploaded file';
