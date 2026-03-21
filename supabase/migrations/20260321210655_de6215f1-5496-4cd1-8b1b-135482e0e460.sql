
-- Add moderation columns to reviews
ALTER TABLE public.reviews 
  ADD COLUMN status text NOT NULL DEFAULT 'approved',
  ADD COLUMN reviewed_by uuid,
  ADD COLUMN reviewed_at timestamptz;

-- Create trigger function to notify reviewer on moderation
CREATE OR REPLACE FUNCTION public.notify_review_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'review_status',
      CASE NEW.status
        WHEN 'approved' THEN 'Review Approved ✅'
        WHEN 'rejected' THEN 'Review Rejected ❌'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'Your review for ' || COALESCE(NEW.developer_name, 'a developer') || ' has been approved and is now visible.'
        WHEN 'rejected' THEN 'Your review for ' || COALESCE(NEW.developer_name, 'a developer') || ' was not approved by our moderation team.'
      END,
      jsonb_build_object('review_id', NEW.id, 'status', NEW.status, 'developer_name', NEW.developer_name, 'link', '/reviews')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger
CREATE TRIGGER on_review_moderation
  AFTER UPDATE OF status ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_review_moderation();

-- Update RLS: public can only see approved reviews
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Admins already have ALL policy, so they can see all statuses
