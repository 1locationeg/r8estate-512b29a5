-- Create alpha_report_leads table for lead-gen CTA
CREATE TABLE public.alpha_report_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT,
  entity_id TEXT,
  entity_name TEXT,
  source TEXT DEFAULT 'entity_page',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alpha_report_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead (open insert)
CREATE POLICY "Anyone can submit alpha report leads"
ON public.alpha_report_leads
FOR INSERT
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view all alpha report leads"
ON public.alpha_report_leads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete leads
CREATE POLICY "Admins can delete alpha report leads"
ON public.alpha_report_leads
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Index for entity lookups
CREATE INDEX idx_alpha_report_leads_entity_id ON public.alpha_report_leads(entity_id);
CREATE INDEX idx_alpha_report_leads_created_at ON public.alpha_report_leads(created_at DESC);