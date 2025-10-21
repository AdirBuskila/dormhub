-- Local Businesses Migration
-- Creates tables for local businesses and student discounts

-- ============================================================================
-- TYPES
-- ============================================================================

-- Business category types
CREATE TYPE business_category AS ENUM ('restaurant', 'minimarket', 'bakery', 'supermarket', 'other');

-- Days of the week
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Local businesses near the dorms
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category business_category NOT NULL,
  description text,
  phone text,
  address text,
  logo_url text,
  website text,
  whatsapp text,
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,  -- For custom sorting
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Opening hours for businesses (flexible schedule)
CREATE TABLE public.business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  opens_at time,                    -- NULL if closed
  closes_at time,                   -- NULL if closed
  is_closed boolean DEFAULT false,  -- Explicitly mark closed days
  notes text,                       -- e.g., "Delivery only after 10 PM"
  created_at timestamptz DEFAULT now()
);

-- Student discounts offered by businesses
CREATE TABLE public.student_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,              -- e.g., "10% off all pizzas"
  description text,                 -- Details about the discount
  discount_type text,               -- e.g., "percentage", "fixed_amount", "buy_one_get_one"
  discount_value text,              -- e.g., "10%", "5 ILS", "BOGO"
  terms text,                       -- Terms and conditions
  valid_days day_of_week[],         -- Days when discount is valid (NULL = all days)
  valid_from time,                  -- Time range (NULL = all day)
  valid_until time,
  requires_student_id boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX businesses_category_idx ON public.businesses(category);
CREATE INDEX businesses_active_idx ON public.businesses(is_active);
CREATE INDEX businesses_display_order_idx ON public.businesses(display_order);

CREATE INDEX business_hours_business_idx ON public.business_hours(business_id);
CREATE INDEX business_hours_day_idx ON public.business_hours(day_of_week);

CREATE INDEX student_discounts_business_idx ON public.student_discounts(business_id);
CREATE INDEX student_discounts_active_idx ON public.student_discounts(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_discounts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active businesses
CREATE POLICY businesses_select_all ON public.businesses
  FOR SELECT USING (is_active = true);

-- Service role has full access (for admin management)
CREATE POLICY businesses_all_service ON public.businesses
  FOR ALL USING (auth.role() = 'service_role');

-- Anyone can view business hours
CREATE POLICY business_hours_select_all ON public.business_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_hours.business_id 
      AND is_active = true
    )
  );

-- Service role can manage hours
CREATE POLICY business_hours_all_service ON public.business_hours
  FOR ALL USING (auth.role() = 'service_role');

-- Anyone can view active discounts
CREATE POLICY student_discounts_select_all ON public.student_discounts
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = student_discounts.business_id 
      AND is_active = true
    )
  );

-- Service role can manage discounts
CREATE POLICY student_discounts_all_service ON public.student_discounts
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_discounts_updated_at BEFORE UPDATE ON public.student_discounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert the four businesses mentioned
INSERT INTO public.businesses (name, category, description, phone, address, display_order)
VALUES
  ('Tuvia''s Pizza', 'restaurant', 'Delicious pizza and Italian food right below the dorms', '02-123-4567', 'Ground floor, Building A', 1),
  ('Quick Stop', 'minimarket', 'Your local convenience store for snacks, drinks, and essentials', '02-234-5678', 'Ground floor, Building B', 2),
  ('Campus Bakery', 'bakery', 'Fresh bread, pastries, and coffee every morning', '02-345-6789', 'Ground floor, Building A', 3),
  ('Super Market', 'supermarket', 'Full-service supermarket for all your grocery needs', '02-456-7890', 'Ground floor, Building C', 4);

-- Add opening hours (example schedules)
-- Tuvia's Pizza (closed Friday night, open Saturday night after Shabbat)
INSERT INTO public.business_hours (business_id, day_of_week, opens_at, closes_at)
SELECT id, 'sunday'::day_of_week, '11:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Tuvia''s Pizza'
UNION ALL
SELECT id, 'monday'::day_of_week, '11:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Tuvia''s Pizza'
UNION ALL
SELECT id, 'tuesday'::day_of_week, '11:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Tuvia''s Pizza'
UNION ALL
SELECT id, 'wednesday'::day_of_week, '11:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Tuvia''s Pizza'
UNION ALL
SELECT id, 'thursday'::day_of_week, '11:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Tuvia''s Pizza'
UNION ALL
SELECT id, 'friday'::day_of_week, '11:00'::time, '15:00'::time FROM public.businesses WHERE name = 'Tuvia''s Pizza'
UNION ALL
SELECT id, 'saturday'::day_of_week, '20:00'::time, '23:59'::time FROM public.businesses WHERE name = 'Tuvia''s Pizza';

