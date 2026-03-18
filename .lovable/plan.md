

## Make Review Card More Compact & Shift Down to Reveal "TRUST SCORE"

### Problem
The review card overlaps too much of the gauge, hiding the "TRUST SCORE" label. The card also has too much internal spacing.

### Changes to `src/components/HeroTrustShowcase.tsx`

**1. Reduce card overlap** — change `-mt-6` to `-mt-2` so the card sits lower, revealing the "TRUST SCORE" text beneath the gauge.

**2. Compact card padding and spacing** — change `p-4 space-y-3` to `p-3 space-y-1.5` for tighter internal layout.

**3. Shrink reviewer avatar** — from `w-9 h-9` to `w-7 h-7` with smaller text.

**4. Reduce reviewer row gap** — from `gap-3` to `gap-2`.

**5. Compact dimension pills** — reduce `gap-1.5` to `gap-1`, pill padding from `px-2 py-1` to `px-1.5 py-0.5`.

**6. Reduce footer top padding** — from `pt-2` to `pt-1.5`.

All changes are within the review card section (lines ~326–441).

