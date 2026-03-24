
CREATE TABLE public.widget_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES public.widget_configs(id) ON DELETE CASCADE,
  embed_token text NOT NULL,
  event_type text NOT NULL DEFAULT 'impression',
  referrer_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_widget_analytics_token ON public.widget_analytics(embed_token);
CREATE INDEX idx_widget_analytics_created ON public.widget_analytics(created_at);

ALTER TABLE public.widget_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert widget analytics"
  ON public.widget_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all widget analytics"
  ON public.widget_analytics FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete widget analytics"
  ON public.widget_analytics FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
