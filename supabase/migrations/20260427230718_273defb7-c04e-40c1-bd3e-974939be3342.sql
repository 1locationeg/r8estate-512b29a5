-- Add weighted-trust columns to snapshots
ALTER TABLE public.trust_score_snapshots
  ADD COLUMN IF NOT EXISTS weighted_avg_rating numeric,
  ADD COLUMN IF NOT EXISTS contract_verified_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_weight numeric DEFAULT 0;

-- Rewrite trust score calculator with weighted aggregation
-- Weight ladder: contract=10, identity=3, named=1.5, anonymous=1.0, guest=0.3
-- (guests live in guest_reviews, not reviews, so the floor here is 1.0 anonymous)
CREATE OR REPLACE FUNCTION public.recalculate_trust_score(p_developer_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count                 int;
  v_total_weight          numeric;
  v_weighted_avg          numeric;
  v_contract_count        int;
  v_contract_weight       numeric;
  v_verified_weight_ratio numeric;
  v_recent_count          int;
  v_recent_ratio          numeric;
  v_rating_pts            numeric;
  v_volume_pts            numeric;
  v_verif_pts             numeric;
  v_recency_pts           numeric;
  v_total                 int;
  v_cat_counts            jsonb;
BEGIN
  -- Single pass over approved reviews with computed weight per row
  WITH r AS (
    SELECT
      rating,
      created_at,
      verification_level,
      is_anonymous,
      is_verified,
      category_ratings,
      CASE
        WHEN verification_level = 'transaction' THEN 10.0
        WHEN verification_level = 'identity'    THEN 3.0
        WHEN is_verified = true                  THEN 3.0
        WHEN is_anonymous = false                THEN 1.5
        ELSE 1.0
      END AS w
    FROM public.reviews
    WHERE developer_id = p_developer_id
      AND status = 'approved'
  )
  SELECT
    COUNT(*),
    COALESCE(SUM(w), 0),
    COALESCE(SUM(rating * w) / NULLIF(SUM(w), 0), 0),
    COUNT(*) FILTER (WHERE verification_level = 'transaction'),
    COALESCE(SUM(w) FILTER (WHERE verification_level = 'transaction'), 0),
    COUNT(*) FILTER (WHERE created_at >= now() - interval '90 days')
  INTO v_count, v_total_weight, v_weighted_avg, v_contract_count, v_contract_weight, v_recent_count
  FROM r;

  IF v_count = 0 THEN
    DELETE FROM public.trust_score_snapshots
     WHERE business_id = p_developer_id
       AND snapshot_date = CURRENT_DATE;
    RETURN;
  END IF;

  -- Verification pillar uses weight share, not headcount, so 1 contract reviewer
  -- can outweigh many anonymous ones — exactly the 10x rule.
  v_verified_weight_ratio := CASE WHEN v_total_weight > 0
    THEN v_contract_weight / v_total_weight ELSE 0 END;
  v_recent_ratio := v_recent_count::numeric / v_count;

  -- Pillar points (60/25/10/5) — rating is now weighted
  v_rating_pts  := LEAST(60, GREATEST(0, (v_weighted_avg / 5.0) * 60));
  v_volume_pts  := LEAST(25, GREATEST(0, (LOG(10, v_count + 1) / LOG(10, 101)) * 25));
  v_verif_pts   := LEAST(10, GREATEST(0, v_verified_weight_ratio * 10));
  v_recency_pts := LEAST(5,  GREATEST(0, v_recent_ratio  * 5));

  v_total := ROUND(v_rating_pts + v_volume_pts + v_verif_pts + v_recency_pts);

  -- Per-category sample sizes (unchanged — counts of reviewers who rated each metric)
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

  -- Upsert today's snapshot, including the new weighted columns
  INSERT INTO public.trust_score_snapshots
    (business_id, snapshot_date, computed_score, avg_rating, review_count,
     verified_pct, per_category_counts,
     weighted_avg_rating, contract_verified_count, total_weight)
  VALUES
    (p_developer_id, CURRENT_DATE, v_total,
     ROUND(v_weighted_avg::numeric, 2), v_count,
     ROUND(v_verified_weight_ratio::numeric, 4),
     COALESCE(v_cat_counts, '{}'::jsonb),
     ROUND(v_weighted_avg::numeric, 4),
     v_contract_count,
     ROUND(v_total_weight::numeric, 4))
  ON CONFLICT (business_id, snapshot_date) DO UPDATE
    SET computed_score           = EXCLUDED.computed_score,
        avg_rating               = EXCLUDED.avg_rating,
        review_count             = EXCLUDED.review_count,
        verified_pct             = EXCLUDED.verified_pct,
        per_category_counts      = EXCLUDED.per_category_counts,
        weighted_avg_rating      = EXCLUDED.weighted_avg_rating,
        contract_verified_count  = EXCLUDED.contract_verified_count,
        total_weight             = EXCLUDED.total_weight;
END;
$$;

-- Backfill: refresh snapshots for any developer that already has approved reviews
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT DISTINCT developer_id FROM public.reviews WHERE status = 'approved'
  LOOP
    PERFORM public.recalculate_trust_score(r.developer_id);
  END LOOP;
END $$;