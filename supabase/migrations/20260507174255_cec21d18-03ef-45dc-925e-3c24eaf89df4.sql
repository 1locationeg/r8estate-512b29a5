-- 1. business_profiles — block anonymous read of PII columns
REVOKE SELECT (email, phone, license_url, social_links)
  ON public.business_profiles FROM anon;

-- 2. conversations — restrict direct INSERT to admins; users use find_or_create_conversation()
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Only admins can directly insert conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. community_votes — hide voter user_ids from anon
DROP POLICY IF EXISTS "Anyone can read votes" ON public.community_votes;
CREATE POLICY "Authenticated users can read votes"
  ON public.community_votes FOR SELECT TO authenticated USING (true);

-- 4. pending_reviews — remove blanket public SELECT, expose only via token
DROP POLICY IF EXISTS "Anyone can read pending reviews by token" ON public.pending_reviews;

CREATE OR REPLACE FUNCTION public.get_pending_review_by_token(_token text)
RETURNS TABLE (first_name text, project_name text, developer_id text, developer_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT first_name, project_name, developer_id, developer_name
  FROM public.pending_reviews
  WHERE token = _token AND is_used = false
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.get_pending_review_by_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_pending_review_used(_token text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _updated int;
BEGIN
  UPDATE public.pending_reviews SET is_used = true
   WHERE token = _token AND is_used = false;
  GET DIAGNOSTICS _updated = ROW_COUNT;
  RETURN _updated > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_pending_review_used(text) TO anon, authenticated;

-- 5. storage business-images — enforce per-user folder ownership
DROP POLICY IF EXISTS "Users can delete own business images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own business images" ON storage.objects;

CREATE POLICY "Users can delete own business images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-images'
         AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can update own business images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-images'
         AND (storage.foldername(name))[1] = (auth.uid())::text)
  WITH CHECK (bucket_id = 'business-images'
              AND (storage.foldername(name))[1] = (auth.uid())::text);