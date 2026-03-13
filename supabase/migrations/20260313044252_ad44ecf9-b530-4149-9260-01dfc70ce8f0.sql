
CREATE TABLE public.guest_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  rating integer NOT NULL,
  feedback text NOT NULL,
  feedback_type text NOT NULL DEFAULT 'general',
  session_id text NOT NULL
);

ALTER TABLE public.guest_feedback ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert feedback
CREATE POLICY "Anyone can submit feedback"
  ON public.guest_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON public.guest_feedback FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete feedback
CREATE POLICY "Admins can delete feedback"
  ON public.guest_feedback FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
