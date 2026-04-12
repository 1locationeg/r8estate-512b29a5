

## Plan: Add Pricing Teaser Section After ReviewsCarousel

### What
A compact, conversion-focused pricing teaser block placed immediately after the ReviewsCarousel. Inspired by the uploaded reference image — shows three plan tiers (Free, Pro, Business) with a "Start free. Upgrade when ready." headline and a "TRANSPARENT PRICING" label with a "NEW" badge.

### New Component: `src/components/PricingTeaser.tsx`

A self-contained component with:
- "TRANSPARENT PRICING" uppercase label with a green "NEW" badge
- Headline: "Start free. Upgrade when ready." (en) / Arabic equivalent (ar)
- Three clickable plan cards in a row:
  - **Free** — "Basic access" — default outline style
  - **Pro** — "Full reports" — highlighted with teal/primary border + badge
  - **Business** — "For companies" — default outline style
- Clicking any card navigates to `/auth` (signup gate)
- Fully bilingual via i18n keys
- Matches existing design system (Tailwind, shadcn Card/Badge)

### i18n Keys (2 edits)

Add to `en.json` and `ar.json` under a new `"pricingTeaser"` namespace:
- `label`, `new`, `headline`, `free.title`, `free.desc`, `pro.title`, `pro.desc`, `business.title`, `business.desc`

### Integration in `src/pages/Index.tsx` (1 edit)

Insert after the ReviewsCarousel block (line 504), before the divider on line 506:

```
<div className="w-16 h-px bg-border mx-auto" />
<div className="w-full max-w-[1100px] py-4 md:py-6"><PricingTeaser /></div>
```

### Files touched
1. **New** — `src/components/PricingTeaser.tsx`
2. **Edit** — `src/i18n/locales/en.json` (add `pricingTeaser` keys)
3. **Edit** — `src/i18n/locales/ar.json` (add `pricingTeaser` keys)
4. **Edit** — `src/pages/Index.tsx` (import + insert after ReviewsCarousel)

