

# Station Identity System — Full Site-Wide Theming

## Concept

Extend the existing station config (`journeyStations.ts`) so that every page visually communicates which journey station it belongs to — not just through the top stripe and badge, but through **tinted backgrounds, accent-colored interactive elements, and themed cards**. Like airport terminals where the floor, signs, and walls all share one color.

## What Already Exists
- `JourneyStripe` — segmented progress bar at the top (done)
- `PageHeader` — station badge pill + `MiniJourneyArc` (done)
- `DashboardHeader` — station badge (done)
- CSS variables for `--journey-research`, `--journey-choose`, `--journey-finance`, `--journey-protect` (done)
- Tailwind `journey.research/choose/finance/protect` color tokens (done)

## What Gets Added — 3 Theming Layers

### Layer 1: Station-Tinted Page Wrapper
A new `<StationPageWrapper>` component that auto-detects the current station and applies:
- A **subtle tinted background gradient** at the top of the page (e.g., `bg-gradient-to-b from-journey-research/5 to-transparent h-40`)
- Sets CSS custom properties (`--station-accent`, `--station-accent-tint`) on the wrapper so child components can inherit the station color without knowing which station they're on

```text
Page structure:
┌─────────────────────────────────┐
│ JourneyStripe (progress bar)    │ ← already exists
├─────────────────────────────────┤
│ PageHeader + badge + arc        │ ← already exists
├─────────────────────────────────┤
│ ░░░ subtle station tint ░░░░░░ │ ← NEW gradient fade
│                                 │
│   Page content (cards, etc.)    │
│                                 │
└─────────────────────────────────┘
```

### Layer 2: Station-Aware Focus Ring & Active States
Update `src/index.css` with utility classes that read from the CSS variable set by the wrapper:
- `focus:ring-[hsl(var(--station-accent))]` on inputs/buttons within station pages
- Active tabs/pills use the station color instead of generic `primary`
- Search bar ring color matches the station

### Layer 3: Station Color on Key Interactive Elements Per Page
Update each major page to use station-colored accents on their primary interactive elements:

| Page | Station | What gets station-colored |
|------|---------|--------------------------|
| Categories | Research (Navy) | Search ring, category card hover borders |
| Directory | Research (Navy) | Filter pills active state, card borders |
| Leaderboard | Research (Navy) | Rank badge backgrounds, tab underline |
| Portfolio | Choose (Gold) | Tab active state, card accent borders |
| EntityPage | Choose (Gold) | CTA buttons tint, review section accent |
| LaunchWatch | Choose (Gold) | Launch card borders, status pills |
| DealWatch | Finance (Teal) | Deal card borders, compare button, filter pills |
| Insights | Finance (Teal) | Chart accents, KPI card borders |
| Community | Protect (Emerald) | Post card borders, category pills, new post button |
| Reviews | Protect (Emerald) | Review card accents, filter active state |
| Messages | Protect (Emerald) | Chat bubble accents |
| BuyerDashboard | Protect (Emerald) | Dashboard card borders, activity accents |

### Layer 4: Bottom Nav Station Awareness
Update `BottomNav` so the active icon uses the current station's color instead of always using `text-primary`.

## Technical Approach

### New: `StationPageWrapper` component
```tsx
// Reads station from route, sets CSS vars + gradient
const StationPageWrapper = ({ children }) => {
  const station = getStationForRoute(pathname);
  const style = station ? { '--station-accent': `var(--journey-${station.key})` } : {};
  return (
    <div style={style} className="relative">
      {station && <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[hsl(var(--station-accent)/0.06)] to-transparent pointer-events-none" />}
      {children}
    </div>
  );
};
```

### New CSS utilities in `index.css`
```css
/* Station-aware utilities */
.station-ring:focus { ring-color: hsl(var(--station-accent) / 0.3); }
.station-border { border-color: hsl(var(--station-accent) / 0.2); }
.station-text { color: hsl(var(--station-accent)); }
.station-bg-tint { background-color: hsl(var(--station-accent) / 0.08); }
.station-pill-active { background-color: hsl(var(--station-accent) / 0.12); color: hsl(var(--station-accent)); }
```

### Page updates (pattern — not per-page rewrites)
Each page wraps its root `<div>` content inside `<StationPageWrapper>`. Key interactive elements swap hardcoded `text-primary` / `ring-primary` for station-aware classes. This is a search-and-replace pattern, not a full rewrite.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/StationPageWrapper.tsx` | **Create** — gradient + CSS var setter |
| `src/index.css` | **Edit** — add station-aware utility classes |
| `src/components/BottomNav.tsx` | **Edit** — active icon uses station color |
| `src/pages/Categories.tsx` | **Edit** — wrap in StationPageWrapper, station-colored search ring |
| `src/pages/DealWatch.tsx` | **Edit** — wrap + station accents on filters |
| `src/pages/Community.tsx` | **Edit** — wrap + station accents on pills/CTA |
| `src/pages/Portfolio.tsx` | **Edit** — wrap + station tab colors |
| `src/pages/Reviews.tsx` | **Edit** — wrap + station accents |
| `src/pages/Leaderboard.tsx` | **Edit** — wrap + station accents |
| `src/pages/LaunchWatch.tsx` | **Edit** — wrap + station accents |
| `src/pages/InsightsPage.tsx` | **Edit** — wrap + station accents |
| `src/pages/Messages.tsx` | **Edit** — wrap + station accents |
| `src/pages/DeveloperDirectory.tsx` | **Edit** — wrap + station accents |
| `src/pages/EntityPage.tsx` | **Edit** — wrap + station accents |

## Implementation Priority
1. `StationPageWrapper` + CSS utilities (foundation)
2. `BottomNav` station awareness (high visibility)
3. Wrap all pages (systematic pass)
4. Swap key interactive element colors per page (targeted refinement)

