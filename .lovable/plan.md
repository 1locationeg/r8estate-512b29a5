

## Plan: Mobile-First Dual Composition for Homepage

### The Problem
The current homepage uses one layout that shrinks on mobile — a "squished desktop." Mobile users see tiny text, multi-column grids crammed into 390px, and no touch-optimized patterns. The desktop layout itself is fine and stays mostly unchanged.

### Mental Model
Same React components, two different compositions. CSS media queries + conditional rendering control which components appear, in what order, and how they're styled per breakpoint.

### Changes

#### 1. `src/pages/Index.tsx` — Mobile-specific composition

Wrap the existing buyer-mode content in a `hidden md:block` desktop container, and add a parallel `md:hidden` mobile container that renders the **same components** in a mobile-optimized order and style:

**Mobile section order:**
1. Hero card (full-width, padded, same content but tighter spacing)
2. **Stats as horizontal scroll chips** — wrap `TractionStats` in a `md:hidden` override that renders 3 horizontal scrollable pill cards instead of the current 3-column grid
3. **Search bar as full-width hero element** — `HeroSearchBar` with `showQuickIcons={false}`, full width, 48px min-height input
4. **Journey steps as horizontal scroll pills** — new mobile-only rendering of `JourneyScrollSections` as swipeable colored pill cards (1-line per station)
5. **Widgets 2x2 grid** — same `DealWatchWidget`, `LaunchWatchWidget`, `ContractCheckCard`, `MarketPulseWidget` but in a `grid-cols-2` mobile grid
6. **Compare as swipeable card** — `CompareEngineShowcase` rendered as horizontally scrollable developer cards with dot indicators
7. **Review carousel 1 card + dots** — `ReviewsCarousel` showing single card with swipe dots

#### 2. `src/components/TractionStats.tsx` — Add horizontal scroll chip mode

Add a `useIsMobile()` check. On mobile, render stats as a horizontally scrollable row of pill-shaped cards (`flex overflow-x-auto gap-2`) with `min-h-[44px]` touch targets instead of the current centered 3-column grid.

#### 3. `src/components/JourneyScrollSections.tsx` — Mobile pill mode

On mobile (`md:hidden`), render the 4 journey stations as horizontal scroll pills:
- Each pill: colored left border matching station color, station number + bold name + 1-line subtitle
- Active station: filled background with station color
- 44px min-height, `overflow-x-auto` horizontal scroll
- Clicking a pill still navigates/scrolls to the zone

Desktop (`hidden md:block`) keeps the current expanded card layout unchanged.

#### 4. `src/components/CompareEngineShowcase.tsx` — Swipeable cards on mobile

On mobile, replace the side-by-side comparison bars with horizontally swipeable full-width developer cards:
- Each card: developer name, trust/delivery/value bars stacked vertically
- Dot indicators below (● ○) for swipe progress
- `overflow-x-auto snap-x snap-mandatory` with `scroll-snap-align: start` per card

#### 5. `src/components/ReviewsCarousel.tsx` — Single card + dots on mobile

On mobile, show only 1 review card at a time (full width) with dot indicators below for horizontal swipe. Desktop keeps the current multi-card horizontal scroll.

#### 6. `src/components/JourneyCorridor.tsx` — Mobile-compact corridor

Already compact, but ensure:
- Station dots are 18px on mobile (currently 20px — confirmed working)
- Labels use 7px Arabic text on mobile
- Touch targets are at least 44px per station button (add `min-w-[44px] min-h-[44px]` to the button wrapper)

#### 7. Touch target audit across all mobile-visible components

Add `min-h-[44px]` to all interactive elements rendered on mobile:
- Hero CTA buttons
- Search input
- Journey pills
- Widget cards
- Compare cards
- Review carousel navigation dots

### Files touched
1. **Edit** — `src/pages/Index.tsx` (dual composition: `md:hidden` mobile + `hidden md:block` desktop)
2. **Edit** — `src/components/TractionStats.tsx` (horizontal scroll chips on mobile)
3. **Edit** — `src/components/JourneyScrollSections.tsx` (horizontal pill mode on mobile)
4. **Edit** — `src/components/CompareEngineShowcase.tsx` (swipeable cards on mobile)
5. **Edit** — `src/components/ReviewsCarousel.tsx` (single card + dots on mobile)
6. **Edit** — `src/components/JourneyCorridor.tsx` (44px touch targets)

### What stays the same
- All desktop rendering (unchanged)
- All component logic, data fetching, state management
- Journey corridor engagement tracking
- i18n keys
- Navbar, Footer, BottomNav (already mobile-optimized)

