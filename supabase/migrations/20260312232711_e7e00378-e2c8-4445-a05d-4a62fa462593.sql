
-- Create business_profiles table for developer accounts
CREATE TABLE public.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  company_name text,
  description text,
  logo_url text,
  location text,
  year_established integer,
  employees integer,
  specialties text[] DEFAULT '{}',
  email text,
  phone text,
  website text,
  social_links jsonb DEFAULT '{}',
  license_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own business profile
CREATE POLICY "Users can view own business profile"
  ON public.business_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own business profile
CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own business profile
CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all business profiles
CREATE POLICY "Admins can view all business profiles"
  ON public.business_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
