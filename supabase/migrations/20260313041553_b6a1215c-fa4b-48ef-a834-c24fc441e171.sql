
-- Table to track buyer engagement metrics
CREATE TABLE public.buyer_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  developers_viewed integer NOT NULL DEFAULT 0,
  projects_saved integer NOT NULL DEFAULT 0,
  reports_unlocked integer NOT NULL DEFAULT 0,
  helpful_votes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.buyer_engagement ENABLE ROW LEVEL SECURITY;

-- Users can view their own engagement
CREATE POLICY "Users can view own engagement"
  ON public.buyer_engagement FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own engagement
CREATE POLICY "Users can insert own engagement"
  ON public.buyer_engagement FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own engagement
CREATE POLICY "Users can update own engagement"
  ON public.buyer_engagement FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all engagement"
  ON public.buyer_engagement FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_buyer_engagement_updated_at
  BEFORE UPDATE ON public.buyer_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
