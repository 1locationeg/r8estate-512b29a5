
CREATE OR REPLACE FUNCTION public.admin_set_account_kind(_target_user uuid, _kind text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _normalized text;
  _caller uuid := auth.uid();
BEGIN
  IF _caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (public.is_super_admin(_caller) OR public.has_role(_caller, 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  _normalized := lower(coalesce(_kind, 'buyer'));
  IF _normalized NOT IN ('buyer', 'business', 'professional') THEN
    RAISE EXCEPTION 'Invalid account kind: %', _kind;
  END IF;

  INSERT INTO public.user_account_kinds (user_id, account_kind)
  VALUES (_target_user, _normalized)
  ON CONFLICT (user_id)
  DO UPDATE SET account_kind = EXCLUDED.account_kind, updated_at = now();

  IF _normalized = 'professional' THEN
    INSERT INTO public.notifications (user_id, message, metadata, is_read)
    VALUES (
      _target_user,
      'You have been upgraded to a Professional account — your Trust Page is now live.',
      jsonb_build_object('type', 'account_upgrade', 'kind', 'professional'),
      false
    );
  END IF;

  RETURN _normalized;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_account_kind(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_account_kind(uuid, text) TO authenticated;
