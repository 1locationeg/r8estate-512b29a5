CREATE POLICY "Admins can create business profiles"
ON public.business_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));