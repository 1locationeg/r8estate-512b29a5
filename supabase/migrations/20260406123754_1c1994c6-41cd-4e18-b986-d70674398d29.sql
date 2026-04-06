
-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can submit a contact form
CREATE POLICY "Anyone can insert contact submissions"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "Admins can manage all contact submissions"
  ON public.contact_submissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own submissions
CREATE POLICY "Users can view own contact submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Seed default contact page settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('contact_page_title', 'تواصل معنا'),
  ('contact_page_subtitle', 'نحن هنا لمساعدتك. تواصل معنا بأي طريقة تناسبك'),
  ('contact_page_body', ''),
  ('contact_email', 'support@r8estate.com'),
  ('contact_phone', ''),
  ('contact_whatsapp', ''),
  ('contact_facebook_messenger', ''),
  ('contact_office_address', ''),
  ('contact_office_hours', ''),
  ('contact_map_embed', '')
ON CONFLICT DO NOTHING;
