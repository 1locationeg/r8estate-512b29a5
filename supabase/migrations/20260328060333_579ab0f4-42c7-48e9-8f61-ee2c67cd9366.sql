
-- Attach notify_receipt_status_change trigger to receipt_submissions (idempotent)
DROP TRIGGER IF EXISTS on_receipt_status_change ON public.receipt_submissions;
CREATE TRIGGER on_receipt_status_change
  AFTER UPDATE ON public.receipt_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_receipt_status_change();
