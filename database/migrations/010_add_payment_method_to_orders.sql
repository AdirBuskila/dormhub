-- Migration 010: Add payment_method column to orders table
-- This allows us to track how customers prefer to pay for their orders

-- Add payment_method column to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_method TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method selected by customer: cash, credit, checks, or other (with custom text)';

-- Create index for faster filtering by payment method
CREATE INDEX IF NOT EXISTS idx_orders_payment_method 
ON public.orders USING btree (payment_method);

-- Update existing orders to extract payment method from notes if possible
-- This is optional but helps with data migration
UPDATE public.orders
SET payment_method = 
  CASE 
    WHEN notes LIKE '%Payment Method: cash%' THEN 'cash'
    WHEN notes LIKE '%Payment Method: credit%' THEN 'credit'
    WHEN notes LIKE '%Payment Method: checks%' THEN 'checks'
    WHEN notes LIKE '%Payment Method: Other:%' THEN regexp_replace(
      substring(notes from 'Payment Method: Other: ([^\n]+)'), 
      '^\s+|\s+$', 
      '', 
      'g'
    )
    ELSE NULL
  END
WHERE notes LIKE '%Payment Method:%';

