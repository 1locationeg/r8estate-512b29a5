
-- Create pending_reviews table for token-based pre-filled review links
CREATE TABLE public.pending_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  first_name text,
  project_name text,
  developer_id text,
  developer_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_used boolean NOT NULL DEFAULT false
);

ALTER TABLE public.pending_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read by token (for the review page)
CREATE POLICY "Anyone can read pending reviews by token"
  ON public.pending_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins/service can insert
CREATE POLICY "Admins can manage pending reviews"
  ON public.pending_reviews FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add device_fingerprint column to guest_reviews
ALTER TABLE public.guest_reviews ADD COLUMN IF NOT EXISTS device_fingerprint jsonb DEFAULT '{}'::jsonb;
