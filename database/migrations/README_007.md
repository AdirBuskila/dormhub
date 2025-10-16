# Migration 007: Promotions, Consignments & Hebrew Search

## Quick Start

### 1. Run the Migration

**In Supabase SQL Editor:**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `007_add_promotions_and_consignments.sql`
5. Paste and click **Run**

**Expected Output:**
```
Success. No rows returned
```

### 2. Verify Tables Created

Run this verification query:

```sql
-- Check tables exist
SELECT 
  'promotions' as table_name,
  count(*) as row_count
FROM promotions
UNION ALL
SELECT 
  'consignments' as table_name,
  count(*) as row_count
FROM consignments;
```

### 3. Test Helper Functions

```sql
-- Test promotion function (will return false if no promotions yet)
SELECT has_active_promotion(
  (SELECT id FROM products LIMIT 1)
);

-- View active promotions (empty if none created yet)
SELECT * FROM active_promotions;

-- View pending consignments (empty if none created yet)
SELECT * FROM pending_consignments;
```

### 4. Create Test Data (Optional)

```sql
-- Create a test promotion
INSERT INTO promotions (
  product_id,
  title,
  title_he,
  promo_price,
  starts_at,
  ends_at,
  max_units,
  active
) VALUES (
  (SELECT id FROM products WHERE brand = 'Apple' LIMIT 1),
  'Test Promotion',
  'מבצע בדיקה',
  2999,
  now(),
  now() + interval '30 days',
  10,
  true
);

-- Create a test consignment
INSERT INTO consignments (
  product_id,
  serial_number,
  condition,
  expected_price,
  status
) VALUES (
  (SELECT id FROM products WHERE brand = 'Apple' LIMIT 1),
  'TEST123456',
  'used',
  1500,
  'pending'
);
```

## What This Migration Adds

### Tables
- ✅ `promotions` - Time-limited promotional pricing
- ✅ `consignments` - Device consignment tracking

### Views
- ✅ `active_promotions` - Currently active promotions with product details
- ✅ `pending_consignments` - Pending consignments with product/client details

### Functions
- ✅ `has_active_promotion(uuid)` - Check if product has active promotion
- ✅ `get_promo_price(uuid)` - Get current promotional price for product

### Indexes
- Product ID indexes for fast lookups
- Status indexes for filtering
- Date range indexes for active promotion queries
- IMEI/Serial number indexes for consignment tracking

## Rollback (If Needed)

If you need to undo this migration:

```sql
-- Drop views
DROP VIEW IF EXISTS active_promotions;
DROP VIEW IF EXISTS pending_consignments;

-- Drop functions
DROP FUNCTION IF EXISTS has_active_promotion(uuid);
DROP FUNCTION IF EXISTS get_promo_price(uuid);

-- Drop tables (CASCADE will remove foreign keys)
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS consignments CASCADE;
```

## Next Steps

1. Deploy updated Next.js code to production
2. Test APIs with the test scripts in main documentation
3. Build UI components for promotion management
4. Build UI components for consignment tracking

## Troubleshooting

### Error: "relation already exists"

If you get this error, the table already exists. Either:
- Skip this migration, or
- Drop the existing table and re-run

### Error: "function already exists"

The migration uses `CREATE OR REPLACE FUNCTION` so this shouldn't happen. If it does:

```sql
DROP FUNCTION has_active_promotion(uuid);
DROP FUNCTION get_promo_price(uuid);
-- Then re-run migration
```

### Error: "permission denied"

Make sure you're running the query in Supabase SQL Editor with admin privileges, not through the API.

## Support

For detailed documentation, see:
`docs/PROMOTIONS_CONSIGNMENTS_HEBREW_SEARCH.md`

