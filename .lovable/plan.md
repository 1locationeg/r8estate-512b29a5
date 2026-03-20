

# Shorten Dimension Labels to Single Words

## Problem
The dimension pills ("Build quality", "Delivery", etc.) wrap to two lines because the labels are too long for the pill layout.

## Change
Shorten all `label` values in the `dimensions` arrays across all 4 scenarios in `src/components/HeroTrustShowcase.tsx`:

- `"Delivery"` → `"Delivery"` (already short, keep)
- `"Build quality"` → `"Quality"`
- `"Response"` → `"Response"` (already short, keep)

This affects lines 50, 66, 83-85, 100-102 — changing `"Build quality"` to `"Quality"` in all 4 scenarios.

Also update the `dimensionIcons` map (around line 126) if it uses `"Build quality"` as a key — change to `"Quality"`.

### File: `src/components/HeroTrustShowcase.tsx`
- Lines 50, 66, 84, 101: `"Build quality"` → `"Quality"`
- `dimensionIcons` map: update key from `"Build quality"` to `"Quality"`

