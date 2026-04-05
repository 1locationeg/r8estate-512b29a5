

## Plan: 3-Phase Progressive Review Modal with Category Sub-Ratings

### Overview
Replace the current monolithic `WriteReviewModal` with a 3-phase progressive flow that reduces friction and collects category-specific ratings. Uses CSS transitions (not Framer Motion — avoiding a new dependency for simple slide animations).

### Phase 1: Star Rating
- Large interactive 5-star picker centered in the modal
- Progress bar at top: "Step 1 of 3"
- "Continue" button appears after star selection
- Rating saved to local state immediately

### Phase 2: AI-Powered Narrative
- Smooth slide-left transition from Phase 1
- Fields: Unit Type selector, Review Title input, Review Text textarea
- "AI Suggest" button calls the existing `review-ai-assist` edge function with `action: "suggest"`, passing rating + unit type + business name
- 3 AI-generated title suggestions rendered as clickable chips; clicking one auto-fills Title and seeds Review Text
- CTA: "Next: Add Details"

### Phase 3: Category Deep-Dive
- Horizontal sliders (using existing `Slider` component) for category-specific metrics
- Metrics are dynamic based on business category (uses existing `getCategoryMetricKeys`)
- Labels mapped per category (e.g., Apps → Usability, Performance, Features, Support)
- Disclaimer checkbox + Submit button
- On submit: inserts review with `category_ratings` JSON into the `reviews` or `guest_reviews` table

### Database Change
- Add `category_ratings jsonb DEFAULT '{}'` to both `reviews` and `guest_reviews` tables via migration

### Technical Details

**Files to create/edit:**

| File | Change |
|------|--------|
| Migration SQL | Add `category_ratings jsonb` to `reviews` and `guest_reviews` |
| `src/components/WriteReviewModal.tsx` | Full rewrite to 3-phase flow with progress bar, phase transitions via CSS `translate`, AI chips, category sliders |
| `src/components/ItemDetailSection.tsx` | Pass `entityCategory` prop to `WriteReviewModal`; compute `categoryScores` from real `category_ratings` in `dbReviews` |
| `src/hooks/useReviews.ts` | Include `category_ratings` in select/mapping |

**Key implementation notes:**
- Phase transitions use Tailwind `transition-transform duration-300` with `translateX` — no new dependency needed
- Progress bar uses existing `Progress` component from shadcn/ui
- Category sliders use existing `Slider` component (1-5 scale, step 1)
- AI suggest reuses the existing `review-ai-assist` edge function
- `entityCategory` prop added to `WriteReviewModal` interface; defaults to `"developers"` if not provided
- Review count on entity page (`(0 Reviews)`) will update from `liveReviewCount` which already reads `dbReviews.length`

**Trust score update flow:**
- Submit stores `category_ratings: { usability: 4, performance: 5, ... }` in DB
- `useReviews` fetches `category_ratings` per review
- `ItemDetailSection` useMemo aggregates real sub-ratings: averages each key across all reviews → converts to 0-100 for trust bars
- Falls back to rating-derived scores when no sub-ratings exist

