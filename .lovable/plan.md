

## Plan: Reduce vertical padding site-wide to eliminate excessive white space

### Problem
Multiple sections across the homepage (and some components) use `py-8 md:py-12` or `py-12 md:py-16` padding, creating large white gaps between blocks. The goal is to tighten all vertical spacing to a compact, consistent rhythm.

### New standard spacing
- **Section wrappers in Index.tsx**: `py-4 md:py-6` (down from `py-8 md:py-12`)
- **Journey sections**: `py-6 md:py-8` (down from `py-12 md:py-16`)
- **Footer internal**: `py-6 md:py-8` (down from `py-10 md:py-14`)
- **Footer snap wrapper**: `mt-0` (down from `mt-4`)

### File: `src/pages/Index.tsx` (7 edits)

| Line | Current | New |
|------|---------|-----|
| 419 | `py-8 md:py-12` (FeaturedIdentitySpotlight) | `py-4 md:py-6` |
| 424 | `py-8 md:py-12` (CompareEngineShowcase) | `py-4 md:py-6` |
| 430 | `py-8 md:py-12` (Quick Actions) | `py-4 md:py-6` |
| 457 | `py-8 md:py-12` (Trust Strip) | `py-4 md:py-6` |
| 477 | `py-8 md:py-12` (HowWeWork) | `py-4 md:py-6` |
| 538 | `py-8 md:py-12` (StepTimeline) | `py-4 md:py-6` |
| 550 | `py-8 md:py-12` (SmartRecommendations) | `py-4 md:py-6` |
| 668 | `mt-4` (Footer wrapper) | `mt-0` |

### File: `src/components/JourneyScrollSections.tsx` (1 edit)

| Line | Current | New |
|------|---------|-----|
| 351 | `py-12 md:py-16` | `py-6 md:py-8` |

### File: `src/components/StepTimeline.tsx` (1 edit)

| Line | Current | New |
|------|---------|-----|
| 38 | `py-8 md:py-12` | `py-4 md:py-6` |

### File: `src/components/Footer.tsx` (1 edit)

| Line | Current | New |
|------|---------|-----|
| 95 | `py-10 md:py-14` | `py-6 md:py-8` |

### Summary
10 targeted padding reductions across 4 files. No layout or logic changes — purely CSS class updates to close excessive white gaps between all homepage blocks.

