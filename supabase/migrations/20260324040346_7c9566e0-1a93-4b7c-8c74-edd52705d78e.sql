
CREATE OR REPLACE FUNCTION public.generate_embed_token()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT substr(md5(random()::text || now()::text), 1, 12)
$$;
