# Migration 009: Update Product Flags (Runners & Best Sellers)

## Overview
This migration marks realistic products as **Runners** and **Best Sellers** based on 2025 market trends and typical mobile retail patterns.

## Product Categories

### 🏃 Runners (Fast-Moving Products)
Products that are **brand new in 2025** and have **high demand**:
- **iPhone 17 Series** - Latest Apple flagship (Pro Max, Pro, Air, base)
- **iPhone 16 Pro Models** - Still hot sellers
- **Galaxy S25 Series** - Latest Samsung flagship (Ultra, Plus, base)
- **AirPods Pro 3** - Newest premium earphones
- **Galaxy Buds 3 Pro** - Latest Samsung earphones
- **Apple Watch Series 10 & Ultra 2** - Latest smartwatches

### ⭐ Best Sellers (Consistently Popular)
Products with **proven sales track record** and **good value**:
- **iPhone 16/15/13 Series** - Sweet spot for price/performance
- **iPhone 14 Pro Models** - Still popular at reduced prices
- **Galaxy S24 Series & FE** - Previous flagship + Fan Edition
- **Galaxy A-Series** - Mid-range champions (A56, A36, A55, A26, A16)
- **Popular Earphones** - AirPods 4, AirPods Pro 2, Galaxy Buds FE, JBL models
- **Tablets** - iPad models and Galaxy Tab A9 series
- **Budget Phones** - Redmi Note 14 series, Galaxy A06

### 🚀 Both Runner AND Best Seller
Premium products that are **NEW** and **selling extremely well**:
- iPhone 17 Series (all models)
- iPhone 16 Pro Max & Pro
- Galaxy S25 Series (all models)

## How to Run

1. **Apply the migration:**
   ```sql
   -- Copy and paste the entire 009_update_product_flags.sql into Supabase SQL Editor
   -- Click "Run"
   ```

2. **Verify the results:**
   ```sql
   -- See which products are marked as runners/best sellers
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
   ```

3. **Count the results:**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE is_runner = true) as runner_count,
     COUNT(*) FILTER (WHERE is_best_seller = true) as best_seller_count,
     COUNT(*) FILTER (WHERE is_runner = true AND is_best_seller = true) as both_count
   FROM public.products;
   ```

## Expected Results

After running this migration, you should see:
- **~30-40 Runners** - Latest flagship models from 2025
- **~80-100 Best Sellers** - Proven products across all price ranges
- **~15-20 Both** - Premium products that are new AND selling extremely well

## Business Impact

### For Customers (New Order Page)
- **"Runner" Filter** - Shows only the hottest new products that just launched
- **"Best Seller" Filter** - Shows proven products with consistent sales
- **Quick Filter Chips** - Easy access to trending products

### For Admin (Inventory Management)
- Quick identification of products that need **priority restocking**
- Better understanding of which products drive **most revenue**
- Data-driven decisions for **purchasing and promotions**

## Rollback

If you need to reset all flags:
```sql
UPDATE public.products 
SET is_runner = false, is_best_seller = false;
```

## Notes

- This is based on **realistic 2025 market trends**
- **Runners** typically change every 6-12 months (new product releases)
- **Best Sellers** are more stable but should be reviewed quarterly
- You can manually adjust flags for specific products in the admin panel
- Consider creating a scheduled job to automatically expire "runner" status after 6 months

## Future Enhancements

Consider adding:
1. **Auto-expiry**: Runners automatically become regular products after 6 months
2. **Sales Analytics**: Mark best sellers based on actual sales data
3. **Seasonal Trends**: Mark products as "Back to School" or "Holiday Special"
4. **Admin UI**: Allow admins to toggle these flags without SQL

