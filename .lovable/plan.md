

## Plan: Move FeaturedIdentitySpotlight under JourneyScrollSections (4/4 Protect)

### What changes
In `src/pages/Index.tsx`:

1. **Remove** the FeaturedIdentitySpotlight block from its current position (lines 514-520, inside the `!specialViewItem && !selectedDeveloper` conditional block).

2. **Insert** it immediately after `<JourneyScrollSections />` (line 416), before the "Below-the-fold" section, wrapped in the same styling container with a divider.

### Result
The Featured Identity Spotlight card will appear directly beneath the 4/4 Protect journey section, above the Trust Strip and other below-the-fold content. It will no longer be conditionally hidden when a developer or item detail is selected.

