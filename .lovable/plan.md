

## Plan: 3-Layer Journey Corridor with Engagement-Boosted Progress

### What
Replace the current simple corridor with a rich 3-layer sticky bar. The completion percentage is a **blend of scroll position (50%) + user engagement actions (50%)**, so actively using features (searching, comparing, clicking entities) accelerates progress beyond just scrolling.

### Engagement Tracking

**New hook: `src/hooks/useCorridorEngagement.ts`**
- Stores per-zone engagement scores in React state (sessionStorage-backed so it persists on refresh)
- Zone 1 (Research): +points for using search, clicking search suggestions
- Zone 2 (Choose): +points for viewing entity details, opening compare modal
- Zone 3 (Finance): +points for interacting with deal/launch cards, pricing section
- Zone 4 (Protect): +points for clicking community, feedback, or CTA buttons
- Exposes: `zoneEngagement: [0-1, 0-1, 0-1, 0-1]` (normalized per zone) and a `trackEngagement(zone, action)` function
- Listens for custom DOM events (`corridor:engage`) so any component can fire engagement without importing the hook
- Max per zone = 1.0 (capped), each action adds ~0.15-0.25

### Component Rewrite: `src/components/JourneyCorridor.tsx`

**Layer 1 — Header row**:
- Left: "رحلتك نحو بيت آمن" / "Your path to a safe home"
- Right: live `XX% مكتمل` / `XX% complete`
- Percentage = `((scrollProgress + engagementProgress) / 2) * 100` across all 4 zones

**Layer 2 — Global progress bar**:
- Full-width thin gradient bar (h-[3px]) filling 0→100%
- Gradient: navy → teal → amber → emerald

**Layer 3 — Stations row** (5 items, always visible):
- Entry state "البداية" with home icon (always dim after zone 1 activates)
- 4 stations: numbered circle (or ✓), bold name, subtitle, per-station progress bar
- Per-station progress = `(scrollProgress * 0.5 + engagementProgress * 0.5)` for that zone
- Subtitles: "عن المطورين" / "المشروع الأفضل" / "بأمان مالي" / "حقوقك وفلوسك"

**Background color transition**: Smooth HSL interpolation based on active zone:
- Entry: `hsl(203,81%,12%)` navy
- Zone 1→2→3→4: teal → amber → blue → green

**Engagement dispatch from existing components**:
- Add `dispatchEvent(new CustomEvent('corridor:engage', { detail: { zone, action } }))` to:
  - `HeroSearchBar` (zone 1, on search submit)
  - `CompareModal` (zone 2, on compare open)
  - `SearchSuggestions` (zone 1, on suggestion click)
  - `DealCard` / `LaunchCard` (zone 3, on interaction)
  - `JourneyCompleteCTA` (zone 4, on CTA click)
  - `SiteExperienceFeedback` (zone 4, on feedback)

### i18n Keys

Add `"corridor"` namespace to both locale files:
- `title`, `complete`, `entry`, `sub.research`, `sub.choose`, `sub.finance`, `sub.protect`

### Files touched
1. **New** — `src/hooks/useCorridorEngagement.ts`
2. **Rewrite** — `src/components/JourneyCorridor.tsx`
3. **Edit** — `src/i18n/locales/en.json` (add `corridor` keys)
4. **Edit** — `src/i18n/locales/ar.json` (add `corridor` keys)
5. **Edit** — `src/components/HeroSearchBar.tsx` (dispatch engage event on search)
6. **Edit** — `src/components/CompareModal.tsx` (dispatch engage event on compare)
7. **Edit** — `src/components/SiteExperienceFeedback.tsx` (dispatch engage event)
8. **Edit** — `src/components/JourneyCompleteCTA.tsx` (dispatch engage event)

