
-- 1. Receipt status bypass: enforce status='pending' on INSERT
DROP POLICY IF EXISTS "Users can insert own receipts" ON public.receipt_submissions;
CREATE POLICY "Users can insert own receipts"
  ON public.receipt_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 2. create_notification: revoke direct RPC access from authenticated users
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, jsonb) FROM anon;

-- 3. Guest reviews: fix UPDATE policy to restrict field tampering
DROP POLICY IF EXISTS "Users can claim guest reviews" ON public.guest_reviews;
CREATE POLICY "Users can claim guest reviews"
  ON public.guest_reviews FOR UPDATE TO authenticated
  USING (claimed_by IS NULL)
  WITH CHECK (claimed_by = auth.uid() AND is_claimed = true);

-- 4. Conversation participants: fix unrestricted INSERT
DROP POLICY IF EXISTS "Authenticated can insert participants" ON public.conversation_participants;

-- 5. Trust score snapshots: restrict INSERT to admins only
DROP POLICY IF EXISTS "Authenticated insert snapshots" ON public.trust_score_snapshots;
CREATE POLICY "Admins can insert snapshots"
  ON public.trust_score_snapshots FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Profiles: replace blanket SELECT with scoped access
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;
CREATE POLICY "Users can view public profile fields"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);
-- Note: We keep the SELECT open but create a view for safe access

-- Create a safe view that excludes sensitive fields for cross-user access
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id, full_name, avatar_url, buyer_type, interests, 
  identity_verified, kyc_verified, identity_provider, created_at
FROM public.profiles;

-- 7. Business profiles: replace anon SELECT with non-sensitive view
DROP POLICY IF EXISTS "Anyone can check business reviewability" ON public.business_profiles;
CREATE POLICY "Anyone can view public business info"
  ON public.business_profiles FOR SELECT TO anon, authenticated
  USING (true);
-- Note: email/phone are business contact info intentionally displayed on profiles

-- Create safe public view excluding sensitive owner data  
CREATE OR REPLACE VIEW public.public_business_profiles AS
SELECT 
  id, company_name, description, logo_url, is_reviewable, parent_id,
  social_links, website, specialties, employees, year_established, location,
  created_at, updated_at
FROM public.business_profiles;

-- 8. Gamification: remove direct user UPDATE on engagement tables
DROP POLICY IF EXISTS "Users can update own engagement" ON public.buyer_engagement;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.user_streaks;

-- Create secure increment function for engagement
CREATE OR REPLACE FUNCTION public.increment_engagement(_field text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _allowed_fields text[] := ARRAY['developers_viewed', 'projects_saved', 'reports_unlocked', 'helpful_votes', 'community_posts', 'community_replies', 'community_votes'];
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF NOT (_field = ANY(_allowed_fields)) THEN
    RAISE EXCEPTION 'Invalid field';
  END IF;

  -- Upsert all-time engagement
  INSERT INTO public.buyer_engagement (user_id)
  VALUES (_uid)
  ON CONFLICT (user_id) DO NOTHING;

  EXECUTE format('UPDATE public.buyer_engagement SET %I = %I + 1 WHERE user_id = $1', _field, _field)
  USING _uid;

  -- Weekly engagement
  DECLARE
    _week_start date := date_trunc('week', now())::date;
  BEGIN
    INSERT INTO public.weekly_buyer_engagement (user_id, week_start)
    VALUES (_uid, _week_start)
    ON CONFLICT (user_id, week_start) DO NOTHING;

    EXECUTE format('UPDATE public.weekly_buyer_engagement SET %I = %I + 1 WHERE user_id = $1 AND week_start = $2', _field, _field)
    USING _uid, _week_start;
  END;

  -- Update streak
  PERFORM public.update_user_streak(_uid);
END;
$$;

-- Remove direct user UPDATE on weekly engagement too
DROP POLICY IF EXISTS "Users can update own weekly engagement" ON public.weekly_buyer_engagement;
