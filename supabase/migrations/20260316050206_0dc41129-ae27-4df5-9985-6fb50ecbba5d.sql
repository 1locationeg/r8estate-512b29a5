-- Create a validation trigger to prevent reviews on non-reviewable entities
CREATE OR REPLACE FUNCTION public.check_review_allowed()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.business_profiles
    WHERE id::text = NEW.developer_id
      AND is_reviewable = false
  ) THEN
    RAISE EXCEPTION 'Reviews are not allowed for this entity. Please review individual projects instead.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_review_allowed
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.check_review_allowed();

CREATE TRIGGER trg_check_guest_review_allowed
  BEFORE INSERT ON public.guest_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.check_review_allowed();