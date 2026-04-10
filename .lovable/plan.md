

## Plan: Add Two Power CTAs Below the Hero Headline

### Concept
Place two side-by-side CTA buttons directly after the "Reviews are the KEYS" shimmer headline — before the search bar. These act as the emotional gateway: one appeals to **curiosity/trust** ("See Real Owners"), the other to **fear/protection** ("Protect Your Money"). Both use micro-copy subtitles to tell a mini-story.

### Visual Design
```text
   Real Estate Has Secrets ;
   Reviews are the KEYS              ← shimmer hero

   [👥 See Real Owners]    [🛡 Protect Your Money]    ← NEW CTAs
        "Real stories from             "Don't pay millions
         real buyers"                   before you check"

   [Search bar...]
```

- **"See Real Owners"** → navigates to `/reviews` — uses `outline` variant with a subtle hover glow, Users icon
- **"Protect Your Money"** → navigates to `/reviews` with contract/protection intent — uses `glow` variant (primary filled + glow shadow), ShieldCheck icon
- Both buttons have a tiny subtitle line beneath for storytelling micro-copy
- Staggered fade-in animation (matching existing hero entrance pattern)
- Responsive: side-by-side on sm+, stacked on mobile

### Changes

#### 1. `src/i18n/locales/en.json` — Add 4 new keys under `hero`
- `hero.ctaSeeOwners`: "See Real Owners"
- `hero.ctaSeeOwnersSub`: "Real stories from real buyers"
- `hero.ctaProtectMoney`: "Protect Your Money"
- `hero.ctaProtectMoneySub`: "Don't pay millions before you check"

#### 2. `src/i18n/locales/ar.json` — Arabic equivalents
- `hero.ctaSeeOwners`: "شوف أصحاب تجارب حقيقية"
- `hero.ctaSeeOwnersSub`: "قصص حقيقية من مشترين حقيقيين"
- `hero.ctaProtectMoney`: "احمي فلوسك"
- `hero.ctaProtectMoneySub`: "ما تدفعش ملايين قبل ما تتأكد"

#### 3. `src/pages/Index.tsx` — Insert CTA row after line 245 (after tagline_line2)
- Add a `div` with two styled buttons inside the `userMode === "buyers"` block, between the tagline and the search bar
- Left button: outline style, Users icon, navigates to `/reviews`
- Right button: glow variant (primary + glow shadow), ShieldCheck icon, navigates to `/reviews`
- Each button includes a subtitle `<span>` for the storytelling micro-copy
- Add entrance animation using the existing `visible` pattern or a simple CSS animation delay

### Files Modified
- `src/i18n/locales/en.json`
- `src/i18n/locales/ar.json`
- `src/pages/Index.tsx`

