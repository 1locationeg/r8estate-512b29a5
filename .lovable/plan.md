

## Plan: Move AudienceSegmentCards under CompareEngineShowcase

### Changes in `src/pages/Index.tsx`

1. **Remove** the AudienceSegmentCards block from its current position (line 520) inside the below-the-fold section.

2. **Insert** it immediately after the CompareEngineShowcase block (after line 427), with the same container styling and a divider.

### Resulting layout order
JourneyScrollSections → FeaturedIdentitySpotlight → CompareEngineShowcase → **AudienceSegmentCards** → Quick Actions + Widgets → Below-the-fold sections

