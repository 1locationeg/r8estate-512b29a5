CREATE TABLE public.guest_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_email text,
  guest_name text NOT NULL DEFAULT 'Guest',
  developer_id text NOT NULL,
  developer_name text,
  rating integer NOT NULL,
  title text,
  comment text NOT NULL,
  experience_type text,
  is_claimed boolean NOT NULL DEFAULT false,
  claimed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert guest reviews"
  ON public.guest_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read guest reviews"
  ON public.guest_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage guest reviews"
  ON public.guest_reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can claim guest reviews"
  ON public.guest_reviews FOR UPDATE
  TO authenticated
  USING (claimed_by = auth.uid() OR claimed_by IS NULL);