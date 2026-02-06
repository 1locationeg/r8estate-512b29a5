

# Intelligent Search Suggestions with Spell Correction

## Overview
Implement an intelligent, auto-complete search system for the HeroSearchBar that shows categorized suggestions when users focus on or type in the search bar. The system will include fuzzy matching for handling misspellings and show results from all website content.

## Current State
- `HeroSearchBar.tsx` only searches developers by exact name match
- Mock data includes: developers (7), reviews (15), categories (7)
- No fuzzy search/spell correction capability exists
- Command component (`cmdk`) is already installed for autocomplete UI patterns

## Implementation Plan

### 1. Create Fuzzy Search Utility
**New file: `src/lib/fuzzySearch.ts`**

Implement a lightweight fuzzy search algorithm that:
- Calculates string similarity using Levenshtein distance
- Returns match score and potential corrections
- Handles common misspellings (e.g., "Emar" → "Emaar", "Damak" → "Damac")
- Supports partial word matching

### 2. Create Unified Search Data Index
**New file: `src/data/searchIndex.ts`**

Create a searchable index combining all content types:

```text
┌─────────────────────────────────────────────────────────────┐
│                     Search Categories                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Developers  │   Projects   │   Brokers    │   Categories   │
├──────────────┼──────────────┼──────────────┼────────────────┤
│  Emaar       │  Dubai Creek │  Coming Soon │  UNITS         │
│  Damac       │  Palm Tower  │              │  Apps          │
│  Meraas      │  Marina Bay  │              │  Brokers       │
│  Nakheel     │              │              │  Platforms     │
│  Sobha       │              │              │  Exhibitions   │
│  Aldar       │              │              │  Channels      │
└──────────────┴──────────────┴──────────────┴────────────────┘

Additional Types:
- Reviews (searchable by project name, author)
- Locations (Dubai Downtown, Marina, Abu Dhabi)
- Unit Types (Studio, 1BR, 2BR, 3BR+)
```

### 3. Create Search Suggestions Component
**New file: `src/components/SearchSuggestions.tsx`**

Features:
- Shows on input focus (even with empty query)
- Groups results by category with icons
- Displays "Popular" or "Recent" when no query
- Shows spell correction suggestion banner
- Keyboard navigation support
- Mobile-responsive design

UI Structure:
```text
┌──────────────────────────────────────────────────────┐
│ Did you mean: "Emaar Properties"?     [Use this ↗]  │  ← Spell correction
├──────────────────────────────────────────────────────┤
│ 🏢 DEVELOPERS                                        │
│    ├─ Emaar Properties          ⭐ 4.8  (1247 reviews)│
│    └─ Damac Properties          ⭐ 4.6  (892 reviews) │
├──────────────────────────────────────────────────────┤
│ 📍 LOCATIONS                                         │
│    ├─ Dubai Marina                                   │
│    └─ Downtown Dubai                                 │
├──────────────────────────────────────────────────────┤
│ 🏠 PROJECTS                                          │
│    ├─ Dubai Creek Harbour       by Emaar             │
│    └─ Palm Jumeirah             by Nakheel           │
├──────────────────────────────────────────────────────┤
│ 📂 CATEGORIES                                        │
│    ├─ UNITS                                          │
│    └─ Brokers                                        │
└──────────────────────────────────────────────────────┘
```

### 4. Update HeroSearchBar Component
**Modify: `src/components/HeroSearchBar.tsx`**

Changes:
- Import and use the new SearchSuggestions component
- Show suggestions on focus (not just when typing)
- Integrate fuzzy search with spell correction
- Handle category-based result selection
- Add keyboard navigation (up/down arrows, enter)
- Close dropdown on blur with proper delay

### 5. Expand Mock Data for Search
**Modify: `src/data/mockData.ts`**

Add new data structures:
- Projects array (linked to developers, with location)
- Locations array (UAE areas)
- Unit types array
- Brokerages array (placeholder data)
- Apps/Platforms array (placeholder data)

### 6. Add Translations
**Modify: `src/i18n/locales/en.json` and `ar.json`**

New keys:
```json
{
  "search": {
    "didYouMean": "Did you mean",
    "noResults": "No results found",
    "popular": "Popular Searches",
    "recent": "Recent Searches",
    "developers": "Developers",
    "projects": "Projects",
    "locations": "Locations",
    "categories": "Categories",
    "units": "Unit Types",
    "brokers": "Brokers",
    "apps": "Apps & Platforms"
  }
}
```

---

## Technical Details

### Fuzzy Search Algorithm
The implementation will use a modified Levenshtein distance algorithm:
- Threshold: suggestions shown when similarity > 60%
- Spell correction triggered when similarity between 70-95%
- Exact matches prioritized, then partial matches, then fuzzy matches

### Search Result Scoring
Results will be scored and sorted by:
1. Exact match (highest priority)
2. Starts with query
3. Contains query
4. Fuzzy match score
5. Popularity/rating (secondary sort)

### Performance Considerations
- Search is performed client-side on mock data
- Debounce input (150ms) to prevent excessive re-renders
- Limit results per category (3-5 items each)
- Total dropdown height capped for usability

---

## Files to Create
1. `src/lib/fuzzySearch.ts` - Fuzzy search utility functions
2. `src/data/searchIndex.ts` - Unified search data index
3. `src/components/SearchSuggestions.tsx` - Suggestion dropdown component

## Files to Modify
1. `src/components/HeroSearchBar.tsx` - Integrate new search system
2. `src/data/mockData.ts` - Add projects, locations, and placeholder data
3. `src/i18n/locales/en.json` - Add search translations
4. `src/i18n/locales/ar.json` - Add Arabic search translations

