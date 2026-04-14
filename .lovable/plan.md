

## Plan: Make Corridor Clicks Scroll to Journey Sections

### Problem
The corridor station clicks and tip clicks try to scroll to `[data-zone="N"]` elements, which are large wrapper divs in Index.tsx. The actual visible journey sections (showing "1/4 RESEARCH", "2/4 CHOOSE", etc.) have `id="journey-section-0"` through `journey-section-3"` — but nothing targets them.

### Changes

**File: `src/components/JourneyCorridor.tsx`**

1. Update `scrollToZone(zone)` to first try `#journey-section-{zone-1}`, falling back to `[data-zone="{zone}"]`.

2. Update all `scrollTo` values in `STATION_TIP_ITEMS` to use `#journey-section-0`, `#journey-section-1`, `#journey-section-2`, `#journey-section-3` respectively.

3. Update `handleTipClick` fallback selectors similarly.

4. For tips that navigate away from `/` (e.g. `/reviews`, `/community`), keep the route navigation as-is. Only same-page tips get the scroll-to-section behavior.

This ensures clicking any station dot or tip on the homepage smoothly scrolls to the matching "X/4 · TITLE" journey section.

