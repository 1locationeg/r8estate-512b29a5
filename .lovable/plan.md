

# Side Vertical Journey Arc for Inner Pages

## Concept

Replace the full horizontal `MiniJourneyArc` in `PageHeader` with a **fixed vertical side rail** — a slim column of 4 station dots connected by a vertical line, pinned to the left edge (or right in RTL). The current station glows and pulses; past stations are filled; future ones are dimmed. Clicking a dot navigates to that station's home route.

```text
  ┌─────────────────────────────────┐
  │ ●  [Home] ← Reviews    [+]     │  ← PageHeader (no arc)
  │ │  ─────────────────────────    │
  │ ●                               │
  │ │   Stats · Filters · Cards     │  ← Page content
  │ ●                               │
  │ │                               │
  │ ●► ← active (Protect, glowing) │
  └─────────────────────────────────┘
```

## Design Details

- **Position**: `fixed left-2 top-1/2 -translate-y-1/2` (RTL: `right-2`)
- **Width**: ~32px — dots are 10px, active dot 14px with ring
- **Vertical line**: 2px connecting dots, filled up to current station, dimmed after
- **Active dot**: station color + pulse animation + tiny label tooltip on hover
- **Mobile**: Show on screens ≥ 360px wide (hidden on very tiny screens)
- **Z-index**: Below modals/sheets (`z-30`)
- **Hidden on**: homepage, auth, embed routes (same logic as `JourneyStripe`)

## File Changes

| File | Change |
|---|---|
| `src/components/SideJourneyRail.tsx` | **New** — Fixed vertical rail with 4 station dots, connecting line, active highlight, click-to-navigate, RTL support |
| `src/components/PageHeader.tsx` | Remove `<MiniJourneyArc />` import and usage from the breadcrumb row |
| `src/App.tsx` | Add `<SideJourneyRail />` alongside `<JourneyStripe />` in `AppContent` so it appears on all inner pages automatically |

The full `MiniJourneyArc` component remains untouched for homepage use. The `JourneyStripe` (top color bar) also stays — the side rail complements it as a clickable navigator.

