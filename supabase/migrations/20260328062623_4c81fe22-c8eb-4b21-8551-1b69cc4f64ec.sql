
-- Create function to notify admins when a new reviewer verification (identity/KYC) is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_new_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_user uuid;
  _type_label text;
BEGIN
  _type_label := CASE NEW.verification_type
    WHEN 'social' THEN 'Identity (Social)'
    WHEN 'kyc' THEN 'KYC'
    ELSE NEW.verification_type
  END;

  FOR _admin_user IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      _admin_user,
      'review_status',
      '📋 New ' || _type_label || ' Verification Request',
      'A buyer has submitted a ' || _type_label || ' verification request. Please review it.',
      jsonb_build_object('verification_id', NEW.id, 'user_id', NEW.user_id, 'type', NEW.verification_type, 'link', '/admin/reviewer-verification')
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Attach trigger on INSERT to reviewer_verifications
CREATE TRIGGER on_new_reviewer_verification
  AFTER INSERT ON public.reviewer_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_verification();
