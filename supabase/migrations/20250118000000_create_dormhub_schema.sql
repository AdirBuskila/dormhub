-- DormHub Core Schema Migration
-- Creates all tables, types, indexes, and RLS policies for marketplace and tips modules

-- ============================================================================
-- TYPES
-- ============================================================================

-- Listing types: what the user wants to do
CREATE TYPE listing_type AS ENUM ('sell', 'buy', 'swap', 'giveaway');

-- Condition of items
CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');

-- Listing status
CREATE TYPE listing_status AS ENUM ('active', 'reserved', 'sold', 'removed');

-- Tip approval status
CREATE TYPE tip_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles: linked to Clerk user via clerk_id
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text UNIQUE NOT NULL,
  full_name text,
  username text UNIQUE,
  room text,              -- Dorm room number (optional)
  phone text,
  avatar_url text,        -- Optional profile picture
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Marketplace listings
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type listing_type NOT NULL,
  title text NOT NULL,
  description text,
  price_ils numeric(10,2),          -- Nullable for giveaway/swap
  condition listing_condition,
  category text,                    -- Free text category
  tags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',       -- Array of image URLs
  status listing_status DEFAULT 'active',
  location text,                    -- Optional location detail
  view_count int DEFAULT 0,         -- Track views
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User favorites/bookmarks
CREATE TABLE public.favorites (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- Tips: user-submitted or admin-posted
CREATE TABLE public.tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  tags text[] DEFAULT '{}',
  helpful_count int DEFAULT 0,
  status tip_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tip helpfulness votes (prevent multiple votes from same user)
CREATE TABLE public.tip_votes (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tip_id uuid REFERENCES public.tips(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, tip_id)
);

-- Static info pages (admin-curated guides)
CREATE TABLE public.info_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,        -- URL-friendly identifier
  title text NOT NULL,
  body_md text NOT NULL,            -- Markdown content
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX profiles_clerk_id_idx ON public.profiles(clerk_id);
CREATE INDEX profiles_username_idx ON public.profiles(username);

-- Listings
CREATE INDEX listings_owner_idx ON public.listings(owner_id);
CREATE INDEX listings_status_idx ON public.listings(status);
CREATE INDEX listings_type_idx ON public.listings(type);
CREATE INDEX listings_category_idx ON public.listings(category);
CREATE INDEX listings_created_idx ON public.listings(created_at DESC);

-- Full-text search on listings
CREATE INDEX listings_search_idx ON public.listings 
  USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));

-- GIN index for tags
CREATE INDEX listings_tags_idx ON public.listings USING GIN (tags);

-- Tips
CREATE INDEX tips_status_idx ON public.tips(status);
CREATE INDEX tips_author_idx ON public.tips(author_id);
CREATE INDEX tips_tags_idx ON public.tips USING GIN (tags);
CREATE INDEX tips_created_idx ON public.tips(created_at DESC);

-- Info pages
CREATE INDEX info_pages_slug_idx ON public.info_pages(slug);
CREATE INDEX info_pages_published_idx ON public.info_pages(published);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.info_pages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Anyone can view profiles (for listing owner info)
CREATE POLICY profiles_select_all ON public.profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- ============================================================================
-- LISTINGS POLICIES
-- ============================================================================

-- Anyone can view active listings
CREATE POLICY listings_select_all ON public.listings
  FOR SELECT USING (true);

-- Authenticated users can create listings
CREATE POLICY listings_insert_auth ON public.listings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = listings.owner_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Owners can update their own listings
CREATE POLICY listings_update_own ON public.listings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = listings.owner_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Owners can delete their own listings
CREATE POLICY listings_delete_own ON public.listings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = listings.owner_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================================================
-- FAVORITES POLICIES
-- ============================================================================

-- Users can view their own favorites
CREATE POLICY favorites_select_own ON public.favorites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = favorites.user_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can add/remove their own favorites
CREATE POLICY favorites_insert_own ON public.favorites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = favorites.user_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY favorites_delete_own ON public.favorites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = favorites.user_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================================================
-- TIPS POLICIES
-- ============================================================================

-- Anyone can view approved tips
CREATE POLICY tips_select_approved ON public.tips
  FOR SELECT USING (status = 'approved');

-- Service role can view all tips (for admin)
CREATE POLICY tips_select_all_service ON public.tips
  FOR SELECT USING (auth.role() = 'service_role');

-- Authenticated users can submit tips
CREATE POLICY tips_insert_auth ON public.tips
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = tips.author_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Authors can update their own pending tips
CREATE POLICY tips_update_own_pending ON public.tips
  FOR UPDATE USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = tips.author_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Service role can update any tip (for admin approval)
CREATE POLICY tips_update_service ON public.tips
  FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================================================
-- TIP VOTES POLICIES
-- ============================================================================

-- Users can view their own votes
CREATE POLICY tip_votes_select_own ON public.tip_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = tip_votes.user_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can add their own votes
CREATE POLICY tip_votes_insert_own ON public.tip_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = tip_votes.user_id 
      AND clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================================================
-- INFO PAGES POLICIES
-- ============================================================================

-- Anyone can view published info pages
CREATE POLICY info_pages_select_published ON public.info_pages
  FOR SELECT USING (published = true);

-- Service role has full access (for admin management)
CREATE POLICY info_pages_all_service ON public.info_pages
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON public.tips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_info_pages_updated_at BEFORE UPDATE ON public.info_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY listings_storage_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings' AND
    auth.role() = 'authenticated'
  );

-- Allow users to view all public images
CREATE POLICY listings_storage_select ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');

-- Allow users to delete their own images
CREATE POLICY listings_storage_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

