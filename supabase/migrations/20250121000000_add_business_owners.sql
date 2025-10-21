-- Add Business Owners
-- Links businesses to Clerk users so they can manage their own business

-- Add owner_clerk_id to businesses table
ALTER TABLE public.businesses 
ADD COLUMN owner_clerk_id text;

-- Create index for faster lookups
CREATE INDEX businesses_owner_clerk_id_idx ON public.businesses(owner_clerk_id);

-- Update RLS policies to allow business owners to manage their own business
-- Business owners can view and update their own business
CREATE POLICY businesses_owner_select ON public.businesses
  FOR SELECT USING (owner_clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY businesses_owner_update ON public.businesses
  FOR UPDATE USING (owner_clerk_id = auth.jwt() ->> 'sub');

-- Business hours: owners can manage their own business hours
CREATE POLICY business_hours_owner_all ON public.business_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_hours.business_id 
      AND owner_clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Student discounts: owners can manage their own discounts
CREATE POLICY student_discounts_owner_all ON public.student_discounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = student_discounts.business_id 
      AND owner_clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- NOTE: To assign businesses to owners, run UPDATE queries like:
-- UPDATE public.businesses SET owner_clerk_id = 'user_xxx' WHERE name = 'Tuvia''s Pizza';

