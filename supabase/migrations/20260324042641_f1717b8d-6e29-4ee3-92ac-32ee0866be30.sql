
-- Add image_urls column to community_posts
ALTER TABLE public.community_posts ADD COLUMN image_urls text[] DEFAULT '{}'::text[];

-- Add link_url column to community_posts
ALTER TABLE public.community_posts ADD COLUMN link_url text;

-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('community-images', 'community-images', true, 5242880);

-- Storage RLS: anyone can view community images
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'community-images');

-- Storage RLS: authenticated users can upload community images
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-images');

-- Storage RLS: users can delete own community images
CREATE POLICY "Users can delete own community images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-images' AND (storage.foldername(name))[1] = auth.uid()::text);
