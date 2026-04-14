

## Plan: Persist Journey Corridor Across All Pages

### Problem
The Journey Corridor only renders on the homepage (`Index.tsx`). When clicking a station on the `MiniJourneyArc` or `SideJourneyRail`, users navigate to inner pages (e.g., `/categories`, `/portfolio`) where the corridor vanishes, losing journey context.

### Solution
Move the `JourneyCorridor` from being homepage-only to rendering site-wide in `AppContent` (inside `App.tsx`), with two behavioral modes:

1. **Homepage mode** (current behavior): sticky bar with scroll-to-section on station click
2. **Inner page mode** (new): same sticky bar, but clicking a station navigates to `station.homeRoute`. The currently active station is determined by `getStationForRoute(pathname)` instead of scroll position.

### Changes

**`src/App.tsx`**
- Import and render `JourneyCorridor` inside the main routes layout (after `JourneyStripe`, before the page content)
- Remove the homepage-specific exclusion routes (auth, embed, review, etc.) — handle that inside the component

**`src/pages/Index.tsx`**
- Remove the `<JourneyCorridor />` render from the homepage (it now lives in App)

**`src/components/JourneyCorridor.tsx`**
- Add route awareness: detect if on homepage (`pathname === "/"`) or inner page
- On homepage: keep existing scroll-based behavior (scroll to `#journey-section-X`)
- On inner pages: determine active station via `getStationForRoute(pathname)`, clicking a station calls `navigate(station.homeRoute)` instead of `scrollToZone`
- Hide on excluded routes (auth, embed, review, forgot/reset password) — same exclusion list as `SideJourneyRail`
- On inner pages, show progress from persisted engagement data (already stored in localStorage/DB) rather than scroll position

### Visual result
```text
Homepage:      [Corridor] scrolls to sections
/categories:   [Corridor] Research station highlighted, click Choose → /portfolio
/portfolio:    [Corridor] Choose station highlighted, click Finance → /deal-watch
/deal-watch:   [Corridor] Finance station highlighted, click Protect → /buyer
```

The corridor provides persistent wayfinding across the entire app, so users always know where they are in the journey and can navigate between stages.

### Files changed
- `src/App.tsx` — add JourneyCorridor to global layout
- `src/pages/Index.tsx` — remove JourneyCorridor from homepage
- `src/components/JourneyCorridor.tsx` — add inner-page mode with route-based active station and navigation

