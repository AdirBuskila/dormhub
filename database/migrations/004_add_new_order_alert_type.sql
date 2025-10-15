-- Migration: Add new_order alert type
-- This migration adds the 'new_order' alert type to the alerts table

-- Drop existing constraint
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_type_check;

-- Add new constraint with new_order type
ALTER TABLE alerts ADD CONSTRAINT alerts_type_check 
CHECK (type IN ('low_stock', 'undelivered', 'overdue_payment', 'reserved_stale', 'new_order'));

-- Add comment for documentation
COMMENT ON COLUMN alerts.type IS 'Type of alert: low_stock, undelivered, overdue_payment, reserved_stale, new_order';







