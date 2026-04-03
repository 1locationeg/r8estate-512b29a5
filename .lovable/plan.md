

# Fix Scroll Trap After Station 4 + Mobile PWA Polish

## Problem

The `JourneyFullPageScroll` component uses `h-[100dvh] overflow-y-auto` — creating a **self-contained scroll container** that traps the user. After scrolling through the 4 stations, the user cannot continue to the rest of the page (HowWeWork, Footer, etc.) because the snap container captures all scroll events.

Additionally, the current layout has horizontal padding on mobile that wastes screen space.

## Solution

Remove the fixed-height inner scroll container. Instead, let the journey sections flow naturally within the page layout and apply `snap-y snap-mandatory` to the **outer page wrapper** in `Index.tsx`. This way:
- Each station is still a full-screen snap section
- After station 4, the user naturally scrolls into the remaining content (no trap)
- The snap behavior stops after the journey sections (remaining content scrolls normally)

## File Changes

| Action | File | Details |
|---|---|---|
| Edit | `src/components/JourneyFullPageScroll.tsx` | Remove `h-[100dvh] overflow-y-auto` wrapper; export sections as a flat fragment; remove IntersectionObserver root (use viewport instead) |
| Edit | `src/pages/Index.tsx` | Wrap the hero + journey + below-fold content in a single scroll container with conditional snap; remove horizontal padding on mobile for full-bleed; ensure `overflow-x-hidden` and `w-full` |

## Key Changes in JourneyFullPageScroll

1. Replace the `div` with `h-[100dvh] overflow-y-auto` → use a simple wrapper `div` with no fixed height
2. IntersectionObserver: change `root: container` → `root: null` (viewport)
3. Each section keeps `min-h-[100dvh] snap-start` for screen-by-screen snapping
4. Add a "sentinel" empty section at the end that does NOT snap, allowing scroll to continue past

## Mobile PWA Responsiveness

- Remove `px-4` padding on mobile for journey sections → full-bleed edge-to-edge
- Ensure `max-w-full w-full overflow-x-hidden` on the outer container
- StationRingNav: hide on very small screens or reduce size
- Below-fold content keeps its existing padding for readability

## What This Fixes

1. **Scroll trap** — user can now scroll past station 4 to see Footer, HowWeWork, etc.
2. **Screen-by-screen mobile feel** — snap-start on each station maintains the PWA app-like scroll
3. **Edge-to-edge mobile** — no wasted space on left/right on smart devices

