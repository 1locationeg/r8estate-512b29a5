

# Fix SideJourneyRail: Swap Sides + Safe Area

## Problem
1. Rail is on the **left** for English — user wants it on the **right** for LTR and left for RTL (opposite of current).
2. Rail ignores PWA safe area insets, so it can be clipped on notched devices.

## Changes

| File | Change |
|---|---|
| `src/components/SideJourneyRail.tsx` | Swap positioning: `right-1` for LTR, `left-1` for RTL. Add safe-area-aware spacing using `env(safe-area-inset-right)` / `env(safe-area-inset-left)` via inline style. Also add `env(safe-area-inset-top)` offset to the vertical centering to keep it within the visible area. |

Single file, two-line change — swap the RTL ternary and add safe area padding via inline `style`.

