-- Temporary: Allow ANY authenticated user to upload (for testing)
-- Run this in Supabase SQL Editor to test

DROP POLICY IF EXISTS "Authenticated users can upload tip images" ON storage.objects;

CREATE POLICY "Allow all authenticated uploads (TEST)"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tip-images');

-- After this works, we'll add back the user check





