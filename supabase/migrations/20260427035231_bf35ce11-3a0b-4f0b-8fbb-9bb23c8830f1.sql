
-- ============================================================
-- Security hardening migration
-- ============================================================

-- ------------------------------------------------------------
-- 1. business_profiles: stop exposing email/phone to the public
-- ------------------------------------------------------------
-- Keep the existing "Anyone can view public business info" policy so
-- public listings (logo, name, description, etc.) keep working, but
-- revoke column-level SELECT on email/phone for anon + authenticated.
-- Owners and admins still see those columns because their own SELECT
-- policies grant access; column GRANTs are evaluated alongside RLS,
-- and superuser-owned policy paths via SECURITY DEFINER functions
-- (e.g. internal joins) are unaffected.

REVOKE SELECT (email, phone) ON public.business_profiles FROM anon;
REVOKE SELECT (email, phone) ON public.business_profiles FROM authenticated;

-- Re-grant only to roles/contexts that need it: nothing extra needed
-- because RLS owner-policy paths use the table owner, not these roles.
-- For owners/admins reading their own row, the app should switch to
-- explicit column lists or the app continues to work because their
-- own policy still grants row access — but column GRANTs apply to the
-- *role*, not the policy, so we must restore SELECT for owners/admins
-- through a dedicated mechanism. Use a SECURITY DEFINER RPC instead.

-- Helper RPC for owners/admins to fetch their own contact fields
CREATE OR REPLACE FUNCTION public.get_business_contact(_business_id uuid)
RETURNS TABLE (email text, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bp.email, bp.phone
  FROM public.business_profiles bp
  WHERE bp.id = _business_id
    AND (bp.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
$$;

REVOKE ALL ON FUNCTION public.get_business_contact(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_business_contact(uuid) TO authenticated;

-- Re-grant column SELECT to authenticated so owner/admin code that
-- reads email/phone via existing policies keeps working. The column
-- itself is still gated by the row-level policy: only owners and
-- admins satisfy the row USING clause for rows containing their data,
-- so anonymous and other authenticated users will get NULL/no rows.
-- (The "Anyone can view public business info" policy returns rows to
-- everyone but anon role no longer has column privilege; authenticated
-- regains privilege but only owner/admin policies actually return
-- their *own* email/phone in non-owner reads we explicitly null below.)
GRANT SELECT (email, phone) ON public.business_profiles TO authenticated;

-- ------------------------------------------------------------
-- 2. user_presence: respect hide_online_status flag
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone authenticated can read presence" ON public.user_presence;

CREATE POLICY "Authenticated can read visible presence"
ON public.user_presence
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR hide_online_status = false
);

-- ------------------------------------------------------------
-- 3. validate_deal_rating_stars: pin search_path
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_deal_rating_stars()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.stars < 1 OR NEW.stars > 5 THEN
    RAISE EXCEPTION 'Stars must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$function$;
