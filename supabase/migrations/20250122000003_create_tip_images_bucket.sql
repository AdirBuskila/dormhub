-- Create storage bucket for tip images

-- Create tip-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tip-images', 'tip-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images (Clerk JWT)
CREATE POLICY "Authenticated users can upload tip images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tip-images' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
);

-- Allow authenticated users to update their own images (Clerk JWT)
CREATE POLICY "Users can update own tip images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tip-images' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
);

-- Allow authenticated users to delete their own images (Clerk JWT)
CREATE POLICY "Users can delete own tip images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tip-images' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
);

-- Allow public read access to all tip images
CREATE POLICY "Public can view tip images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tip-images');

