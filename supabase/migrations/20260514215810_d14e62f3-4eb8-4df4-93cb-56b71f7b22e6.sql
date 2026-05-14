CREATE TABLE IF NOT EXISTS public.avatar_overlays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_url text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  position text NOT NULL DEFAULT 'bottom-end',
  size_percent integer NOT NULL DEFAULT 38,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT avatar_overlays_audience_check CHECK (audience IN ('all', 'buyers', 'businesses', 'professionals', 'admins')),
  CONSTRAINT avatar_overlays_position_check CHECK (position IN ('top-start', 'top-end', 'bottom-start', 'bottom-end', 'center')),
  CONSTRAINT avatar_overlays_size_check CHECK (size_percent BETWEEN 16 AND 80)
);

ALTER TABLE public.avatar_overlays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active avatar overlays"
ON public.avatar_overlays
FOR SELECT
USING (
  is_active = true
  AND (start_at IS NULL OR start_at <= now())
  AND (end_at IS NULL OR end_at >= now())
);

CREATE POLICY "Admins can view all avatar overlays"
ON public.avatar_overlays
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can create avatar overlays"
ON public.avatar_overlays
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update avatar overlays"
ON public.avatar_overlays
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete avatar overlays"
ON public.avatar_overlays
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS update_avatar_overlays_updated_at ON public.avatar_overlays;
CREATE TRIGGER update_avatar_overlays_updated_at
BEFORE UPDATE ON public.avatar_overlays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_avatar_overlays_active_schedule
ON public.avatar_overlays (is_active, start_at, end_at);

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-overlays', 'avatar-overlays', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Avatar overlays are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatar-overlays');

CREATE POLICY "Admins can upload avatar overlays"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatar-overlays' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update avatar overlays"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatar-overlays' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'avatar-overlays' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete avatar overlays"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatar-overlays' AND public.has_role(auth.uid(), 'admin'::public.app_role));