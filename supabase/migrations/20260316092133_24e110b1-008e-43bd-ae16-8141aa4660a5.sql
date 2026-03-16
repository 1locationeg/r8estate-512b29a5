
-- Streak tracking table
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date NOT NULL DEFAULT CURRENT_DATE,
  streak_bonus_points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all streaks"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to update streak and award bonus points + notifications
CREATE OR REPLACE FUNCTION public.update_user_streak(_user_id uuid)
RETURNS TABLE(current_streak integer, longest_streak integer, bonus_awarded integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- First ever activity
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_active_date, streak_bonus_points)
    VALUES (_user_id, 1, 1, _today, 0);
    current_streak := 1;
    longest_streak := 1;
    bonus_awarded := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Already logged today
  IF _existing.last_active_date = _today THEN
    current_streak := _existing.current_streak;
    longest_streak := _existing.longest_streak;
    bonus_awarded := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  _old_streak := _existing.current_streak;

  -- Consecutive day (yesterday)
  IF _existing.last_active_date = _today - 1 THEN
    _new_streak := _existing.current_streak + 1;
  ELSE
    -- Streak broken
    _new_streak := 1;
  END IF;

  _new_longest := GREATEST(_existing.longest_streak, _new_streak);

  -- Award bonus points at milestones: 3, 7, 14, 30 day streaks
  IF _new_streak IN (3, 7, 14, 30) AND _new_streak > _old_streak THEN
    _bonus := CASE _new_streak
      WHEN 3 THEN 10
      WHEN 7 THEN 25
      WHEN 14 THEN 50
      WHEN 30 THEN 100
    END;

    -- Send notification for streak milestone
    PERFORM public.create_notification(
      _user_id,
      'announcement',
      '🔥 ' || _new_streak || '-Day Streak!',
      'Amazing! You''ve been active for ' || _new_streak || ' days in a row! You earned ' || _bonus || ' bonus points. Keep the momentum going!',
      jsonb_build_object('streak', _new_streak, 'bonus_points', _bonus)
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
$$;
