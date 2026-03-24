-- Allow all authenticated users to read profiles (for displaying author names)
CREATE POLICY "Anyone authenticated can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);