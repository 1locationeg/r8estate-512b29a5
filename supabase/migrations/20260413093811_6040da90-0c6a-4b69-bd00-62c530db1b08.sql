
CREATE OR REPLACE FUNCTION public.notify_interested_users_on_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _interested_user uuid;
  _meta jsonb;
  _msg text;
BEGIN
  _meta := jsonb_build_object(
    'developer_id', NEW.developer_id,
    'review_id', NEW.id,
    'rating', NEW.rating,
    'link', '/reviews?developer=' || NEW.developer_id
  );

  _msg := NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5';
  IF NEW.comment IS NOT NULL THEN
    _msg := _msg || ': "' || LEFT(NEW.comment, 80) || '..."';
  END IF;

  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.saved_items
    WHERE item_id = NEW.developer_id AND user_id != NEW.user_id
  LOOP
    PERFORM public.create_notification(
      _interested_user, 'review',
      'New Review for ' || COALESCE(NEW.developer_name, 'a developer you saved'),
      _msg,
      _meta
    );
  END LOOP;

  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.followed_businesses
    WHERE business_id = NEW.developer_id AND user_id != NEW.user_id
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.saved_items
      WHERE item_id = NEW.developer_id AND user_id = _interested_user
    ) THEN
      PERFORM public.create_notification(
        _interested_user, 'review',
        'New Review for ' || COALESCE(NEW.developer_name, 'a developer you follow'),
        _msg,
        _meta
      );
    END IF;
  END LOOP;

  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.user_interests
    WHERE entity_id = NEW.developer_id AND user_id != NEW.user_id AND strength >= 2
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.saved_items WHERE item_id = NEW.developer_id AND user_id = _interested_user
    ) AND NOT EXISTS (
      SELECT 1 FROM public.followed_businesses WHERE business_id = NEW.developer_id AND user_id = _interested_user
    ) THEN
      PERFORM public.create_notification(
        _interested_user, 'review',
        'New Review for ' || COALESCE(NEW.developer_name, 'a developer you viewed'),
        _msg,
        _meta
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_interested_users_on_guest_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _interested_user uuid;
  _meta jsonb;
  _msg text;
BEGIN
  _meta := jsonb_build_object(
    'developer_id', NEW.developer_id,
    'review_id', NEW.id,
    'rating', NEW.rating,
    'link', '/reviews?developer=' || NEW.developer_id
  );

  _msg := NEW.guest_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5';
  IF NEW.comment IS NOT NULL THEN
    _msg := _msg || ': "' || LEFT(NEW.comment, 80) || '..."';
  END IF;

  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.followed_businesses
    WHERE business_id = NEW.developer_id
  LOOP
    PERFORM public.create_notification(
      _interested_user, 'review',
      'New Review for ' || COALESCE(NEW.developer_name, 'a developer you follow'),
      _msg,
      _meta
    );
  END LOOP;

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
        _msg,
        _meta
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_followers_on_approved_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _follower uuid;
  _meta jsonb;
  _msg text;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    _meta := jsonb_build_object(
      'developer_id', NEW.developer_id,
      'review_id', NEW.id,
      'rating', NEW.rating,
      'link', '/reviews?developer=' || NEW.developer_id
    );

    _msg := NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5.';
    IF NEW.comment IS NOT NULL THEN
      _msg := _msg || ' "' || LEFT(NEW.comment, 60) || '..."';
    END IF;
    _msg := _msg || ' Check it out!';

    FOR _follower IN
      SELECT user_id FROM public.followed_businesses
      WHERE business_id = NEW.developer_id AND user_id != NEW.user_id
    LOOP
      PERFORM public.create_notification(
        _follower,
        'review',
        '📢 ' || COALESCE(NEW.developer_name, 'A developer you track') || ' — New Review',
        _msg,
        _meta
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;
