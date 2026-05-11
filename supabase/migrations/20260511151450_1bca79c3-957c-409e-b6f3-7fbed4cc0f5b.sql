CREATE TABLE IF NOT EXISTS public.user_account_kinds (
  user_id uuid PRIMARY KEY,
  account_kind text NOT NULL DEFAULT 'buyer',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_account_kinds_account_kind_check CHECK (account_kind IN ('buyer', 'business', 'professional'))
);

ALTER TABLE public.user_account_kinds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account kind"
ON public.user_account_kinds
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own account kind"
ON public.user_account_kinds
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own account kind"
ON public.user_account_kinds
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all account kinds"
ON public.user_account_kinds
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all account kinds"
ON public.user_account_kinds
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_account_kinds_updated_at
BEFORE UPDATE ON public.user_account_kinds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_my_account_kind(_account_kind text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _kind text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  _kind := lower(coalesce(_account_kind, 'buyer'));
  IF _kind NOT IN ('buyer', 'business', 'professional') THEN
    _kind := 'buyer';
  END IF;

  INSERT INTO public.user_account_kinds (user_id, account_kind)
  VALUES (_uid, _kind)
  ON CONFLICT (user_id)
  DO UPDATE SET account_kind = EXCLUDED.account_kind, updated_at = now();

  RETURN _kind;
END;
$function$;

INSERT INTO public.user_account_kinds (user_id, account_kind)
SELECT user_id, 'professional'
FROM public.profiles
WHERE lower(email) = lower('biroxoh645@bezill.com')
ON CONFLICT (user_id)
DO UPDATE SET account_kind = 'professional', updated_at = now();