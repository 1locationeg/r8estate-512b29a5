-- Add layered review system columns to business_profiles
ALTER TABLE public.business_profiles 
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_reviewable boolean NOT NULL DEFAULT true;

-- Index for fast parent/child lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_parent ON public.business_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_reviewable ON public.business_profiles(is_reviewable);

-- Allow anyone to check business reviewability status (needed for review guard)
CREATE POLICY "Anyone can check business reviewability"
  ON public.business_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);