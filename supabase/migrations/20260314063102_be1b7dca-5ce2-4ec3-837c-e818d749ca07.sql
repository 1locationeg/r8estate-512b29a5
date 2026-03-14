
-- AI usage tracking table
CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  tokens_used integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage (user_id, created_at);
CREATE INDEX idx_ai_usage_function ON public.ai_usage (function_name, created_at);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own AI usage" ON public.ai_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all usage
CREATE POLICY "Admins can view all AI usage" ON public.ai_usage
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Edge functions insert via service role, but also allow authenticated insert for own
CREATE POLICY "Users can insert own AI usage" ON public.ai_usage
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can delete usage records
CREATE POLICY "Admins can delete AI usage" ON public.ai_usage
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- AI usage limits stored in platform_settings with keys like:
-- ai_daily_limit (default 50)
-- ai_monthly_limit (default 500)
-- We'll use platform_settings table for this, inserting defaults
INSERT INTO public.platform_settings (key, value) VALUES 
  ('ai_daily_limit', '50'),
  ('ai_monthly_limit', '500')
ON CONFLICT DO NOTHING;
