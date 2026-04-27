
# TrustScore Calculation + Verification Breakdown — DeveloperDetailCard

## Problem with the current state

Looking at `src/components/DeveloperDetailCard.tsx` today:

- The big circular score is just `developer.trustScore` (a static number from `mockData.ts`).
- The 6 category bars are computed as `developer.trustScore ± a hardcoded offset` (line 132–139). They are **not** derived from real reviews.
- There is no UI that explains *why* the score is what it is or *how each category was earned*.
- `ItemDetailSection.tsx` already has a real formula (rating 70 / volume 30 + per-category aggregation from `category_ratings` JSONB), but `DeveloperDetailCard` does not use it.
- Verification badges (verified business, KYC reviewer, verified buyer receipt) exist in the system but are not surfaced on this card with any explanation of *what they mean*.

The user's request is to make the score **earned and visible** — show the math, show which signals contributed, and show how each verification badge was obtained.

## Solution overview

Three deliverables, all read-only against the existing schema (no DB migration needed — every input already exists):

1. **A pure calculator** `src/lib/trustScoreCalculator.ts` that returns the score **plus the breakdown** (each pillar's contribution, each category's source, confidence level).
2. **A new `TrustScoreBreakdown` modal** opened from an "How is this calculated?" link next to the gauge. Shows the formula, each pillar's points, category sources (real vs estimated), and recency confidence.
3. **A `VerificationLegend` accordion** below the trust categories that lists every badge type the platform issues (Verified Business, KYC Reviewer, Verified Buyer, Identity-linked Reviewer) with the exact criteria to earn each, plus a live count of how many of this developer's reviews carry each badge.

## 1. The calculator — `src/lib/trustScoreCalculator.ts` (new file)

Single source of truth, used by `DeveloperDetailCard`, `ItemDetailSection`, and `ItemDetailModal` going forward (we only wire `DeveloperDetailCard` in this task; the other two keep working as-is).

### Formula (matches the methodology already documented in the founder pack)

```
TrustScore = round( ratingScore + volumeScore + verificationBoost + recencyAdjustment )
             clamped to [0, 100]

ratingScore        = (avgRating / 5) * 60         // up to 60 pts — what reviewers say
volumeScore        = log10(reviewCount + 1) / log10(100) * 25   // up to 25 pts — sample size, capped at 100 reviews = full marks
verificationBoost  = (verifiedReviewRatio) * 10   // up to 10 pts — % of reviews that are KYC/receipt-verified
recencyAdjustment  = (reviewsLast90Days / max(reviewCount, 1)) * 5  // up to 5 pts — freshness
```

Returns:

```ts
interface TrustScoreBreakdown {
  total: number;                    // 0–100
  pillars: {
    rating:       { points: number; max: 60; avgRating: number; reviewCount: number };
    volume:       { points: number; max: 25; reviewCount: number };
    verification: { points: number; max: 10; verifiedCount: number; ratio: number };
    recency:      { points: number; max: 5;  recentCount: number };
  };
  confidence: 'low' | 'medium' | 'high';   // <5 reviews=low, 5-19=medium, ≥20=high
  categoryScores: Array<{
    key: string;          // e.g. "deliveryQuality"
    label: string;        // i18n label
    score: number;        // 0–100
    source: 'reviews' | 'estimated';
    sampleSize: number;   // # reviews that rated this category
  }>;
}
```

### Inputs

The calculator takes **only** what's already available on the page — no extra queries:

- `reviews: ReviewWithCategories[]` from the existing `useReviews(developer.id)` hook.
- `fallback: { rating, reviewCount, trustScore }` from the `Developer` mock object — used when `reviews.length === 0` so the visual doesn't go blank for static seed data.

When `reviews.length === 0`, the breakdown reports `confidence: 'low'`, all pillars marked as **estimated**, and the categoryScores fall back to the existing `developer.trustScore ± variance` logic but each bar is tagged `source: 'estimated'` so the UI can show a dashed border + "Estimate" label.

### Category aggregation

