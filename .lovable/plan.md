

## Plan: Add "Journey Complete" CTA Section After Pricing Teaser

### What
A dark-themed, conversion-focused closing section placed immediately after the Pricing Teaser block. Inspired by the uploaded reference images — a navy-to-emerald gradient card congratulating the user for reaching the end of the homepage journey, offering point rewards for registration, and presenting clear action CTAs.

### New Component: `src/components/JourneyCompleteCTA.tsx`

A self-contained component with:
- Dark gradient background (navy → emerald, matching reference images)
- A "Journey complete" pill badge at the top
- Bold headline: "You've done the research. Now make your move." (en) / Arabic equivalent (ar)
- Social proof line: "Join 39,000+ users making safer real estate decisions"
- Coin reward callout: "+50 coins when you sign up today" with a gold coin icon
- Three benefit chips: "Verified Reviews", "Trust Reports", "Deal Alerts"
- Three CTA buttons: "Start for free" (primary/green), "Compare developers" (outline), "Write a review" (outline)
- Auth-aware: if user is logged in, show different messaging ("Welcome back") and route to dashboard instead of /auth
- Fully bilingual via i18n keys

### i18n Keys (2 edits)

Add `"journeyComplete"` namespace to `en.json` and `ar.json`:
- `badge`, `headline1`, `headline2`, `socialProof`, `rewardText`, `benefit1`, `benefit2`, `benefit3`, `ctaStart`, `ctaCompare`, `ctaReview`, `welcomeBack`, `goToDashboard`

### Integration in `src/pages/Index.tsx` (1 edit)

Insert after the Pricing Teaser block (line 512), before the existing divider:
```
<div className="w-full max-w-[1100px] py-4 md:py-6"><JourneyCompleteCTA /></div>
<div className="w-16 h-px bg-border mx-auto" />
```

### Files touched
1. **New** — `src/components/JourneyCompleteCTA.tsx`
2. **Edit** — `src/i18n/locales/en.json` (add `journeyComplete` keys)
3. **Edit** — `src/i18n/locales/ar.json` (add `journeyComplete` keys)
4. **Edit** — `src/pages/Index.tsx` (import + insert after PricingTeaser)

