
-- Add social verification columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS identity_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS identity_provider text;

-- Add verification_level to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS verification_level text NOT NULL DEFAULT 'none';

-- Create reviewer_verifications table
CREATE TABLE public.reviewer_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type text NOT NULL DEFAULT 'social',
  status text NOT NULL DEFAULT 'pending',
  document_url text,
  developer_id text,
  social_url text,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviewer_verifications ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see their own verifications
CREATE POLICY "Users can view own verifications"
  ON public.reviewer_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS: Users can insert own verifications
CREATE POLICY "Users can insert own verifications"
  ON public.reviewer_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: Admins can manage all verifications
CREATE POLICY "Admins can manage all verifications"
  ON public.reviewer_verifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to detect OAuth provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  _account_type text;
  _provider text;
BEGIN
  _provider := NEW.raw_app_meta_data ->> 'provider';

  INSERT INTO public.profiles (user_id, full_name, avatar_url, email, identity_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    _provider
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
