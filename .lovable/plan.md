

## Plan: Compact Journey Corridor + Station Wayfinding on Click

### Problems
1. The corridor is too tall — 3 layers with header, global bar, and station row take ~70px on mobile
2. When clicking a station, user loses context — no indication of where they are, what's remaining, or how to continue
3. Background is dark/opaque, making it heavy — should use lighter tints that match each station's color consistently across the site

### Changes

#### 1. Compact the Corridor (`src/components/JourneyCorridor.tsx` — rewrite)

Merge all 3 layers into a **single compact row** (~36px tall on mobile):
- **Left**: tiny percentage circle (ring with number inside, 20px) — updates in real time
- **Center**: 4 station dots in a horizontal track, connected by a thin progress line
  - Each dot: 20px circle with station number or ✓, colored with its station accent
  - Active dot: slightly larger (24px) with glow ring
  - Below each dot: 1-word label (ابحث / اختر / مول / احم) in [9px] text
  - Completed dots: ✓ + filled accent color
  - Future dots: outlined/dim
- **Right**: nothing (keeps it minimal)
- **Background**: light frosted glass (`bg-background/90 backdrop-blur-md`) instead of dark colors. The connecting line between dots uses each station's accent color for completed segments, muted for future.
- The global progress bar and subtitle row are **removed** — progress is communicated through the connecting line fill and the percentage circle.

Height reduction: ~70px → ~36px (mobile), ~40px (desktop).

#### 2. Station Click → Scroll + Highlight Context (`src/components/JourneyCorridor.tsx`)

When a station is clicked:
- Smooth-scroll to that zone (existing behavior)
- **Temporarily expand** the corridor for 4 seconds to show a mini context strip below the compact row:
  - Shows: "Station 2 of 4 · اختر · 2 stations remaining"
  - A small "Next: مول →" link that scrolls to the next incomplete station
  - Auto-collapses after 4s or on scroll

This way the user always knows: where they are, what's left, and how to get to the next station.

#### 3. Lighter Background + Station Color Consistency

- Corridor background: `bg-background/95 backdrop-blur-sm border-b border-border/40` — light, not dark
- Each station dot uses the existing Tailwind journey token colors (`journey-research`, `journey-choose`, `journey-finance`, `journey-protect`) which are already defined in CSS variables and used across the site (StationPageWrapper, JourneyStripe, SideJourneyRail, BottomNav, PageHeader)
- The accent colors in the corridor will reference the same `hsl(var(--journey-*))` tokens, ensuring consistency with all other station-colored components site-wide
- Remove the HSL interpolation logic for background — it's no longer needed with a light glass background

#### 4. i18n Updates (`en.json` + `ar.json`)

Add:
- `corridor.stationOf`: "Station {{current}} of {{total}}"
- `corridor.remaining`: "{{count}} remaining"
- `corridor.next`: "Next: {{name}}"

### Files touched
1. **Rewrite** — `src/components/JourneyCorridor.tsx` (compact single-row + click context strip)
2. **Edit** — `src/i18n/locales/en.json` (add context strip keys)
3. **Edit** — `src/i18n/locales/ar.json` (add context strip keys)

