
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for the public spotlight)
CREATE POLICY "Anyone can read platform settings"
ON public.platform_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert platform settings"
ON public.platform_settings FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update platform settings"
ON public.platform_settings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed the featured developer setting
INSERT INTO public.platform_settings (key, value) VALUES ('featured_developer_id', '1');
