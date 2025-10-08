-- Fix for new order alerts
-- Run this SQL in your Supabase SQL editor

-- 1. Update alerts table to allow new_order type
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_type_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_type_check 
CHECK (type IN ('low_stock', 'undelivered', 'overdue_payment', 'reserved_stale', 'new_order'));

-- 2. Check outbound_messages table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'outbound_messages' 
ORDER BY ordinal_position;

-- 3. If to_phone column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'outbound_messages' 
        AND column_name = 'to_phone'
    ) THEN
        ALTER TABLE outbound_messages ADD COLUMN to_phone text NOT NULL DEFAULT '';
    END IF;
END $$;

-- 4. Update any existing records with empty to_phone
UPDATE outbound_messages 
SET to_phone = '' 
WHERE to_phone IS NULL;

-- 5. Make to_phone NOT NULL if it isn't already
ALTER TABLE outbound_messages ALTER COLUMN to_phone SET NOT NULL;




