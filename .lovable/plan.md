

# Redesign MiniJourneyArc as the Hero Centerpiece

## What Changes

Transform the small 4-dot `MiniJourneyArc` into a prominent, full-width journey strip matching the reference image — large colored icon circles with numbered badges, labels, subtitles, chevron connectors, and a header row with "YOUR PATH TO A SAFE HOME" + "Start Journey →" CTA.

### 1. Redesign `MiniJourneyArc.tsx` — Full Journey Strip

Replace the tiny circles with a full-width horizontal strip:

- **Header row**: "YOUR PATH TO A SAFE HOME" on the left, "Start Journey →" link on the right (scrolls to first snap section)
- **4 large station circles** (~56px mobile, ~72px desktop) with:
  - Station-colored background tint ring + white inner circle + colored icon
  - Numbered badge (1-4) in station color, top-right corner
  - Station name label below (bold)
  - Subtitle below label (e.g., "Know who to trust", "Pick verified projects", "Fund safely", "Land secure")
- **Chevron connectors** (`>`) between stations in muted color
- **"Tap to explore →"** hint text at the far right on mobile
- Entire strip sits inside a subtle bordered container with rounded corners

### 2. Update `Index.tsx` — Positioning & Animation

- Keep the MiniJourneyArc between the trust showcase and traction stats
- Add a subtle entrance animation (fade-in-up with delay)
- Pass a callback prop so clicking "Start Journey →" scrolls to the first snap section

### 3. Add Translation Keys in `en.json`

Add subtitle keys for each station:
```
"journeyArc.title": "YOUR PATH TO A SAFE HOME"
"journeyArc.startJourney": "Start Journey →"  
"journeyArc.tapExplore": "Tap to explore →"
"journeyArc.research.subtitle": "Know who to trust"
"journeyArc.choose.subtitle": "Pick verified projects"
"journeyArc.finance.subtitle": "Fund safely"
"journeyArc.protect.subtitle": "Land secure"
```

Also add Arabic equivalents in `ar.json`.

## Files

| File | Action |
|------|--------|
| `src/components/MiniJourneyArc.tsx` | **Rewrite** — large icon circles, labels, subtitles, connectors, header row |
| `src/pages/Index.tsx` | **Edit** — adjust wrapper styling, pass scroll callback |
| `src/i18n/locales/en.json` | **Edit** — add journeyArc keys |
| `src/i18n/locales/ar.json` | **Edit** — add Arabic journeyArc keys |

