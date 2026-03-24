
-- Add email column to profiles for display name fallback
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill existing profiles with email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;

-- Update handle_new_user to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _account_type text;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
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
