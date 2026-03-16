
CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 50)
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
    be.user_id,
    COALESCE(p.full_name, 'Anonymous') as full_name,
    p.avatar_url,
    be.community_posts,
    be.community_replies,
    be.community_votes,
    be.developers_viewed,
    be.projects_saved,
    be.helpful_votes,
    be.reports_unlocked,
    (
      be.community_posts * 15 +
      be.community_replies * 10 +
      be.community_votes * 5 +
      be.developers_viewed * 2 +
      be.projects_saved * 4 +
      be.helpful_votes * 3 +
      be.reports_unlocked * 10
    )::integer as total_points
  FROM public.buyer_engagement be
  LEFT JOIN public.profiles p ON p.user_id = be.user_id
  WHERE (
    be.community_posts > 0 OR
    be.community_replies > 0 OR
    be.community_votes > 0 OR
    be.developers_viewed > 0 OR
    be.projects_saved > 0
  )
  ORDER BY total_points DESC
  LIMIT _limit
$$;
