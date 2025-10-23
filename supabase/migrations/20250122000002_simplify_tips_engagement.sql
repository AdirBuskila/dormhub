-- Simplify tips engagement system
-- Remove redundant tip_likes table and use tip_votes for everything
-- Add flag_count to track reports

-- Drop tip_likes table (redundant with tip_votes)
DROP TABLE IF EXISTS public.tip_likes CASCADE;

-- Remove likes_count column from tips
ALTER TABLE public.tips
  DROP COLUMN IF EXISTS likes_count;

-- Add flag_count to tips table
ALTER TABLE public.tips
  ADD COLUMN IF NOT EXISTS flag_count int DEFAULT 0;

-- Create index for flag_count
CREATE INDEX IF NOT EXISTS tips_flag_count_idx ON public.tips(flag_count);

-- Update tip_votes policies to be more permissive for viewing
-- (Already has good policies, but let's ensure they're optimal)

-- Comment for documentation
COMMENT ON COLUMN public.tips.helpful_count IS 'Number of helpful votes this tip has received';
COMMENT ON COLUMN public.tips.flag_count IS 'Number of times this tip has been flagged/reported';
COMMENT ON TABLE public.tip_votes IS 'User votes marking tips as helpful';





