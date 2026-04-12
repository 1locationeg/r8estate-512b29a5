

## Plan: Fix Arabic RTL display across the entire app

### Problem
Many components, modals, cards, and pages display incorrectly in Arabic mode because they:
1. Don't set `dir="rtl"` on their root container
2. Use physical CSS properties (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`) instead of logical ones (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`)
3. Have hardcoded English-only labels that aren't translated
4. Don't use `useTranslation()` at all

### Scope of changes

**1. Global RTL wrapper** — Add a `dir` attribute to the app root in `App.tsx` or the main layout so all children inherit the correct direction without needing per-component `dir` attributes.

**2. Physical-to-logical CSS migration** across ~30 files:
- Replace `ml-` → `ms-`, `mr-` → `me-`, `pl-` → `ps-`, `pr-` → `pe-`
- Replace `text-left` → `text-start`, `text-right` → `text-end`
- Replace `left-` → `start-`, `right-` → `end-` (where applicable for positioning)
- Ensure `space-x-reverse` is used with `-space-x-` in RTL contexts

**3. Key components with hardcoded English text** — Add `useTranslation()` and use `t()` keys:
- `LaunchCard.tsx` — status labels, metric labels ("Launch Price", "Payment Plan", "Delivery", "Units", "Rate this launch", etc.)
- `DealCard.tsx` — deal type labels, action buttons
- `LaunchWatch.tsx` — page title, filter labels, status filters, stats labels
- `DealWatch.tsx` — same as above
- `LaunchRatingModal.tsx`, `DealRatingModal.tsx` — form labels
- `LaunchComparePanel.tsx`, `DealComparePanel.tsx` — comparison labels
- `CopilotBriefingDashboard.tsx` — multiple hardcoded English strings

**4. Modal/Dialog RTL** — Ensure `DialogContent` inherits `dir` from the document root (already using `left-[50%]` which is fine for centering, but internal content alignment needs fixing).

**5. Add missing Arabic translations** to `ar.json` for all newly translated keys (launchWatch, dealWatch sections).

### Files to modify

| File | Changes |
|------|---------|
| `src/App.tsx` or `src/main.tsx` | Add `dir` attribute to root element based on `i18n.language` |
| `src/components/LaunchCard.tsx` | Add i18n, replace hardcoded labels, fix physical margins |
| `src/pages/LaunchWatch.tsx` | Add i18n, translate filters/labels/stats |
| `src/components/DealCard.tsx` | Add i18n, translate labels |
| `src/pages/DealWatch.tsx` | Add i18n, translate filters/labels |
| `src/components/StepTimeline.tsx` | Replace `pl-`/`pr-`/`ml-`/`mr-` with logical equivalents |
| `src/components/HeroNextSteps.tsx` | Replace `mr-` with `me-` |
| `src/components/CompareEngineShowcase.tsx` | Replace `ml-` with `ms-` |
| `src/components/CopilotBriefingDashboard.tsx` | Replace `ml-`/`mr-`/`text-left` with logical equivalents, add i18n |
| `src/components/TrustRadarAlerts.tsx` | Replace `ml-auto` with `ms-auto` |
| `src/components/JourneyFullPageScroll.tsx` | Replace `mr-` with `me-` |
| `src/components/SideJourneyRail.tsx` | Already handles RTL — verify |
| `src/components/PageHeader.tsx` | Ensure RTL breadcrumb arrows |
| `src/i18n/locales/en.json` | Add keys for launch/deal cards |
| `src/i18n/locales/ar.json` | Add Arabic translations for new keys |

### Technical approach
- Set `dir={i18n.dir()}` on the root `<div>` in `App.tsx` so all children auto-inherit RTL
- Systematically replace physical margin/padding classes with Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`)
- Add `useTranslation()` to components that only have English text
- Add translation keys to both locale files
- This is a sweeping but straightforward find-and-replace + translation task

