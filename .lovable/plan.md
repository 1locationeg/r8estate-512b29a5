

## Make Research Search Button Open Inline Focus (Like Hero)

### Problem
Currently, clicking the search button in the collapsed Research station calls `onExpand`, which opens the full station expanded content. The user wants it to behave like the hero search bar — clicking focuses an actual search input inline, which then shows the `ResearchToolkitPanel` in the focus overlay/dropdown.

### Solution
Replace the fake search button in `StationCompactHook` (for the research station) with the actual `HeroSearchBar` component (with `showResearchHub={true}`). This way, clicking it focuses the real search input and opens the research toolkit panel inline — no station expansion needed.

### Changes

**File: `src/components/JourneyScrollSections.tsx`**

1. In `StationCompactHook` (line 309-315), replace the fake button with the actual `HeroSearchBar` component:
   - Render `<HeroSearchBar showResearchHub={true} />` directly in the compact hook
   - Remove the `onExpand` call for the research station — the search bar handles its own focus state
   - Keep the other stations' compact hooks unchanged

2. In `JourneyStepSection`, for the research station when collapsed, skip the "Tap to explore" text since the search bar is self-explanatory

3. Keep the expanded content as-is (still accessible via a small "expand" link or the search bar's navigation actions)

### Files to modify
- `src/components/JourneyScrollSections.tsx` — replace fake search button with real `HeroSearchBar` in compact hook

