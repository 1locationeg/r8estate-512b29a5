
ALTER TABLE public.buyer_engagement 
  ADD COLUMN IF NOT EXISTS community_posts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS community_replies integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS community_votes integer NOT NULL DEFAULT 0;
