

## Plan: Minimise & Sharpen the Journey Complete CTA

### Problem
The current block is verbose — badge, headline, social proof, coin reward, benefit chips, and 3 CTAs all stacked vertically. Too much to scan, dilutes the motivation. On mobile (390px), it's especially long.

### Approach
Strip it down to a single-row benefit line, one punchy headline, one coin reward, and one primary CTA (with a secondary). Remove the badge pill, remove the social proof line, and inline benefits as a compact sentence instead of chips.

### Changes

**File: `src/components/JourneyCompleteCTA.tsx`** — Rewrite to a tighter layout:
- Remove the "Journey complete" badge pill
- Shorter headline: "Ready to invest smarter?" / highlighted "Claim your free 50 coins."
- Replace benefit chips with a single line: "Verified reviews · Trust reports · Deal alerts — all free."
- Single primary CTA: "Start free — earn 50 coins" (or "Go to Dashboard" if logged in)
- One subtle secondary link: "Compare developers →"
- Reduce padding from `p-6 md:p-10` to `p-5 md:p-8`
- Reduce gap from `gap-4` to `gap-3`

**File: `src/i18n/locales/en.json`** — Update `journeyComplete` keys:
- `headline1`: "Ready to invest smarter?"
- `headline2`: "Claim your free 50 coins."
- Remove `socialProof`, `badge` usage (keep keys for backwards compat)
- `benefitLine`: "Verified reviews · Trust reports · Deal alerts — all free."
- `ctaStart`: "Start free — earn 50 coins"
- Keep `ctaCompare`, `goToDashboard`
- Remove `ctaReview` button (reduce to 2 CTAs max)

**File: `src/i18n/locales/ar.json`** — Mirror Arabic translations for updated keys.

### Result
A compact, high-contrast block that delivers benefits in one glance and drives a single clear action. ~40% shorter vertically.

