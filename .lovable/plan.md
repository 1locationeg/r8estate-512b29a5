

# Fix: Search Suggestions Overlapping Hero Category Cards

## Problem
The `SearchSuggestions` dropdown in `HeroSearchBar` uses `absolute top-full` positioning, but it's placed **after** the `TractionStats` component in the DOM. This means:
1. The dropdown appears below the traction stats rather than directly below the search input
2. It overlaps with the Hero Category Cards beneath it

## Solution

**File: `src/components/HeroSearchBar.tsx`**

Restructure the desktop layout so the search input wrapper is the `relative` positioned anchor, and `SearchSuggestions` is placed directly after the search input container (not after `TractionStats`).

Specifically:
1. Wrap the search input container (the `div` with the border/rounded styling) and the `SearchSuggestions` dropdown together inside a `relative` wrapper
2. Move `TractionStats` **outside** this relative wrapper so it doesn't interfere with dropdown positioning
3. Hide `TractionStats` when search is focused to avoid visual clutter behind the dropdown

This keeps the dropdown anchored directly below the search bar input, floating above everything else via `z-50`, without overlapping the category cards.

## Technical Detail

```
Current DOM order (inside max-w-3xl relative):
  ├── Search Input Container
  ├── TractionStats          ← pushes dropdown down
  ├── SearchSuggestions      ← absolute, overlaps categories

Fixed DOM order:
  ├── div.relative           ← new anchor
  │   ├── Search Input Container
  │   └── SearchSuggestions  ← absolute, directly under input
  ├── TractionStats          ← outside, hidden when focused
```

