
-- WhatsApp leads table
CREATE TABLE public.whatsapp_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit whatsapp lead"
ON public.whatsapp_leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view whatsapp leads"
ON public.whatsapp_leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete leads
CREATE POLICY "Admins can delete whatsapp leads"
ON public.whatsapp_leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
