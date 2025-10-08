# Product Categories Update

## Changes Made

### 1. Updated TypeScript Types
Updated `src/types/database.ts` to include new categories:
- `iphone` - For iPhone products
- `samsung` - For Samsung products  
- `android_phone` - For other Android phones
- `smartwatch` - For smartwatches
- `chargers` - For charging accessories
- `cases` - For phone/device cases
- `accessories` - General accessories (existing)
- `tablet` - Tablets (existing)
- `earphones` - Earphones (existing)

### 2. Updated Components
- **InventoryManagement.tsx**: Updated category filter and form options, added brand filter
- **CustomerPortal.tsx**: Updated pricing logic to handle new categories
- **database/schema.sql**: Updated documentation to reflect new categories

### 3. Database Migration Required

**IMPORTANT**: You need to run the migration in Supabase SQL Editor:

```sql
-- Add new category values to the enum
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'iphone';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'samsung';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'android_phone';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'smartwatch';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'chargers';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'cases';
```

This SQL is also saved in: `database/migrations/005_add_new_product_categories.sql`

### 4. Pricing Structure
New mock pricing in CustomerPortal:
- iphone, samsung, android_phone: 500
- tablet: 400
- smartwatch: 300
- earphones: 100
- chargers: 30
- cases: 40
- accessories: 50

## Benefits
- More granular inventory categorization
- Better filtering and organization
- Brand-based filtering in addition to categories
- More accurate product classification

