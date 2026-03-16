
-- Create community_reactions table
CREATE TABLE public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.community_replies(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id, emoji),
  UNIQUE (user_id, reply_id, emoji)
);

-- Enable RLS
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read reactions
CREATE POLICY "Anyone can read reactions"
  ON public.community_reactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can insert own reactions
CREATE POLICY "Users can insert own reactions"
  ON public.community_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own reactions
CREATE POLICY "Users can delete own reactions"
  ON public.community_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions;
