
-- Deal votes table for "Would you take this deal?" poll
CREATE TABLE public.deal_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote boolean NOT NULL, -- true = yes, false = no
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

ALTER TABLE public.deal_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read vote counts
CREATE POLICY "Anyone can read deal votes" ON public.deal_votes
  FOR SELECT TO anon, authenticated USING (true);

-- Authenticated users can vote
CREATE POLICY "Users can insert own votes" ON public.deal_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can change their vote
CREATE POLICY "Users can update own votes" ON public.deal_votes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can remove their vote
CREATE POLICY "Users can delete own votes" ON public.deal_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