Uses the same approach already proven in `ItemDetailSection.tsx` lines 221–239:

- For each canonical key in `getCategoryMetricKeys('developers')` → `[projectTimeliness, constructionQuality, developerCommunication, valueForMoney, documentationLegality, customerService]`,
- Filter `reviews` where `r.categoryRatings?.[key] > 0`,
- Average those values, scale to 0–100, mark `source: 'reviews'`, record `sampleSize`.
- If `sampleSize === 0`, fall back to the overall rating and mark `source: 'estimated'`.

This means the bars become **truthful**: they only show "data-backed" when buyers actually rated that category.

## 2. UI changes inside `DeveloperDetailCard.tsx`

### 2a. Replace the static gauge data

Replace lines 96 + 132–139:

```ts
const { reviews, refetch: refetchReviews } = useReviews(developer.id);
const breakdown = useMemo(
  () => calculateTrustScore(reviews, {
    rating: developer.rating,
    reviewCount: developer.reviewCount,
    trustScore: developer.trustScore,
  }),
  [reviews, developer]
);
```

The big circular gauge now reads `breakdown.total`. The 6 category bars come from `breakdown.categoryScores`.

### 2b. New "How is this calculated?" trigger

Directly under the "TRUST SCORE" label inside the gauge (around line 176), add:

```tsx
<button
  onClick={() => setBreakdownOpen(true)}
  className="mt-1 text-[10px] underline text-muted-foreground hover:text-primary inline-flex items-center gap-1"
>
  <Info className="w-3 h-3" />
  {t("trust.howCalculated", "How is this calculated?")}
</button>
```

Plus a small **confidence chip** next to the score: "High confidence • 47 reviews" / "Limited data • 2 reviews".

### 2c. Tag each category bar with its source

`TrustCategoryBar` gets two new optional props: `source?: 'reviews' | 'estimated'` and `sampleSize?: number`. When `source === 'estimated'` the bar gets a `border-dashed` style and a small "Estimate" tooltip (`title` attr). When `source === 'reviews'`, append `· n reviews` muted text on the right.

### 2d. Verification Legend (collapsible)

New section below the category bars, inside the same card:

```
─────────────────────────────────────────────────
  How verifications are earned        [chevron ▼]
─────────────────────────────────────────────────
```

When opened, lists 4 badge rows. Each row: icon · name · 1-line criterion · live count for *this developer's* reviews:

| Badge | Criterion | Source field |
|---|---|---|
| 🛡 Verified Business | Owner submitted license + admin approved (`business_claims.status='approved'`) | derived from `developer.verified` |
| ✅ Verified Buyer | Reviewer uploaded an approved purchase receipt (`receipt_submissions.status='approved'`) | count of `reviews` with `is_verified=true` |
| 🔵 Identity-Linked | Reviewer linked Facebook/LinkedIn (`user_verifications.verification_type='social'`) | count from joining reviews→profiles (already done client-side via `ReviewVerificationBadge`) |
| 👤 KYC Reviewer | Reviewer passed KYC (`user_verifications.verification_type='kyc'`) | same join |

For the social/KYC counts we already fetch them per-review in `ReviewCard` via `ReviewVerificationBadge`. We add a one-shot Supabase query inside the breakdown hook to count distinct verified reviewers for this developer:

```sql
-- counted client-side from already-loaded reviews; no new query if we pass user_id list
```

Since the reviews are already loaded, we count locally: `reviews.filter(r => r.profileVerified).length` for the KYC chip; for receipt-verified we use `r.verified`. **No new database round-trip.**

## 3. New modal — `src/components/TrustScoreBreakdown.tsx`

Standard `Dialog` from `@/components/ui/dialog`. Three sections:

### Section A — The formula (visual)

A horizontal stack of 4 mini bars showing each pillar's contribution:

```
Rating       ████████████░░░░░░  42 / 60   (4.2★ avg)
Volume       █████████░░░░░░░░░  18 / 25   (47 reviews)
Verification ████░░░░░░░░░░░░░░   4 / 10   (38% verified)
Recency      ████░░░░░░░░░░░░░░   3 / 5    (12 in last 90d)
─────────────────────────────────────────
TOTAL                              67 / 100
```

