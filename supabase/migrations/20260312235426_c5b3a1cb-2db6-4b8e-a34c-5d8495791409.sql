CREATE OR REPLACE FUNCTION public.set_my_account_type(_account_type text)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _target_role public.app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.has_role(_uid, 'admin') THEN
    RETURN 'admin'::public.app_role;
  END IF;

  _target_role := CASE
    WHEN lower(coalesce(_account_type, '')) IN ('business', 'developer') THEN 'developer'::public.app_role
    ELSE 'buyer'::public.app_role
  END;

  DELETE FROM public.user_roles
  WHERE user_id = _uid
    AND role IN ('user'::public.app_role, 'buyer'::public.app_role, 'developer'::public.app_role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _target_role;
END;
$$;

REVOKE ALL ON FUNCTION public.set_my_account_type(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_account_type(text) TO authenticated;