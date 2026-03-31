

# Station Identity System — Site-Wide Journey Color Mapping

## Concept
Every page belongs to one of 4 journey stations. The station is communicated visually through a colored top stripe, a badge in the header, and a mini journey arc — creating an airport-terminal wayfinding system across the entire site.

## Station → Route Mapping

```text
Station        Color Token              Routes
─────────────────────────────────────────────────────────
🔍 Research    journey-research (Navy)   /, /categories, /directory, /leaderboard
🏗️ Choose      journey-choose (Gold)     /entity/*, /portfolio, /launch-watch
💳 Finance     journey-finance (Teal)    /deal-watch, /insights
🛡️ Protect     journey-protect (Emerald) /buyer/*, /community, /reviews, /messages
```

## What Gets Built (3 layers + config)

### Layer 0 — Station Config (single source of truth)
New file: `src/lib/journeyStations.ts`
- Exports `JOURNEY_STATIONS` array with: key, emoji, label i18n key, color token name, icon (Lucide), and `routePatterns` (string array for matching)
- Exports `getStationForRoute(pathname: string): Station | null` helper that matches current route to a station
- All other layers import from this one file

### Layer 1 — The 4px Floor Stripe
New component: `src/components/JourneyStripe.tsx`
- A `4px` tall `div` with `bg-journey-{station}` color, rendered at the very top of every non-homepage inner page
- Uses `useLocation()` + `getStationForRoute()` to pick the color
- Added once in `AppContent` (in `App.tsx`), right after `<ScrollToTop />`
- Hidden on `/` (homepage already has the journey strip) and embed/auth routes

### Layer 2 — Station Badge in PageHeader
Modify `src/components/PageHeader.tsx`:
- Import `getStationForRoute` and render a small pill badge next to the title: `"🔍 Research"` in the station's color
- Uses `useLocation()` to auto-detect — no prop changes needed for existing callers
- Badge: `text-[10px] font-bold px-2 py-0.5 rounded-full bg-journey-{station}/10 text-journey-{station}`

Also modify `src/components/DashboardHeader.tsx` with the same badge logic for dashboard pages.

### Layer 3 — Mini Journey Arc
New component: `src/components/MiniJourneyArc.tsx`
- A compact horizontal row of 4 small circles (16px) with station colors, connected by thin lines
- Current station is filled + has a subtle glow ring; others are outlined/dimmed
- Tapping a station navigates to its "home" route (e.g., Research → `/categories`, Choose → `/portfolio`)
- Rendered inside `PageHeader` below the breadcrumbs, or as an optional slot

### i18n Updates
Add station label keys to `en.json` / `ar.json`:
- `"station.research"`, `"station.choose"`, `"station.finance"`, `"station.protect"`

## Files Summary

| File | Action |
|------|--------|
| `src/lib/journeyStations.ts` | Create — station config + route matcher |
| `src/components/JourneyStripe.tsx` | Create — 4px colored top bar |
| `src/components/MiniJourneyArc.tsx` | Create — compact 4-circle progress indicator |
| `src/components/PageHeader.tsx` | Edit — add station badge + mini arc |
| `src/components/DashboardHeader.tsx` | Edit — add station badge |
| `src/App.tsx` | Edit — add `<JourneyStripe />` in AppContent |
| `src/i18n/locales/en.json` | Edit — add station label keys |
| `src/i18n/locales/ar.json` | Edit — add station label keys |

