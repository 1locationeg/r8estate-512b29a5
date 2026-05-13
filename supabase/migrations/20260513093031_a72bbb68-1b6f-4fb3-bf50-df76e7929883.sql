CREATE OR REPLACE FUNCTION public.search_professionals(_q text)
RETURNS TABLE(slug text, full_name text, avatar_url text, headline text, location text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    regexp_replace(
      regexp_replace(lower(trim(p.full_name)), '[^a-z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ) AS slug,
    p.full_name,
    p.avatar_url,
    pp.headline,
    pp.location
  FROM public.profiles p
  JOIN public.user_account_kinds k
    ON k.user_id = p.user_id AND k.account_kind = 'professional'
  LEFT JOIN public.professional_pages pp ON pp.user_id = p.user_id
  WHERE p.full_name IS NOT NULL
    AND length(trim(p.full_name)) > 0
    AND (
      _q IS NULL
      OR length(trim(_q)) = 0
      OR p.full_name ILIKE '%' || _q || '%'
      OR COALESCE(pp.headline, '') ILIKE '%' || _q || '%'
      OR COALESCE(pp.location, '') ILIKE '%' || _q || '%'
    )
  ORDER BY (lower(p.full_name) LIKE lower(_q) || '%') DESC, p.full_name ASC
  LIMIT 8;
$$;

GRANT EXECUTE ON FUNCTION public.search_professionals(text) TO anon, authenticated;