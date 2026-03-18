

## Option B: Trust Badge Row — Implementation Plan

Replace the current plain text `taglineHighlight` line with two compact inline trust-seal pill badges, each with a colored left border, icon, and label.

### Visual Result
```text
Buy your Off-Plan home with

  [🛡️ Zero Risk]   [✅ 100% Confident Decision]
   green border       gold border
```

### Changes

**1. `src/pages/Index.tsx` (lines 302-304)**
Replace the `<p>` that renders `hero.taglineHighlight` with two inline pill badges:
- Each pill: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold`
- **Zero Risk pill**: green left border (`border-l-2 border-l-verified`), `Shield` icon (verified color), text from `hero.benefit_zero_risk`
- **100% Confident pill**: gold/accent left border (`border-l-2 border-l-accent`), `CheckCircle` icon (accent color), text from `hero.benefit_confident`
- Container: `flex items-center justify-center gap-3 mt-1`
- RTL support: use `border-s-2` (logical property) instead of `border-l-2` so it auto-flips

**2. `src/i18n/locales/en.json`**
- Remove `taglineHighlight` key
- Add: `"benefit_zero_risk": "Zero Risk"` and `"benefit_confident": "100% Confident Decision"`

**3. `src/i18n/locales/ar.json`**
- Remove `taglineHighlight` key
- Add: `"benefit_zero_risk": "صفر مخاطر"` and `"benefit_confident": "قرار واثق ١٠٠٪"`

No new components or dependencies needed — just Lucide icons (`Shield`, `CheckCircle`) already available in the project.

