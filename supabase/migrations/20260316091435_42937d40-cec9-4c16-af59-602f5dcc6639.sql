
-- Weekly engagement table (mirrors buyer_engagement, resets every Monday)
CREATE TABLE public.weekly_buyer_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  developers_viewed integer NOT NULL DEFAULT 0,
  projects_saved integer NOT NULL DEFAULT 0,
  reports_unlocked integer NOT NULL DEFAULT 0,
  helpful_votes integer NOT NULL DEFAULT 0,
  community_posts integer NOT NULL DEFAULT 0,
  community_replies integer NOT NULL DEFAULT 0,
  community_votes integer NOT NULL DEFAULT 0,
  week_start timestamp with time zone NOT NULL DEFAULT date_trunc('week', now()),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

-- RLS
ALTER TABLE public.weekly_buyer_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly engagement"
  ON public.weekly_buyer_engagement FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly engagement"
  ON public.weekly_buyer_engagement FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly engagement"
  ON public.weekly_buyer_engagement FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all weekly engagement"
  ON public.weekly_buyer_engagement FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Weekly leaderboard function (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard(_limit integer DEFAULT 50)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  community_posts integer,
  community_replies integer,
  community_votes integer,
  developers_viewed integer,
  projects_saved integer,
  helpful_votes integer,
  reports_unlocked integer,
  total_points integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    we.user_id,
    COALESCE(p.full_name, 'Anonymous') as full_name,
    p.avatar_url,
    we.community_posts,
    we.community_replies,
    we.community_votes,
    we.developers_viewed,
    we.projects_saved,
    we.helpful_votes,
    we.reports_unlocked,
    (
      we.community_posts * 15 +
      we.community_replies * 10 +
      we.community_votes * 5 +
      we.developers_viewed * 2 +
      we.projects_saved * 4 +
      we.helpful_votes * 3 +
      we.reports_unlocked * 10
    )::integer as total_points
  FROM public.weekly_buyer_engagement we
  LEFT JOIN public.profiles p ON p.user_id = we.user_id
  WHERE we.week_start = date_trunc('week', now())
    AND (
      we.community_posts > 0 OR
      we.community_replies > 0 OR
      we.community_votes > 0 OR
      we.developers_viewed > 0 OR
      we.projects_saved > 0
    )
  ORDER BY total_points DESC
  LIMIT _limit
$$;
