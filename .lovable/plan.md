

## Plan: Move CompareEngineShowcase under FeaturedIdentitySpotlight

### What changes

In `src/pages/Index.tsx`:

1. **Remove** the CompareEngineShowcase block from its current position (line 510-511, inside the below-the-fold section) along with its following divider (line 513).

2. **Insert** it immediately after the `FeaturedIdentitySpotlight` wrapper (after line 421), with a divider and matching container styling.

### Result

The Compare Engine showcase will appear directly beneath the Featured Identity Spotlight, before the "Below-the-fold" section starts. The layout order will be: JourneyScrollSections → FeaturedIdentitySpotlight → CompareEngineShowcase → Trust Strip → rest of page.

