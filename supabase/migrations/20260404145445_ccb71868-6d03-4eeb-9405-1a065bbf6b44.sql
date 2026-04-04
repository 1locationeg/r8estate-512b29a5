-- Drop the blanket SELECT policy that exposes all profile fields to all authenticated users
DROP POLICY IF EXISTS "Users can view public profile fields" ON public.profiles;