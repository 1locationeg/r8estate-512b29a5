
-- Function to check rank changes and notify users
CREATE OR REPLACE FUNCTION public.check_leaderboard_rank_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_points integer;
  _new_points integer;
  _old_rank integer;
  _new_rank integer;
BEGIN
  -- Calculate old points
  _old_points := OLD.community_posts * 15 + OLD.community_replies * 10 + OLD.community_votes * 5 +
                 OLD.developers_viewed * 2 + OLD.projects_saved * 4 + OLD.helpful_votes * 3 + OLD.reports_unlocked * 10;
  
  -- Calculate new points
  _new_points := NEW.community_posts * 15 + NEW.community_replies * 10 + NEW.community_votes * 5 +
                 NEW.developers_viewed * 2 + NEW.projects_saved * 4 + NEW.helpful_votes * 3 + NEW.reports_unlocked * 10;

  -- Only check if points actually increased
  IF _new_points <= _old_points THEN
    RETURN NEW;
  END IF;

  -- Get old rank (how many users had more points than old score)
  SELECT COUNT(*) + 1 INTO _old_rank
  FROM public.buyer_engagement
  WHERE (community_posts * 15 + community_replies * 10 + community_votes * 5 +
         developers_viewed * 2 + projects_saved * 4 + helpful_votes * 3 + reports_unlocked * 10) > _old_points
    AND user_id != NEW.user_id;

  -- Get new rank (how many users have more points than new score)
  SELECT COUNT(*) + 1 INTO _new_rank
  FROM public.buyer_engagement
  WHERE (community_posts * 15 + community_replies * 10 + community_votes * 5 +
         developers_viewed * 2 + projects_saved * 4 + helpful_votes * 3 + reports_unlocked * 10) > _new_points
    AND user_id != NEW.user_id;

  -- If rank improved (lower number = better rank)
  IF _new_rank < _old_rank THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'announcement',
      '🎉 You moved up on the Leaderboard!',
      'Congratulations! You climbed from #' || _old_rank || ' to #' || _new_rank || ' on the community leaderboard. Keep it up!',
      jsonb_build_object('old_rank', _old_rank, 'new_rank', _new_rank, 'total_points', _new_points)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger on buyer_engagement updates
CREATE TRIGGER on_engagement_rank_change
  AFTER UPDATE ON public.buyer_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.check_leaderboard_rank_change();
