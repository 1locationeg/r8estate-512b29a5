## The Rule

> A review with an OCR/AI-verified sales contract carries **10× the weight** of an anonymous comment when computing a developer's Trust Score, average rating, and category breakdowns.

This turns "Verified Buyer" from a badge into actual scoring power — directly aligning incentives with the platform's anti-scam mission.

## Weight Tiers

We map each review to a numeric `trust_weight` based on its strongest verification signal:

| Tier | Signal | Weight |
|---|---|---|
| Contract-Verified | `verification_level = 'transaction'` (receipt/contract OCR-approved by admin) | **10.0** |
| Identity-Verified | `verification_level = 'identity'` (KYC) | 3.0 |
| Authenticated, Named | logged-in user, `is_anonymous = false`, `verification_level = 'none'` | 1.5 |
| Authenticated, Anonymous | logged-in user, `is_anonymous = true` | 1.0 |
| Guest/Unclaimed | `guest_reviews` row | 0.3 |

Anonymous = the **floor (1.0)**, contract = **10×** that floor — exactly as stated. Other tiers sit on the curve so the system feels fair, not binary.

## What Changes

### 1. Database — weighted aggregation (single source of truth)

Update `public.recalculate_trust_score(p_developer_id text)` so all aggregates become **weighted**:

- New CTE that selects each approved review with a computed `w` (CASE on `verification_level`, `is_anonymous`, etc.).
- `v_avg` → `SUM(rating * w) / SUM(w)` (weighted average rating).
- `v_count` stays the raw count (volume pillar shouldn't be gameable by one whale).
- `v_verified_count` becomes `SUM(w) FILTER (WHERE verification_level = 'transaction')` ÷ `SUM(w)` so the verification pillar reflects weight share, not headcount.
- New columns on `trust_score_snapshots`:
  - `weighted_avg_rating numeric`
  - `contract_verified_count int`
  - `total_weight numeric`
- Per-category averages in the snapshot also become weighted.

Trigger `reviews_trust_score_recalc` already fires on insert/update/delete — no change needed there. The contract-approval path in `AdminReceiptVerification.tsx` already updates `verification_level = 'transaction'`, which will now automatically re-trigger and amplify the score.

### 2. Frontend — mirror the formula in `src/lib/trustScoreCalculator.ts`

- Add `getReviewWeight(review)` helper returning the same tier weights.
- `calculateTrustScore` switches all aggregates to weighted versions so the live UI matches the DB snapshot.
- Add a new field on `TrustScoreBreakdown`: `weightProfile: { contractCount, contractWeightShare, totalWeight }` for tooltips.

### 3. UI Surfaces

**Trust Score gauge tooltip (EntityPage):** new line — "X contract-verified reviews carry 10× weight."

**Reviews list (`ReviewCard`):** contract-verified reviews get a distinct gold "10× Verified" chip next to the existing "Verified Buyer" badge, with a tooltip explaining the multiplier.

**WriteReviewModal — Verified Buyer step (Phase 4):** replace the existing "2× Points" copy on the multiplier card with **"10× Trust Weight"** as the headline benefit, keeping points as a secondary perk. This is the single biggest reviewer motivator on the platform — make it the hero.

**ReviewerProgram landing page:** add a new section "Why your contract matters" with the weight ladder (1× → 3× → 10×) as a visual.

### 4. i18n

Add keys in both `ar.json` and `en.json`:
- `trust.weightMultiplier.contract` — "10× trust weight" / "وزن ثقة ×10"
- `trust.weightMultiplier.tooltip` — short explanation
- `form.verifiedBuyer.weightHeadline` — replaces points-first copy
- `reviewerProgram.weightLadder.*` — section copy

Arabic register stays in the established "White Arabic" tone (professional + warm).

### 5. Analytics

Extend `review_funnel_events`: when a user reaches Phase 4 and sees the "10× Trust Weight" card, fire a `weight_multiplier_seen` event so we can measure if this messaging lifts contract-upload conversion.

## Files to Change

- `supabase/migrations/<new>.sql` — rewrite `recalculate_trust_score` with weights + add snapshot columns
- `src/lib/trustScoreCalculator.ts` — weighted formula + `getReviewWeight` export
- `src/hooks/useReviews.ts` — surface `verification_level` and weight on the mapped review
- `src/data/mockData.ts` (Review type) — add `verificationLevel` and `weight`
- `src/components/ReviewCard.tsx` — render "10× Verified" chip
- `src/components/WriteReviewModal.tsx` — Phase 4 verified-buyer card copy + analytics event
- `src/components/EntityPage*` (trust gauge tooltip area) — weighted explainer
- `src/pages/ReviewerProgram.tsx` — "Why your contract matters" section
- `src/i18n/locales/ar.json`, `src/i18n/locales/en.json` — new keys
- `src/lib/reviewFunnelAnalytics.ts` — new event type

## Out of Scope

- Changing how `is_verified` is set today (admin-driven contract review stays the same).
- Recomputing historical snapshots — the trigger will refresh on next write per developer; an optional one-off `SELECT recalculate_trust_score(id) FROM business_profiles` backfill can run after deploy if you want immediate updates.
- Display of weight on guest reviews (kept invisible to avoid confusing first-time visitors).

After approval I'll implement the migration + code in one pass.