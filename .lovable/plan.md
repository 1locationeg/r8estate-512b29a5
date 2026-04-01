

# Journey Station Visibility & Scroll Navigation Improvements

## Problem
1. The MiniJourneyArc (4-step journey circles) is not visible on first load — it's buried below the fold
2. The dot navigation on the side only appears after scrolling past hero, and uses small plain dots instead of labeled station rings like in the reference image
3. Scroll behavior needs to work smoothly on both mobile and desktop

## What Changes

### 1. Show MiniJourneyArc in the Hero Section
Add the MiniJourneyArc component (Research → Choose → Finance → Protect circles) directly inside the hero block in `Index.tsx`, positioned between the trust showcase and traction stats. This ensures the journey stations are visible on first open without scrolling.

### 2. Redesign Side Scroll Navigation (DotNav → Station Ring Nav)
Replace the plain dot navigation in `JourneyFullPageScroll.tsx` with labeled station rings inspired by the second reference image:
- Each dot becomes a larger hollow circle with the station's colored border
- Active station fills with color and shows a tooltip label (e.g., "1. Research")
- A vertical connecting line runs between the rings (like the reference image)
- The nav is always visible (including on hero section), not just when past hero
- Position: fixed right side, vertically centered

### 3. Ensure Smooth Scroll on Mobile & Desktop
- Keep `snap-y snap-mandatory` for the container
- Add `scroll-behavior: smooth` and `-webkit-overflow-scrolling: touch` for mobile
- Lower IntersectionObserver threshold to 0.3 for better mobile detection

## Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | **Edit** — add MiniJourneyArc to heroBlock, between trust showcase and traction stats |
| `src/components/JourneyFullPageScroll.tsx` | **Edit** — redesign DotNav with labeled ring navigation + vertical line, show always, improve scroll smoothness |

