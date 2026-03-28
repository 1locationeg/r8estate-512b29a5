
-- Create function to notify admins when a new receipt is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_new_receipt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_user uuid;
BEGIN
  FOR _admin_user IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      _admin_user,
      'review_status',
      '📋 New Receipt Submission',
      'A buyer has submitted a receipt for ' || COALESCE(NEW.developer_name, 'verification') || '. Please review it.',
      jsonb_build_object('receipt_id', NEW.id, 'user_id', NEW.user_id, 'link', '/admin/receipt-verification')
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Attach trigger on INSERT
CREATE TRIGGER on_new_receipt_submission
  AFTER INSERT ON public.receipt_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_receipt();
