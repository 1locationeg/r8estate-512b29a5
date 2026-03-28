
-- 1. Add follow_reminded_at column
ALTER TABLE public.followed_businesses 
ADD COLUMN IF NOT EXISTS follow_reminded_at timestamptz DEFAULT NULL;

-- 2. Allow UPDATE on followed_businesses for the reminder column
CREATE POLICY "Users can update own followed businesses"
ON public.followed_businesses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Trigger function to notify followers when a review is approved
CREATE OR REPLACE FUNCTION public.notify_followers_on_approved_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _follower uuid;
  _meta jsonb;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    _meta := jsonb_build_object(
      'developer_id', NEW.developer_id,
      'review_id', NEW.id,
      'rating', NEW.rating,
      'link', '/reviews?developer=' || NEW.developer_id
    );

    FOR _follower IN
      SELECT user_id FROM public.followed_businesses
      WHERE business_id = NEW.developer_id AND user_id != NEW.user_id
    LOOP
      PERFORM public.create_notification(
        _follower,
        'review',
        '📢 ' || COALESCE(NEW.developer_name, 'A developer you track') || ' — New Review',
        NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5. Check it out!',
        _meta
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Attach trigger
CREATE TRIGGER trg_notify_followers_on_approved_review
AFTER UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_followers_on_approved_review();
