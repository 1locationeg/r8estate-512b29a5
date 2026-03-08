
-- Trigger function: notify buyer when receipt status changes
CREATE OR REPLACE FUNCTION public.notify_receipt_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status actually changes
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'review_status',
      CASE NEW.status
        WHEN 'approved' THEN 'Receipt Approved ✅'
        WHEN 'rejected' THEN 'Receipt Rejected ❌'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'Your receipt for ' || COALESCE(NEW.developer_name, 'a developer') || ' has been approved. You now have Verified Buyer status!'
        WHEN 'rejected' THEN 'Your receipt for ' || COALESCE(NEW.developer_name, 'a developer') || ' was not approved.' || CASE WHEN NEW.admin_notes IS NOT NULL THEN ' Note: ' || NEW.admin_notes ELSE '' END
      END,
      jsonb_build_object('receipt_id', NEW.id, 'status', NEW.status, 'developer_name', NEW.developer_name)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to receipt_submissions
CREATE TRIGGER on_receipt_status_change
  AFTER UPDATE ON public.receipt_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_receipt_status_change();
