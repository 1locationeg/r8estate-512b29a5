-- Update existing handle_new_user to respect account_type metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _account_type text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign role based on account_type metadata
  _account_type := NEW.raw_user_meta_data ->> 'account_type';
  
  IF _account_type = 'developer' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'developer');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'buyer');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Remove the duplicate trigger we just created
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();