-- Quick Stop (open long hours every day)
INSERT INTO public.business_hours (business_id, day_of_week, opens_at, closes_at)
SELECT id, 'sunday'::day_of_week, '07:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Quick Stop'
UNION ALL
SELECT id, 'monday'::day_of_week, '07:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Quick Stop'
UNION ALL
SELECT id, 'tuesday'::day_of_week, '07:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Quick Stop'
UNION ALL
SELECT id, 'wednesday'::day_of_week, '07:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Quick Stop'
UNION ALL
SELECT id, 'thursday'::day_of_week, '07:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Quick Stop'
UNION ALL
SELECT id, 'friday'::day_of_week, '07:00'::time, '16:00'::time FROM public.businesses WHERE name = 'Quick Stop'
UNION ALL
SELECT id, 'saturday'::day_of_week, '20:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Quick Stop';

-- Campus Bakery (morning focused)
INSERT INTO public.business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
SELECT id, 'sunday'::day_of_week, '06:00'::time, '20:00'::time, false FROM public.businesses WHERE name = 'Campus Bakery'
UNION ALL
SELECT id, 'monday'::day_of_week, '06:00'::time, '20:00'::time, false FROM public.businesses WHERE name = 'Campus Bakery'
UNION ALL
SELECT id, 'tuesday'::day_of_week, '06:00'::time, '20:00'::time, false FROM public.businesses WHERE name = 'Campus Bakery'
UNION ALL
SELECT id, 'wednesday'::day_of_week, '06:00'::time, '20:00'::time, false FROM public.businesses WHERE name = 'Campus Bakery'
UNION ALL
SELECT id, 'thursday'::day_of_week, '06:00'::time, '20:00'::time, false FROM public.businesses WHERE name = 'Campus Bakery'
UNION ALL
SELECT id, 'friday'::day_of_week, '06:00'::time, '14:00'::time, false FROM public.businesses WHERE name = 'Campus Bakery'
UNION ALL
SELECT id, 'saturday'::day_of_week, NULL, NULL, true FROM public.businesses WHERE name = 'Campus Bakery';

-- Super Market (regular hours)
INSERT INTO public.business_hours (business_id, day_of_week, opens_at, closes_at)
SELECT id, 'sunday'::day_of_week, '08:00'::time, '22:00'::time FROM public.businesses WHERE name = 'Super Market'
UNION ALL
SELECT id, 'monday'::day_of_week, '08:00'::time, '22:00'::time FROM public.businesses WHERE name = 'Super Market'
UNION ALL
SELECT id, 'tuesday'::day_of_week, '08:00'::time, '22:00'::time FROM public.businesses WHERE name = 'Super Market'
UNION ALL
SELECT id, 'wednesday'::day_of_week, '08:00'::time, '22:00'::time FROM public.businesses WHERE name = 'Super Market'
UNION ALL
SELECT id, 'thursday'::day_of_week, '08:00'::time, '22:00'::time FROM public.businesses WHERE name = 'Super Market'
UNION ALL
SELECT id, 'friday'::day_of_week, '08:00'::time, '15:00'::time FROM public.businesses WHERE name = 'Super Market'
UNION ALL
SELECT id, 'saturday'::day_of_week, '20:00'::time, '23:00'::time FROM public.businesses WHERE name = 'Super Market';

-- Add student discounts (3 out of 4 offer discounts)
INSERT INTO public.student_discounts (business_id, title, description, discount_type, discount_value, requires_student_id)
SELECT id, 
  '10% Student Discount', 
  'Show your student ID and get 10% off your entire order!',
  'percentage',
  '10%',
  true
FROM public.businesses WHERE name = 'Tuvia''s Pizza';

INSERT INTO public.student_discounts (business_id, title, description, discount_type, discount_value, requires_student_id)
SELECT id,
  'Student Special: Buy 2 Get 1 Free',
  'Buy any 2 drinks or snacks and get the cheapest one free! Valid for students only.',
  'buy_one_get_one',
  'Buy 2 Get 1 Free',
  true
FROM public.businesses WHERE name = 'Quick Stop';

INSERT INTO public.student_discounts (business_id, title, description, discount_type, discount_value, requires_student_id)
SELECT id,
  '15% Off Fresh Baked Goods',
  'Students get 15% off all fresh bread, pastries, and baked goods!',
  'percentage',
  '15%',
  true
FROM public.businesses WHERE name = 'Campus Bakery';

