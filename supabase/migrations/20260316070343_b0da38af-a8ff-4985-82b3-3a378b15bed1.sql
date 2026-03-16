
-- Create community post category enum
CREATE TYPE public.community_post_category AS ENUM ('discussion', 'question', 'tip', 'experience', 'poll');

-- Create community_posts table
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  category community_post_category NOT NULL DEFAULT 'discussion',
  developer_id text,
  upvotes integer NOT NULL DEFAULT 0,
  reply_count integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create community_replies table
CREATE TABLE public.community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  parent_reply_id uuid REFERENCES public.community_replies(id) ON DELETE CASCADE,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create community_votes table
CREATE TABLE public.community_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.community_replies(id) ON DELETE CASCADE,
  vote_type text NOT NULL DEFAULT 'up',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id),
  UNIQUE (user_id, reply_id)
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

-- community_posts RLS
CREATE POLICY "Anyone can read community posts" ON public.community_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all posts" ON public.community_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- community_replies RLS
CREATE POLICY "Anyone can read community replies" ON public.community_replies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.community_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON public.community_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.community_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all replies" ON public.community_replies FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- community_votes RLS
CREATE POLICY "Anyone can read votes" ON public.community_votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can vote" ON public.community_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own votes" ON public.community_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Updated_at trigger for posts
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_replies;

-- Function to increment/decrement reply_count
CREATE OR REPLACE FUNCTION public.update_post_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_reply_count_on_insert AFTER INSERT ON public.community_replies FOR EACH ROW EXECUTE FUNCTION public.update_post_reply_count();
CREATE TRIGGER update_reply_count_on_delete AFTER DELETE ON public.community_replies FOR EACH ROW EXECUTE FUNCTION public.update_post_reply_count();
