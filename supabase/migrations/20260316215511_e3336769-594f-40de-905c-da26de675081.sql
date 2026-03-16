
-- Rename the enum value from 'developer' to 'business'
ALTER TYPE public.app_role RENAME VALUE 'developer' TO 'business';

-- Update handle_new_user to use 'business' instead of 'developer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _account_type text;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  _account_type := NEW.raw_user_meta_data ->> 'account_type';
  
  IF _account_type IN ('developer', 'business') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'business');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'buyer');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update set_my_account_type to use 'business'
CREATE OR REPLACE FUNCTION public.set_my_account_type(_account_type text)
 RETURNS app_role
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    WHEN lower(coalesce(_account_type, '')) IN ('business', 'developer') THEN 'business'::public.app_role
    ELSE 'buyer'::public.app_role
  END;

  DELETE FROM public.user_roles
  WHERE user_id = _uid
    AND role IN ('user'::public.app_role, 'buyer'::public.app_role, 'business'::public.app_role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _target_role;
END;
$function$;

-- Update get_user_role ordering
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'business' THEN 2
      WHEN 'buyer' THEN 3
      WHEN 'user' THEN 4
    END
  LIMIT 1
$function$;
