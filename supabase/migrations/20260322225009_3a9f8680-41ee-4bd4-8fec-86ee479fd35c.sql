
-- Enums for launches
CREATE TYPE public.launch_type AS ENUM ('new_project', 'new_phase', 'relaunch');
CREATE TYPE public.launch_status AS ENUM ('upcoming', 'reservations_open', 'active', 'sold_out');
CREATE TYPE public.launch_buyer_type AS ENUM ('reserver', 'purchaser', 'attendee', 'observer');

-- Launches table
CREATE TABLE public.launches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  project_name text NOT NULL,
  location_district text NOT NULL,
  location_compound text,
  launch_type public.launch_type NOT NULL DEFAULT 'new_project',
  reservation_date date,
  launch_date date,
  delivery_date date,
  status public.launch_status NOT NULL DEFAULT 'upcoming',
  total_units integer NOT NULL DEFAULT 0,
  units_remaining integer NOT NULL DEFAULT 0,
  current_phase integer NOT NULL DEFAULT 1,
  current_price_per_m2 numeric,
  down_payment_pct numeric,
  installment_years integer,
  unit_types text[] DEFAULT '{}',
  is_verified boolean NOT NULL DEFAULT false,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.launches ENABLE ROW LEVEL SECURITY;

-- Anyone can read verified launches
CREATE POLICY "Anyone can read verified launches" ON public.launches
  FOR SELECT TO anon, authenticated USING (is_verified = true);

-- Users can view own launches
CREATE POLICY "Users can view own launches" ON public.launches
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert own launches
CREATE POLICY "Users can insert own launches" ON public.launches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update own non-verified launches
CREATE POLICY "Users can update own launches" ON public.launches
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Admins can manage all launches
CREATE POLICY "Admins can manage all launches" ON public.launches
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Launch phases table
CREATE TABLE public.launch_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id uuid NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  phase_number integer NOT NULL,
  price_per_m2 numeric NOT NULL,
  units_in_phase integer,
  started_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.launch_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read launch phases" ON public.launch_phases
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can insert own launch phases" ON public.launch_phases
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.launches WHERE id = launch_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all launch phases" ON public.launch_phases
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Launch ratings table
CREATE TABLE public.launch_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id uuid NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  stars_price_fairness integer NOT NULL CHECK (stars_price_fairness BETWEEN 1 AND 5),
  stars_developer_transparency integer NOT NULL CHECK (stars_developer_transparency BETWEEN 1 AND 5),
  stars_payment_terms integer NOT NULL CHECK (stars_payment_terms BETWEEN 1 AND 5),
  stars_location_value integer NOT NULL CHECK (stars_location_value BETWEEN 1 AND 5),
  stars_overall integer NOT NULL CHECK (stars_overall BETWEEN 1 AND 5),
  review_text text,
  buyer_verified boolean NOT NULL DEFAULT false,
  buyer_type public.launch_buyer_type NOT NULL DEFAULT 'observer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (launch_id, user_id)
);

ALTER TABLE public.launch_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read launch ratings" ON public.launch_ratings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can insert own ratings" ON public.launch_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.launch_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all launch ratings" ON public.launch_ratings
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Launch watchlist table
CREATE TABLE public.launch_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id uuid NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (launch_id, user_id)
);

ALTER TABLE public.launch_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist" ON public.launch_watchlist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON public.launch_watchlist
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON public.launch_watchlist
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all watchlist" ON public.launch_watchlist
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
