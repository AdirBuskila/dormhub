# Migration 010: Add Payment Method to Orders

## Purpose
Add a dedicated `payment_method` column to the `orders` table to properly track customer payment preferences.

## Changes

### 1. New Column
- **Table**: `orders`
- **Column**: `payment_method` (TEXT, nullable)
- **Purpose**: Store the payment method selected by the customer

### 2. Payment Method Values
- `cash` - Cash payment
- `credit` - Credit card
- `checks` - Check payment
- `Other: [custom text]` - Custom payment method with description

### 3. Index Added
- `idx_orders_payment_method` - For efficient filtering and reporting by payment method

### 4. Data Migration
- Automatically extracts payment method from existing `notes` field
- Preserves historical data where payment method was stored in notes

## How to Apply

### Using Supabase Dashboard:
1. Go to SQL Editor
2. Paste the contents of `010_add_payment_method_to_orders.sql`
3. Click "Run"

### Using Command Line:
```bash
psql -h [your-supabase-host] -U postgres -d postgres -f database/migrations/010_add_payment_method_to_orders.sql
```

## Rollback (if needed)
```sql
-- Remove the index
DROP INDEX IF EXISTS public.idx_orders_payment_method;

-- Remove the column
ALTER TABLE public.orders DROP COLUMN IF EXISTS payment_method;
```

## Testing
After applying, verify with:
```sql
-- Check that column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_method';

-- Check migrated data
SELECT payment_method, COUNT(*) 
FROM orders 
WHERE payment_method IS NOT NULL 
GROUP BY payment_method;
```

## Notes
- This migration is backward compatible
- Existing orders will have NULL payment_method if not specified in notes
- New orders will populate this field automatically from the app
- The notes field can still contain additional information about the payment

