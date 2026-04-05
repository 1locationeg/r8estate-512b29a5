

## Plan: Make Reviews & Ratings Update Live on Entity Pages

### Problem
When a user submits a review for a dynamic business profile, the rating (0.0), trust score (0), star distribution bars, and review count all remain at zero. This is because:
1. The entity page loads business profiles with hardcoded `rating: 0, reviewCount: 0`
2. The `useMemo` that computes trust score, rating, and star distribution only reads from `item.rating` and `item.reviewCount` — it never uses the actual `dbReviews` fetched from the database
3. After a review is submitted, `refetchReviews` updates `dbReviews`, but nothing recalculates the displayed metrics

### Solution
Update `ItemDetailSection.tsx` to incorporate real review data (`dbReviews`) into the trust score, rating, and star distribution calculations for dynamic business profiles.

### Changes

**File: `src/components/ItemDetailSection.tsx`**

1. Add `dbReviews` to the `useMemo` dependency array
2. For dynamic profiles, compute real metrics from `dbReviews`:
   - **Rating**: average of all `dbReviews` star ratings (instead of hardcoded 0)
   - **Review count**: `dbReviews.length` (instead of 0)
   - **Star distribution**: actual percentage breakdown from real review ratings
   - **Trust score**: recalculated using the real rating and review count through the existing formula
3. Update the review count display (line ~877) to also use `dbReviews.length` for dynamic profiles
4. The existing `refetchReviews` callback (already wired to `WriteReviewModal.onReviewSubmitted`) will trigger `dbReviews` to update → `useMemo` recalculates → UI updates automatically

### What changes for users
- After writing a review, the rating gauge, trust score, star bars, and review count will update immediately
- All computed metrics (trust category bars, response rate) will reflect the real review data
- Static/mock entities remain unaffected — changes only apply when `isDynamicProfile` is true

### Files to edit
| File | Change |
|------|--------|
| `src/components/ItemDetailSection.tsx` | Use `dbReviews` in the `useMemo` to compute live rating, trust score, star distribution for dynamic profiles |

