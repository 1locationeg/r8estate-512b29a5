
CREATE TABLE IF NOT EXISTS public.review_funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_id UUID,
  developer_id TEXT,
  developer_name TEXT,
  event_type TEXT NOT NULL,
  rating INTEGER,
  chip_label TEXT,
  chip_sentiment TEXT,
  selected_chips TEXT[],
  phase INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  locale TEXT,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rfe_event_type ON public.review_funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_rfe_developer ON public.review_funnel_events(developer_id);
CREATE INDEX IF NOT EXISTS idx_rfe_session ON public.review_funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_rfe_chip ON public.review_funnel_events(chip_label);
CREATE INDEX IF NOT EXISTS idx_rfe_created_at ON public.review_funnel_events(created_at DESC);

ALTER TABLE public.review_funnel_events ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. guests) can insert their own funnel events
CREATE POLICY "Anyone can insert review funnel events"
ON public.review_funnel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read funnel events
CREATE POLICY "Admins can read review funnel events"
ON public.review_funnel_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
