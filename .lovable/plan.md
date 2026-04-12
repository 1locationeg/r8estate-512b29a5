

## Plan: Add "Rate Your Experience" Feedback Section After Journey Complete

### What
A meta-feedback section that embodies the platform's core "reviewing" philosophy — asking users to rate their browsing experience on the site itself. Placed after the Journey Complete CTA block. Inspired by the uploaded reference images.

### New Component: `src/components/SiteExperienceFeedback.tsx`

A compact, centered card with:
- Italic headline: "Did you find what you were looking for?"
- Subtitle: "Tell us what's missing — your feedback shapes the platform."
- 5-star interactive rating (gold stars, matching brand style)
- Three action buttons: "Yes, found it" (filled primary), "Suggest something →" (outline), "Report an issue" (outline)
- A small footnote: "NEW — as requested. Turns dead exits into product insights."
- Fully bilingual via i18n keys under `"siteFeedback"` namespace
- Stars submit silently (toast confirmation), buttons navigate to contact/feedback routes

### i18n Keys (2 edits)
Add `"siteFeedback"` namespace to `en.json` and `ar.json`:
- `headline`, `subtitle`, `foundIt`, `suggest`, `reportIssue`, `footnote`, `thankYou`

### Integration in `src/pages/Index.tsx` (1 edit)
Insert after line 518 (the divider after JourneyCompleteCTA):
```
<div className="w-full max-w-[1100px] py-4 md:py-6"><SiteExperienceFeedback /></div>
<div className="w-16 h-px bg-border mx-auto" />
```

### Files touched
1. **New** — `src/components/SiteExperienceFeedback.tsx`
2. **Edit** — `src/i18n/locales/en.json` (add `siteFeedback` keys)
3. **Edit** — `src/i18n/locales/ar.json` (add `siteFeedback` keys)
4. **Edit** — `src/pages/Index.tsx` (import + insert after JourneyCompleteCTA)

