CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _account_type text;
  _account_kind text;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    updated_at = now();
  
  _account_type := NEW.raw_user_meta_data ->> 'account_type';
  _account_kind := lower(coalesce(NEW.raw_user_meta_data ->> 'account_kind', _account_type, 'buyer'));

  IF _account_kind NOT IN ('buyer', 'business', 'professional') THEN
    _account_kind := CASE
      WHEN _account_type IN ('developer', 'business') THEN 'business'
      ELSE 'buyer'
    END;
  END IF;

  INSERT INTO public.user_account_kinds (user_id, account_kind)
  VALUES (NEW.id, _account_kind)
  ON CONFLICT (user_id)
  DO UPDATE SET account_kind = EXCLUDED.account_kind, updated_at = now();
  
  IF _account_type IN ('developer', 'business') OR _account_kind IN ('business', 'professional') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'business')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'buyer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;