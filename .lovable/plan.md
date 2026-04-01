

## Interactive Station Sections: Compact Preview → Expanded Detail

### Concept

Each of the 4 snap-scroll station sections currently shows static marketing content (icon, bullets, CTA button). The user wants them to instead show a **compact interactive preview** of the actual station page, and when the user clicks/taps on it, the full detailed components expand inline.

```text
CURRENT STATE (each station section):
┌──────────────────────────────┐
│   Step Badge                 │
│   "Tagline quote"            │
│   [  Large Icon Ring  ]      │
│   Heading                    │
│   Description paragraph      │
│   • Bullet 1                 │
│   • Bullet 2                 │
│   • Bullet 3                 │
│   • Bullet 4                 │
│   [ CTA Button ]             │
└──────────────────────────────┘

NEW STATE (two modes per section):

COLLAPSED (default when scrolled to):
┌──────────────────────────────┐
│  Step Badge + Heading        │
│  [Icon]  [Interactive Hook]  │  ← e.g. Search bar for Research
│  "Tap to explore"            │
└──────────────────────────────┘

EXPANDED (after click/interaction):
┌──────────────────────────────┐
│  Step Badge + Heading        │
│  ┌────────────────────────┐  │
│  │ Full station component │  │
│  │ (BrowseCategoriesGrid, │  │
│  │  LaunchWatchWidget,    │  │
│  │  DealWatchWidget,      │  │
│  │  CommunityHighlights)  │  │
│  └────────────────────────┘  │
│  [ Close / Go to full page ] │
└──────────────────────────────┘
```

### Station-to-Component Mapping

| Station | Compact Hook | Expanded Component |
|---|---|---|
| **Research** | Search icon + mini search bar | `BrowseCategoriesGrid` + `HeroSearchBar` |
| **Choose** | Building icon + "Browse launches" | `LaunchWatchWidget` (top launches preview) |
| **Finance** | Wallet icon + "See deals" | `DealWatchWidget` (active deals preview) |
| **Protect** | Shield icon + "Join community" | `CommunityHighlights` + review teaser |

### Technical Changes

**File: `src/components/JourneyFullPageScroll.tsx`**

1. Add `expanded` state per section (`useState<number | null>(null)`)
2. Refactor `JourneyStepSection` to accept an `onExpand` callback and `isExpanded` boolean
3. In collapsed mode: show station icon, heading, and a clickable interactive element (search bar for Research, styled button for others)
4. In expanded mode: render the actual component inline, remove `snap-start` class (allow natural scroll height), add a collapse/close button and a "Go to full page" link
5. When expanded, the section grows beyond `min-h-[100dvh]` to fit content — disable snap behavior on that section
6. Pass `expanded` station index down; only one station can be expanded at a time

**File: `src/pages/Index.tsx`**
- No changes needed — components are already imported and available

### Interaction Flow

1. User scrolls to a station section → sees compact preview with the interactive hook
2. User clicks the search bar (Research) or the action button (other stations) → section expands with full component
3. User can click "Close" to collapse back, or "Go to [page]" to navigate to the full page
4. Expanding a section auto-collapses any previously expanded section
5. The snap-scroll container temporarily relaxes snapping when a section is expanded (via toggling `snap-start` class)

### Design Details

- Collapsed state keeps the station gradient background and icon ring but removes bullets and description
- The interactive hook element uses the station's accent color for borders/focus rings
- Expanded content fades in with a 300ms transition
- A subtle "pull up" indicator (chevron) hints at the expandable nature
- On mobile (390px viewport): expanded content scrolls within the section with `overflow-y-auto max-h-[70dvh]`

