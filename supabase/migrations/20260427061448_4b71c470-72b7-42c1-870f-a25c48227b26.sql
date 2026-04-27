-- Add per_category_counts column for category sample sizes
ALTER TABLE public.trust_score_snapshots
  ADD COLUMN IF NOT EXISTS per_category_counts jsonb DEFAULT '{}'::jsonb;

-- Unique constraint: one snapshot per developer per day (upsert target)
CREATE UNIQUE INDEX IF NOT EXISTS trust_score_snapshots_business_day_idx
  ON public.trust_score_snapshots (business_id, snapshot_date);

-- Recalculation function: mirrors src/lib/trustScoreCalculator.ts
CREATE OR REPLACE FUNCTION public.recalculate_trust_score(p_developer_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count           int;
  v_avg             numeric;
  v_verified_count  int;
  v_verified_ratio  numeric;
  v_recent_count    int;
  v_recent_ratio    numeric;
  v_rating_pts      numeric;
  v_volume_pts      numeric;
  v_verif_pts       numeric;
  v_recency_pts     numeric;
  v_total           int;
  v_cat_counts      jsonb;
BEGIN
  -- Aggregate stats from approved reviews only
  SELECT
    COUNT(*),
    COALESCE(AVG(rating), 0),
    COUNT(*) FILTER (WHERE is_verified = true OR verification_level IN ('identity_verified','receipt_verified')),
    COUNT(*) FILTER (WHERE created_at >= now() - interval '90 days')
  INTO v_count, v_avg, v_verified_count, v_recent_count
  FROM public.reviews
  WHERE developer_id = p_developer_id
    AND status = 'approved';

  IF v_count = 0 THEN
    -- Nothing to snapshot; remove today's stale row if any.
    DELETE FROM public.trust_score_snapshots
     WHERE business_id = p_developer_id
       AND snapshot_date = CURRENT_DATE;
    RETURN;
  END IF;

  v_verified_ratio := v_verified_count::numeric / v_count;
  v_recent_ratio   := v_recent_count::numeric / v_count;

  -- Pillar points (60/25/10/5)
  v_rating_pts  := LEAST(60, GREATEST(0, (v_avg / 5.0) * 60));
  v_volume_pts  := LEAST(25, GREATEST(0, (LOG(10, v_count + 1) / LOG(10, 101)) * 25));
  v_verif_pts   := LEAST(10, GREATEST(0, v_verified_ratio * 10));
  v_recency_pts := LEAST(5,  GREATEST(0, v_recent_ratio  * 5));

  v_total := ROUND(v_rating_pts + v_volume_pts + v_verif_pts + v_recency_pts);

  -- Per-category sample sizes (delivery / quality / financial / support)
  SELECT jsonb_build_object(
    'delivery',  COUNT(*) FILTER (WHERE (category_ratings->>'delivery')::numeric  > 0),
    'quality',   COUNT(*) FILTER (WHERE (category_ratings->>'quality')::numeric   > 0),
    'financial', COUNT(*) FILTER (WHERE (category_ratings->>'financial')::numeric > 0),
    'support',   COUNT(*) FILTER (WHERE (category_ratings->>'support')::numeric   > 0)
  )
  INTO v_cat_counts
  FROM public.reviews
  WHERE developer_id = p_developer_id
    AND status = 'approved'
    AND category_ratings IS NOT NULL;

  -- Upsert today's snapshot
  INSERT INTO public.trust_score_snapshots
    (business_id, snapshot_date, computed_score, avg_rating, review_count, verified_pct, per_category_counts)
  VALUES
    (p_developer_id, CURRENT_DATE, v_total, ROUND(v_avg::numeric, 2), v_count, ROUND(v_verified_ratio::numeric, 4), COALESCE(v_cat_counts, '{}'::jsonb))
  ON CONFLICT (business_id, snapshot_date) DO UPDATE
    SET computed_score      = EXCLUDED.computed_score,
        avg_rating          = EXCLUDED.avg_rating,
        review_count        = EXCLUDED.review_count,
        verified_pct        = EXCLUDED.verified_pct,
        per_category_counts = EXCLUDED.per_category_counts;
END;
$$;

-- Trigger function: handle insert / update / delete and recalc affected developers
CREATE OR REPLACE FUNCTION public.trigger_recalculate_trust_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_trust_score(OLD.developer_id);
    RETURN OLD;
  END IF;

  PERFORM public.recalculate_trust_score(NEW.developer_id);

  -- If a review was reassigned to a different developer, refresh the old one too.
  IF TG_OP = 'UPDATE' AND OLD.developer_id IS DISTINCT FROM NEW.developer_id THEN
    PERFORM public.recalculate_trust_score(OLD.developer_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_trust_score_recalc ON public.reviews;
CREATE TRIGGER reviews_trust_score_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_trust_score();