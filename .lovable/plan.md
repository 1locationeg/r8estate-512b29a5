
## Plan: Sticky Journey Corridor Bar on Homepage

### What
A sticky horizontal bar below the navbar on the homepage only. It shows 4 journey stations (ابحث / اختر / مول / احم) that activate as the user scrolls through tagged homepage sections. Each station lights up with its theme color, shows a progress bar, and completed stations get a ✓. Clicking a station scrolls to that zone.

### New Component: `src/components/JourneyCorridor.tsx`

A sticky bar (`sticky top-[56px] z-20`) rendered only on the homepage, containing:
- 4 station buttons in a horizontal row, each with: number badge (or ✓ if completed), Arabic/English label, and a thin progress bar underneath
- Uses `IntersectionObserver` on elements with `data-zone="1|2|3|4"` attributes to detect which zone is active
- Calculates scroll progress within active zone using scroll position relative to zone bounds
- Station colors: zone 1 = `journey-research` (navy), zone 2 = `journey-choose` (gold), zone 3 = `journey-finance` (teal), zone 4 = `journey-protect` (emerald)
- Active station: filled bg, white number, growing progress bar
- Past stations: filled bg with ✓ checkmark
- Future stations: dim/muted
- Click handler: `element.scrollIntoView({ behavior: 'smooth' })`
- Bilingual labels from i18n (`station.research`, etc. — already exist)

### Homepage Section Tagging: `src/pages/Index.tsx`

Add `data-zone` attributes to existing wrapper divs:
- **Zone 1 (Research)**: Hero block + JourneyScrollSections → `data-zone="1"`
- **Zone 2 (Choose)**: FeaturedIdentitySpotlight + CompareEngineShowcase + QuickActions → `data-zone="2"`
- **Zone 3 (Finance)**: HowWeWork + AudienceSegmentCards + CommunityHighlights + Trust Badges + ReviewsCarousel + PricingTeaser → `data-zone="3"`
- **Zone 4 (Protect)**: JourneyCompleteCTA + SiteExperienceFeedback + CategoryLinks → `data-zone="4"`

Insert `<JourneyCorridor />` right after the `<Navbar>` component.

### i18n
No new keys needed — reuses existing `station.research`, `station.choose`, `station.finance`, `station.protect` keys.

### Files touched
1. **New** — `src/components/JourneyCorridor.tsx`
2. **Edit** — `src/pages/Index.tsx` (import corridor, add `data-zone` attributes to section wrappers, render corridor after navbar)
