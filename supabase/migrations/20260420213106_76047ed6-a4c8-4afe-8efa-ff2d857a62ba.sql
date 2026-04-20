-- ENUMS
CREATE TYPE public.nfc_destination_type AS ENUM ('profile', 'review', 'projects', 'custom');
CREATE TYPE public.nfc_approval_status AS ENUM ('approved', 'pending_approval', 'rejected');

-- Helper: generate short base62 tag code
CREATE OR REPLACE FUNCTION public.generate_nfc_tag_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * 62 + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- TABLE: nfc_tags
CREATE TABLE public.nfc_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code text NOT NULL UNIQUE,
  business_id uuid REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id uuid,
  label text NOT NULL DEFAULT 'NFC Tag',
  destination_type public.nfc_destination_type NOT NULL DEFAULT 'profile',
  custom_url text,
  approval_status public.nfc_approval_status NOT NULL DEFAULT 'approved',
  is_active boolean NOT NULL DEFAULT true,
  is_blocked boolean NOT NULL DEFAULT false,
  tap_count integer NOT NULL DEFAULT 0,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_nfc_tags_business ON public.nfc_tags(business_id);
CREATE INDEX idx_nfc_tags_user ON public.nfc_tags(user_id);
CREATE INDEX idx_nfc_tags_code ON public.nfc_tags(tag_code);

ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;

-- Public read of active, non-blocked tags (needed for redirect)
CREATE POLICY "Anyone can read active tags"
  ON public.nfc_tags FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND is_blocked = false AND approval_status = 'approved');

-- Owners can view their tags (any state)
CREATE POLICY "Owners can view own tags"
  ON public.nfc_tags FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = nfc_tags.business_id AND bp.user_id = auth.uid())
  );

CREATE POLICY "Owners can insert own tags"
  ON public.nfc_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      business_id IS NULL
      OR EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = nfc_tags.business_id AND bp.user_id = auth.uid())
    )
  );

CREATE POLICY "Owners can update own tags"
  ON public.nfc_tags FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = nfc_tags.business_id AND bp.user_id = auth.uid())
  );

CREATE POLICY "Owners can delete own tags"
  ON public.nfc_tags FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = nfc_tags.business_id AND bp.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all tags"
  ON public.nfc_tags FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER update_nfc_tags_updated_at
  BEFORE UPDATE ON public.nfc_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- TABLE: nfc_tag_taps
CREATE TABLE public.nfc_tag_taps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES public.nfc_tags(id) ON DELETE CASCADE,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  device_type text,
  browser text,
  ip_country text,
  user_agent text,
  referrer_url text
);

CREATE INDEX idx_nfc_taps_tag ON public.nfc_tag_taps(tag_id);
CREATE INDEX idx_nfc_taps_time ON public.nfc_tag_taps(clicked_at DESC);

ALTER TABLE public.nfc_tag_taps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a tap"
  ON public.nfc_tag_taps FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Tag owners can view taps"
  ON public.nfc_tag_taps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.nfc_tags t
      LEFT JOIN public.business_profiles bp ON bp.id = t.business_id
      WHERE t.id = nfc_tag_taps.tag_id
        AND (t.user_id = auth.uid() OR bp.user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all taps"
  ON public.nfc_tag_taps FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger: increment tap_count on nfc_tags
CREATE OR REPLACE FUNCTION public.increment_nfc_tap_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.nfc_tags
  SET tap_count = tap_count + 1
  WHERE id = NEW.tag_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER nfc_tap_count_trigger
  AFTER INSERT ON public.nfc_tag_taps
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_nfc_tap_count();

-- Trigger: auto-fill tag_code if blank, force pending_approval for custom URLs
CREATE OR REPLACE FUNCTION public.prepare_nfc_tag()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _attempt int := 0;
  _candidate text;
BEGIN
  IF NEW.tag_code IS NULL OR NEW.tag_code = '' THEN
    LOOP
      _candidate := public.generate_nfc_tag_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.nfc_tags WHERE tag_code = _candidate);
      _attempt := _attempt + 1;
      IF _attempt > 10 THEN
        RAISE EXCEPTION 'Could not generate unique NFC tag code';
      END IF;
    END LOOP;
    NEW.tag_code := _candidate;
  END IF;

  -- Force custom URLs to pending approval unless inserted by admin
  IF NEW.destination_type = 'custom' AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.approval_status := 'pending_approval';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER nfc_tag_prepare_insert
  BEFORE INSERT ON public.nfc_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.prepare_nfc_tag();

-- On update: if destination changes to custom URL by non-admin, re-pending
CREATE OR REPLACE FUNCTION public.recheck_nfc_tag_approval()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.destination_type = 'custom'
     AND (OLD.destination_type IS DISTINCT FROM NEW.destination_type
          OR OLD.custom_url IS DISTINCT FROM NEW.custom_url)
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.approval_status := 'pending_approval';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER nfc_tag_recheck_update
  BEFORE UPDATE ON public.nfc_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.recheck_nfc_tag_approval();