-- ========================================
-- Migration 009: Update Product Flags (Runners & Best Sellers)
-- Description: Mark realistic 2025 products as runners and best sellers
-- ========================================

-- RUNNERS: Fast-moving, high-demand NEW products in 2025
-- These are the latest flagship models that everyone wants

-- iPhone 17 Series (2025 Latest - Runners AND Best Sellers)
UPDATE public.products 
SET is_runner = true, is_best_seller = true
WHERE brand = 'Apple' AND model LIKE 'iPhone 17%';

-- iPhone 16 Pro Models (Still hot sellers in 2025)
UPDATE public.products 
SET is_runner = true, is_best_seller = true
WHERE brand = 'Apple' AND model IN ('iPhone 16 Pro Max', 'iPhone 16 Pro');

-- Galaxy S25 Series (2025 Latest Samsung - Runners AND Best Sellers)
UPDATE public.products 
SET is_runner = true, is_best_seller = true
WHERE brand = 'Samsung' AND model LIKE 'Galaxy S25%';

-- Latest Premium Earphones (Runners)
UPDATE public.products 
SET is_runner = true
WHERE (brand = 'Apple' AND model = 'AirPods Pro 3')
   OR (brand = 'Samsung' AND model = 'Galaxy Buds 3 Pro');

-- Latest Smartwatches (Runners)
UPDATE public.products 
SET is_runner = true
WHERE (brand = 'Apple' AND model = 'Apple Watch Series 10')
   OR (brand = 'Apple' AND model = 'Apple Watch Ultra 2');

-- BEST SELLERS: Consistently popular products with proven sales
-- These are the sweet-spot products that sell steadily

-- iPhone 16 Base Models (Best price-to-performance)
UPDATE public.products 
SET is_best_seller = true
WHERE brand = 'Apple' AND model IN ('iPhone 16', 'iPhone 16 Plus', 'iPhone 16 e');

-- iPhone 15 Models (Price-to-performance sweet spot after iPhone 16/17 release)
UPDATE public.products 
SET is_best_seller = true
WHERE brand = 'Apple' AND model LIKE 'iPhone 15%';

-- iPhone 14 Pro Models (Still popular at reduced prices)
UPDATE public.products 
SET is_best_seller = true
WHERE brand = 'Apple' AND model IN ('iPhone 14 Pro Max', 'iPhone 14 Pro');

-- iPhone 13 (Budget-friendly best seller)
UPDATE public.products 
SET is_best_seller = true
WHERE brand = 'Apple' AND model LIKE 'iPhone 13%' AND model NOT LIKE '%CPO%';

-- Samsung Galaxy S24 FE (Fan Edition - always a best seller)
UPDATE public.products 
SET is_best_seller = true
WHERE brand = 'Samsung' AND model = 'Galaxy S24 FE';

-- Samsung Galaxy S24 Series (Previous flagship, still selling well)
UPDATE public.products 
SET is_best_seller = true
WHERE brand = 'Samsung' AND model LIKE 'Galaxy S24%';

-- Samsung Galaxy A-Series (Mid-range best sellers)
UPDATE public.products 
SET is_best_seller = true
WHERE brand = 'Samsung' AND model IN ('Galaxy A56', 'Galaxy A36', 'Galaxy A55', 'Galaxy A26', 'Galaxy A16');

-- Popular Earphones (Best Sellers)
UPDATE public.products 
SET is_best_seller = true
WHERE (brand = 'Apple' AND model IN ('AirPods 4', 'AirPods Pro 2', 'AirPods 4 ANC'))
   OR (brand = 'Samsung' AND model IN ('Galaxy Buds FE', 'Galaxy Buds 3'))
   OR (brand = 'JBL' AND model IN ('Tune Beam', 'Wave Beam'));

-- Popular Tablets (Best Sellers)
UPDATE public.products 
SET is_best_seller = true
WHERE (brand = 'Apple' AND model LIKE 'iPad%')
   OR (brand = 'Samsung' AND model LIKE 'Galaxy Tab A9%');

-- Popular Budget Phones (Best Sellers)
UPDATE public.products 
SET is_best_seller = true
WHERE (brand = 'Xiaomi' AND model IN ('Redmi Note 14', 'Redmi Note 14 Pro'))
   OR (brand = 'Samsung' AND model = 'Galaxy A06');

-- ========================================
-- Verification Query (run this to check the results)
-- ========================================
/*
SELECT 
  brand,
  model,
  storage,
  is_runner,
  is_best_seller,
  CASE 
    WHEN is_runner AND is_best_seller THEN 'Both Runner & Best Seller'
    WHEN is_runner THEN 'Runner Only'
    WHEN is_best_seller THEN 'Best Seller Only'
    ELSE 'Regular Product'
  END as product_type
FROM public.products
WHERE is_runner = true OR is_best_seller = true
ORDER BY 
  brand,
  CASE 
    WHEN is_runner AND is_best_seller THEN 1
    WHEN is_runner THEN 2
    WHEN is_best_seller THEN 3
  END,
  model,
  storage;
*/

