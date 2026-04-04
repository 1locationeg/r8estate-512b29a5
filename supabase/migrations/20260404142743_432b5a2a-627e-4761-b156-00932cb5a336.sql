
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  user_id, full_name, avatar_url, buyer_type, interests, 
  identity_verified, kyc_verified, identity_provider, created_at
FROM public.profiles;

DROP VIEW IF EXISTS public.public_business_profiles;
CREATE VIEW public.public_business_profiles
WITH (security_invoker = true)
AS
SELECT 
  id, company_name, description, logo_url, is_reviewable, parent_id,
  social_links, website, specialties, employees, year_established, location,
  created_at, updated_at
FROM public.business_profiles;
