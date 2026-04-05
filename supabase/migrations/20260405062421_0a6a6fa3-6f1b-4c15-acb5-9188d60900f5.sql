
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';

DROP VIEW IF EXISTS public.public_business_profiles;

CREATE VIEW public.public_business_profiles AS
  SELECT id, company_name, description, location, logo_url, website, specialties, year_established, categories, is_reviewable, employees, social_links, parent_id, created_at, updated_at
  FROM public.business_profiles;
