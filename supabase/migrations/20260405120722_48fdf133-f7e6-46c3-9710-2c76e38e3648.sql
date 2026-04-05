
-- Add cover_image_url column
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Recreate public_business_profiles view to include cover_image_url
DROP VIEW IF EXISTS public.public_business_profiles;
CREATE VIEW public.public_business_profiles WITH (security_invoker = true) AS
SELECT id, company_name, description, location, logo_url, cover_image_url, website, specialties, year_established, categories, is_reviewable, employees, social_links, parent_id, created_at, updated_at
FROM business_profiles;

-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business-images bucket
CREATE POLICY "Anyone can view business images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-images');

CREATE POLICY "Users can update own business images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'business-images');

CREATE POLICY "Users can delete own business images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-images');
