

## Research Hub — Search-Triggered Full Experience

### Concept
When the user clicks/focuses the search bar in the Research station scroll section, instead of just the standard search suggestions dropdown, the mobile overlay (and desktop expanded view) will include a **Research Hub toolkit** below the search results. This gives the first-time buyer a complete index of every research tool available on the platform — all triggered from the familiar search interaction.

### How It Works

The `HeroSearchBar` already has two modes:
1. **Desktop**: Search input with `SearchSuggestions` dropdown below
2. **Mobile**: Full-screen overlay with search + suggestions

The plan: Add a new prop `showResearchHub?: boolean` to `HeroSearchBar`. When true AND the search bar is focused (with no query or few results), render a **ResearchToolkitPanel** below the suggestions. The Research station in `JourneyScrollSections` will pass `showResearchHub={true}`.

### ResearchToolkitPanel Layout

```text
┌─────────────────────────────────────┐
│  [Search Input] ← user typed here  │
│  [SearchSuggestions - if query]     │
│                                     │
│  ── DISCOVER ─────────────────────  │
│  🏢 Browse Categories    → /categories
│  🏗️ Developer Directory  → /directory
│  🏆 Leaderboard          → /leaderboard
│  📦 Products             → /products
│                                     │
│  ── EVALUATE ─────────────────────  │
│  ⚖️ Compare Developers   → modal
│  ⭐ Read Reviews         → /reviews
│  🤖 AI Trust Agent       → modal
│  📊 Market Insights      → /insights
│                                     │
│  ── TRACK ────────────────────────  │
│  🔔 Saved Searches       → /auth
│  💡 Smart Recs           → AI
│                                     │
│  ── Quick Stats ──────────────────  │
│  18 Categories · 70+ Businesses     │
│                                     │
│  [Ready to choose? → Station 2]    │
└─────────────────────────────────────┘
```

### Implementation Steps

**1. Create `src/components/ResearchToolkitPanel.tsx`**
- A new component with grouped tool cards (Discover, Evaluate, Track)
- Each card: icon + title + subtitle + arrow → navigates to route or opens modal
- Accepts `onClose` callback to dismiss the search overlay
- Accepts `onOpenCompare` and `onOpenAIAgent` for modal triggers
- Uses journey-research color theming
- Full RTL support
- "Ready to choose?" CTA at bottom scrolls to `#journey-section-1`

**2. Update `src/components/HeroSearchBar.tsx`**
- Add `showResearchHub?: boolean` prop (default false)
- In the mobile full-screen overlay: render `ResearchToolkitPanel` below `SearchSuggestions` when `showResearchHub` is true and query is empty
- In the desktop view: render `ResearchToolkitPanel` as part of the dropdown area when focused, query is empty, and `showResearchHub` is true

**3. Update `src/components/JourneyScrollSections.tsx`**
- Pass `showResearchHub={true}` to the `HeroSearchBar` inside `ResearchStorySection`

**4. Add translations** (`en.json`, `ar.json`)
- Keys under `researchHub.*` for section headers (Discover, Evaluate, Track) and tool card labels/subtitles

### Files to create/modify
1. **New**: `src/components/ResearchToolkitPanel.tsx`
2. **Edit**: `src/components/HeroSearchBar.tsx` — add prop, render panel
3. **Edit**: `src/components/JourneyScrollSections.tsx` — pass prop
4. **Edit**: `src/i18n/locales/en.json` — add translation keys
5. **Edit**: `src/i18n/locales/ar.json` — add Arabic translations

### No database or backend changes needed.

