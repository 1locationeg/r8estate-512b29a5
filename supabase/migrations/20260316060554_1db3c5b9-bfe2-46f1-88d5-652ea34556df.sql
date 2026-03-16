
-- Table to track implicit user interests (clicks, searches, lingers)
CREATE TABLE public.user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_id text NOT NULL,
  entity_name text,
  interest_type text NOT NULL DEFAULT 'click',
  strength integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_id)
);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interests" ON public.user_interests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interests" ON public.user_interests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interests" ON public.user_interests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests" ON public.user_interests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger function: on new review, notify all interested users
CREATE OR REPLACE FUNCTION public.notify_interested_users_on_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _interested_user uuid;
BEGIN
  -- Notify users who saved this developer
  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.saved_items
    WHERE item_id = NEW.developer_id AND user_id != NEW.user_id
  LOOP
    PERFORM public.create_notification(
      _interested_user, 'review',
      'New Review for ' || COALESCE(NEW.developer_name, 'a developer you saved'),
      NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
      jsonb_build_object('developer_id', NEW.developer_id, 'review_id', NEW.id, 'rating', NEW.rating)
    );
  END LOOP;

  -- Notify users who follow this developer
  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.followed_businesses
    WHERE business_id = NEW.developer_id AND user_id != NEW.user_id
  LOOP
    -- Avoid duplicate if already notified via saved_items
    IF NOT EXISTS (
      SELECT 1 FROM public.saved_items
      WHERE item_id = NEW.developer_id AND user_id = _interested_user
    ) THEN
      PERFORM public.create_notification(
        _interested_user, 'review',
        'New Review for ' || COALESCE(NEW.developer_name, 'a developer you follow'),
        NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
        jsonb_build_object('developer_id', NEW.developer_id, 'review_id', NEW.id, 'rating', NEW.rating)
      );
    END IF;
  END LOOP;

  -- Notify users with implicit interest (search, click, linger)
  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.user_interests
    WHERE entity_id = NEW.developer_id AND user_id != NEW.user_id AND strength >= 2
  LOOP
    -- Avoid duplicate if already notified
    IF NOT EXISTS (
      SELECT 1 FROM public.saved_items WHERE item_id = NEW.developer_id AND user_id = _interested_user
    ) AND NOT EXISTS (
      SELECT 1 FROM public.followed_businesses WHERE business_id = NEW.developer_id AND user_id = _interested_user
    ) THEN
      PERFORM public.create_notification(
        _interested_user, 'review',
        'New Review for ' || COALESCE(NEW.developer_name, 'a developer you viewed'),
        NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
        jsonb_build_object('developer_id', NEW.developer_id, 'review_id', NEW.id, 'rating', NEW.rating)
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_interested_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_interested_users_on_review();

-- Also for guest reviews
CREATE OR REPLACE FUNCTION public.notify_interested_users_on_guest_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _interested_user uuid;
BEGIN
  -- Notify followers
  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.followed_businesses
    WHERE business_id = NEW.developer_id
  LOOP
    PERFORM public.create_notification(
      _interested_user, 'review',
      'New Review for ' || COALESCE(NEW.developer_name, 'a developer you follow'),
      NEW.guest_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
      jsonb_build_object('developer_id', NEW.developer_id, 'review_id', NEW.id, 'rating', NEW.rating)
    );
  END LOOP;

  -- Notify savers
  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.saved_items
    WHERE item_id = NEW.developer_id
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.followed_businesses WHERE business_id = NEW.developer_id AND user_id = _interested_user
    ) THEN
      PERFORM public.create_notification(
        _interested_user, 'review',
        'New Review for ' || COALESCE(NEW.developer_name, 'a developer you saved'),
        NEW.guest_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
        jsonb_build_object('developer_id', NEW.developer_id, 'review_id', NEW.id, 'rating', NEW.rating)
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_interested_on_guest_review
  AFTER INSERT ON public.guest_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_interested_users_on_guest_review();