Each row has a small `(?)` tooltip explaining that pillar.

### Section B — Category breakdown

Same 6 categories, but each shows the **source of truth**:

- "Construction Quality — 78% — based on 23 reviews" (green dot)
- "Documentation & Legality — 70% — estimated from overall rating" (gray dot)

A footer line: *"Categories marked 'estimated' will become data-backed once at least one reviewer rates them."*

### Section C — Methodology link

Plain-language paragraph (i18n keys `trustMethod.*`) plus a "Read full methodology" link to `/about/trust-meter` (already exists per `src/pages/AboutTrustMeter.tsx`).

## 4. i18n keys to add

`src/i18n/locales/en.json` and `ar.json` get a new `trustMethod` namespace:

- `trustMethod.title` = "How this Trust Score was earned"
- `trustMethod.pillar.rating` / `.volume` / `.verification` / `.recency` (label + tooltip)
- `trustMethod.confidence.low` / `.medium` / `.high`
- `trustMethod.source.reviews` = "Based on {{n}} reviews"
- `trustMethod.source.estimated` = "Estimated — no category ratings yet"
- `trustMethod.legend.title` = "How verifications are earned"
- `trustMethod.legend.verifiedBusiness` / `.verifiedBuyer` / `.identityLinked` / `.kycReviewer` (criterion + earn-how)
- Arabic uses Ammiya (project rule: warm-friend tone).

## 5. Files touched

**New:**
- `src/lib/trustScoreCalculator.ts` — pure function, ~120 lines, fully unit-testable.
- `src/components/TrustScoreBreakdown.tsx` — modal, ~180 lines.
- `src/components/VerificationLegend.tsx` — collapsible card, ~100 lines.

**Modified:**
- `src/components/DeveloperDetailCard.tsx` — wire calculator + open modal + render legend (~30 lines changed).
- `src/components/TrustCategoryBar.tsx` — add `source` + `sampleSize` props, dashed-border variant (~15 lines added).
- `src/i18n/locales/en.json` and `ar.json` — add `trustMethod` namespace (~30 keys × 2 langs).

**Untouched (deliberately):**
- Database schema — every input exists today (`reviews.rating`, `reviews.category_ratings`, `reviews.is_verified`, `reviews.created_at`, `business_profiles.user_id` for verified status).
- `ItemDetailSection.tsx` and `ItemDetailModal.tsx` — they have their own working pipeline; we leave them stable. (A follow-up task could DRY them onto the new calculator.)
- All edge functions, RLS, RPCs — none required.

## 6. Visual + behavioral acceptance criteria

1. The big gauge number on `/entity/:id` (which routes through `DeveloperDetailCard` for developers) reflects the calculator output, not `developer.trustScore`. For developers with zero real reviews, it falls back to the seed value but shows a "Limited data" chip.
2. Clicking "How is this calculated?" opens the breakdown modal with 4 pillar bars summing to the displayed score.
3. Category bars rendered from real reviews show "· N reviews" suffix; estimated ones show dashed border + "Estimate" tooltip.
4. The Verification Legend lists 4 badges with live counts and is collapsible (closed by default on mobile, open on desktop).
5. RTL: all bars and the modal mirror correctly using existing `ms-/me-/ps-/pe-` logical properties (per project rule).
6. Mobile 390px: gauge stays centered, modal scrolls cleanly, no horizontal overflow (per project rule).
7. No new database round-trips beyond the existing `useReviews(developerId)` call.
8. No console errors; no change to existing tests.

## 7. Out of scope (intentionally)

- No changes to how reviews are submitted or moderated.
- No changes to the verification approval flow (admin queues stay as-is).
- No backend recomputation / cron — the score is computed live from already-loaded review data, which matches the current architecture.
- No update to the seed-data `trustScore` field — it remains as a fallback and for sorting in list pages until a future task migrates list pages to the new calculator.
