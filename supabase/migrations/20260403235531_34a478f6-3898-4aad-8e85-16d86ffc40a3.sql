CREATE TABLE IF NOT EXISTS public.trust_score_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id text NOT NULL,
  avg_rating numeric(3,2),
  review_count integer DEFAULT 0,
  verified_pct numeric(5,2) DEFAULT 0,
  computed_score numeric(5,2),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (business_id, snapshot_date)
);

ALTER TABLE public.trust_score_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read snapshots" ON public.trust_score_snapshots;
DROP POLICY IF EXISTS "Service role can insert snapshots" ON public.trust_score_snapshots;

CREATE POLICY "Authenticated read snapshots" ON public.trust_score_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert snapshots" ON public.trust_score_snapshots FOR INSERT TO authenticated WITH CHECK (true);