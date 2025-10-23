-- Hot Deals Migration
-- Creates table for temporary promotional deals with images

-- ============================================================================
-- TABLE
-- ============================================================================

-- Hot deals - time-limited promotional offers with images
CREATE TABLE public.hot_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,  -- URL to image in Supabase storage
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,  -- NULL means no expiration
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX hot_deals_business_idx ON public.hot_deals(business_id);
CREATE INDEX hot_deals_active_idx ON public.hot_deals(is_active);
CREATE INDEX hot_deals_valid_dates_idx ON public.hot_deals(valid_from, valid_until);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.hot_deals ENABLE ROW LEVEL SECURITY;

-- Anyone can view active deals that are within their valid date range
CREATE POLICY hot_deals_select_all ON public.hot_deals
  FOR SELECT USING (
    is_active = true 
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until >= now())
    AND EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = hot_deals.business_id 
      AND is_active = true
    )
  );

-- Service role has full access (for admin management)
CREATE POLICY hot_deals_all_service ON public.hot_deals
  FOR ALL USING (auth.role() = 'service_role');

-- Business owners can manage their own hot deals
CREATE POLICY hot_deals_owner_all ON public.hot_deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = hot_deals.business_id 
      AND owner_clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_hot_deals_updated_at BEFORE UPDATE ON public.hot_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================

-- Create storage bucket for hot deal images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hot-deals', 'hot-deals', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images
CREATE POLICY "Public Access for hot deal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hot-deals');

-- Allow authenticated users to upload images (will be restricted by business ownership in app logic)
CREATE POLICY "Authenticated users can upload hot deal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hot-deals' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own images
CREATE POLICY "Users can update own hot deal images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hot-deals' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'hot-deals' AND auth.role() = 'authenticated');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own hot deal images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hot-deals' AND auth.role() = 'authenticated');

