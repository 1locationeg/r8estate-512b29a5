-- Allow developers to delete their own child business profiles (projects)
CREATE POLICY "Users can delete own business profiles"
ON public.business_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to delete business profiles
CREATE POLICY "Admins can delete business profiles"
ON public.business_profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all business profiles
CREATE POLICY "Admins can update all business profiles"
ON public.business_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));