
-- Update notify_interested_users_on_review to include link in metadata
CREATE OR REPLACE FUNCTION public.notify_interested_users_on_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _interested_user uuid;
  _meta jsonb;
BEGIN
  _meta := jsonb_build_object(
    'developer_id', NEW.developer_id,
    'review_id', NEW.id,
    'rating', NEW.rating,
    'link', '/reviews?developer=' || NEW.developer_id
  );

  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.saved_items
    WHERE item_id = NEW.developer_id AND user_id != NEW.user_id
  LOOP
    PERFORM public.create_notification(
      _interested_user, 'review',
      'New Review for ' || COALESCE(NEW.developer_name, 'a developer you saved'),
      NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
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
        NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
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
        NEW.author_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
        _meta
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Update notify_interested_users_on_guest_review to include link
CREATE OR REPLACE FUNCTION public.notify_interested_users_on_guest_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _interested_user uuid;
  _meta jsonb;
BEGIN
  _meta := jsonb_build_object(
    'developer_id', NEW.developer_id,
    'review_id', NEW.id,
    'rating', NEW.rating,
    'link', '/reviews?developer=' || NEW.developer_id
  );

  FOR _interested_user IN
    SELECT DISTINCT user_id FROM public.followed_businesses
    WHERE business_id = NEW.developer_id
  LOOP
    PERFORM public.create_notification(
      _interested_user, 'review',
      'New Review for ' || COALESCE(NEW.developer_name, 'a developer you follow'),
      NEW.guest_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
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
        NEW.guest_name || ' rated ' || COALESCE(NEW.developer_name, 'them') || ' ' || NEW.rating || '/5: "' || LEFT(NEW.comment, 80) || '..."',
        _meta
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Update notify_receipt_status_change to include link
CREATE OR REPLACE FUNCTION public.notify_receipt_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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
      jsonb_build_object('receipt_id', NEW.id, 'status', NEW.status, 'developer_name', NEW.developer_name, 'link', '/buyer/reviews')
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Update check_leaderboard_rank_change to include link
CREATE OR REPLACE FUNCTION public.check_leaderboard_rank_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _old_points integer;
  _new_points integer;
  _old_rank integer;
  _new_rank integer;
BEGIN
  _old_points := OLD.community_posts * 15 + OLD.community_replies * 10 + OLD.community_votes * 5 +
                 OLD.developers_viewed * 2 + OLD.projects_saved * 4 + OLD.helpful_votes * 3 + OLD.reports_unlocked * 10;
  _new_points := NEW.community_posts * 15 + NEW.community_replies * 10 + NEW.community_votes * 5 +
                 NEW.developers_viewed * 2 + NEW.projects_saved * 4 + NEW.helpful_votes * 3 + NEW.reports_unlocked * 10;

  IF _new_points <= _old_points THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) + 1 INTO _old_rank
  FROM public.buyer_engagement
  WHERE (community_posts * 15 + community_replies * 10 + community_votes * 5 +
         developers_viewed * 2 + projects_saved * 4 + helpful_votes * 3 + reports_unlocked * 10) > _old_points
    AND user_id != NEW.user_id;

  SELECT COUNT(*) + 1 INTO _new_rank
  FROM public.buyer_engagement
  WHERE (community_posts * 15 + community_replies * 10 + community_votes * 5 +
         developers_viewed * 2 + projects_saved * 4 + helpful_votes * 3 + reports_unlocked * 10) > _new_points
    AND user_id != NEW.user_id;

  IF _new_rank < _old_rank THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'announcement',
      '🎉 You moved up on the Leaderboard!',
      'Congratulations! You climbed from #' || _old_rank || ' to #' || _new_rank || ' on the community leaderboard. Keep it up!',
      jsonb_build_object('old_rank', _old_rank, 'new_rank', _new_rank, 'total_points', _new_points, 'link', '/leaderboard')
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Update update_user_streak to include link
CREATE OR REPLACE FUNCTION public.update_user_streak(_user_id uuid)
 RETURNS TABLE(current_streak integer, longest_streak integer, bonus_awarded integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _existing record;
  _today date := CURRENT_DATE;
  _new_streak integer;
  _new_longest integer;
  _bonus integer := 0;
  _old_streak integer := 0;
BEGIN
  SELECT * INTO _existing FROM public.user_streaks WHERE user_id = _user_id;

  IF _existing IS NULL THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_active_date, streak_bonus_points)
    VALUES (_user_id, 1, 1, _today, 0);
    current_streak := 1;
    longest_streak := 1;
    bonus_awarded := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  IF _existing.last_active_date = _today THEN
    current_streak := _existing.current_streak;
    longest_streak := _existing.longest_streak;
    bonus_awarded := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  _old_streak := _existing.current_streak;

  IF _existing.last_active_date = _today - 1 THEN
    _new_streak := _existing.current_streak + 1;
  ELSE
    _new_streak := 1;
  END IF;

  _new_longest := GREATEST(_existing.longest_streak, _new_streak);

  IF _new_streak IN (3, 7, 14, 30) AND _new_streak > _old_streak THEN
    _bonus := CASE _new_streak
      WHEN 3 THEN 10
      WHEN 7 THEN 25
      WHEN 14 THEN 50
      WHEN 30 THEN 100
    END;

    PERFORM public.create_notification(
      _user_id,
      'announcement',
      '🔥 ' || _new_streak || '-Day Streak!',
      'Amazing! You''ve been active for ' || _new_streak || ' days in a row! You earned ' || _bonus || ' bonus points. Keep the momentum going!',
      jsonb_build_object('streak', _new_streak, 'bonus_points', _bonus, 'link', '/leaderboard')
    );
  END IF;

  UPDATE public.user_streaks
  SET current_streak = _new_streak,
      longest_streak = _new_longest,
      last_active_date = _today,
      streak_bonus_points = streak_bonus_points + _bonus,
      updated_at = now()
  WHERE user_id = _user_id;

  current_streak := _new_streak;
  longest_streak := _new_longest;
  bonus_awarded := _bonus;
  RETURN NEXT;
  RETURN;
END;
$function$;
