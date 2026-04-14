

## Plan: Use Journey-Protect Green for the "WITH R8ESTATE" Section

### Recommendation

The component currently uses `text-primary` (navy) for the "WITH R8ESTATE" row. Since this section represents the **Protect** stage of the user journey, it should use the **journey-protect** color (emerald green) — the same green used throughout the platform for the 4/4 Protect station. This creates a strong visual contrast: **red = danger (without)** vs **green = safety (with)**.

### Approach — Green accent on the bottom half only

Rather than converting the entire card background to green (which would lose the red urgency of the top half), apply green only to the "WITH R8ESTATE" row and CTA area. This creates a clear **red-to-green split** narrative.

### Changes — `src/components/CollectiveBuyerProtection.tsx`

1. **CheckCircle icon** (line 106): Change `text-primary` → `text-journey-protect`
2. **"WITH R8ESTATE" label** (line 107): Change `text-primary` → `text-journey-protect`
3. **Avatar borders** (line 119): Change `border-border` → `border-journey-protect/30` for a subtle green tint
4. **"323+ Protected" text** (line 123): Change `text-foreground` → `text-journey-protect`
5. **CTA button** (line 129-134): Add green styling — override with `bg-journey-protect hover:bg-journey-protect/90 text-white` classes instead of the `glow` variant
6. **Add a subtle green tinted background** behind the bottom rows: wrap rows 3-4 in a `bg-journey-protect/[0.04] rounded-lg p-2` container to visually separate the "safe zone"

This mirrors the existing journey color system used across all station-aware components.

