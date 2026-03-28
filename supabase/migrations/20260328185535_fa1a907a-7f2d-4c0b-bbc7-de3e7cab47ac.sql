
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_flags jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'clean';
