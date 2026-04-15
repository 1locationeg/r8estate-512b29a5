

## Plan: Remove the SideJourneyRail

The `SideJourneyRail` is redundant — journey progress is already conveyed by the JourneyCorridor (top bar), PageHeader (station badge), BottomNav, and MiniJourneyArc. Removing it declutters the viewport, especially on mobile where edge space is precious.

### Changes

**1. Delete `src/components/SideJourneyRail.tsx`**

**2. Remove its usage from `src/App.tsx`**
- Remove the import and the `<SideJourneyRail />` render call.

**3. Clean up memory**
- Update `mem://navigation/side-journey-rail` to note it was removed.

That's it — two file touches and one deletion. No other component depends on `SideJourneyRail`.

