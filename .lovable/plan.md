

## Plan: Auto-rotating reviews with distinct business reply styling

### Changes to `src/components/FeaturedIdentitySpotlight.tsx`

1. **Add `reviewIndex` state** and auto-rotate every 5 seconds through `devReviews`, resetting when the developer changes.

2. **Show one review at a time** with a fade-in animation (reuse `animate-fade-in`). Remove arrows — rotation is fully automatic. Add small dot indicators below the review so users can see progress.

3. **Keep "View all reviews" button** — still toggles `showAllReviews` to expand the full list. When expanded, auto-rotation pauses.

4. **Restyle business reply block** to be clearly distinguishable:
   - Add a colored left border (`border-l-2 border-primary`) and a "Business Reply" / "رد الشركة" label badge with a `Building2` icon instead of `MessageSquare`.
   - Use a slightly different background (`bg-primary/5`) so it visually separates from user reviews.
   - Make the label more prominent with a small pill badge.

### Summary of behavior
- Single review visible → auto-fades to next every 5s → dot indicators show position
- "View all reviews" expands full list and stops rotation
- Business replies get a distinct visual treatment (colored border, icon, label badge)

