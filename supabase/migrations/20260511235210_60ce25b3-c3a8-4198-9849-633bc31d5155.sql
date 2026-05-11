CREATE OR REPLACE FUNCTION public.list_professional_slugs()
RETURNS TABLE(slug text, updated_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    regexp_replace(
      regexp_replace(lower(trim(p.full_name)), '[^a-z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ) AS slug,
    COALESCE(pp.updated_at, p.updated_at) AS updated_at
  FROM public.profiles p
  JOIN public.user_account_kinds k ON k.user_id = p.user_id AND k.account_kind = 'professional'
  LEFT JOIN public.professional_pages pp ON pp.user_id = p.user_id
  WHERE p.full_name IS NOT NULL AND length(trim(p.full_name)) > 0;
$$;

GRANT EXECUTE ON FUNCTION public.list_professional_slugs() TO anon, authenticated;