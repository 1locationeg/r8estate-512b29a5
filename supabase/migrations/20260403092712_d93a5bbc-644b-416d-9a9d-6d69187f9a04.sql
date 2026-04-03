
-- Create smart_links table
CREATE TABLE public.smart_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  destination_url text NOT NULL,
  og_title text,
  og_description text,
  og_image text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all smart links" ON public.smart_links
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active smart links" ON public.smart_links
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Create link_clicks table
CREATE TABLE public.link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.smart_links(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  referrer_url text,
  user_agent text,
  device_type text,
  browser text,
  ip_country text
);

ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all link clicks" ON public.link_clicks
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert link clicks" ON public.link_clicks
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
