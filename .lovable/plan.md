
## Plan: Unify Homepage Visual Consistency

### The Problem
The homepage sections feel disconnected — each one has its own background, spacing, border style, header pattern, and animation approach. There's no visual "thread" tying them together. Specifically:

- **Inconsistent backgrounds**: Hero card uses `bg-card` with border, Trust Strip uses solid `bg-primary`, CollectiveBuyerProtection uses a dark navy gradient, HowWeWork has no wrapper, CompareEngine has no wrapper, AudienceSegmentCards uses plain white, StepTimeline uses plain white
- **Inconsistent section headers**: Some use a pill badge + gradient text headline, others use plain text, others skip headers entirely
- **Inconsistent spacing**: `py-3`, `py-8`, `py-10`, `py-12` — all different padding between sections
- **Inconsistent card styles**: Some cards use `ai-grain`, some use `backdrop-blur-sm`, some are plain `bg-card border-border`
- **Scattered icon coloring**: TractionStats uses `text-cyan-400`, other sections use `text-primary`, `text-accent`, etc.
- **No shared visual rhythm**: No alternating patterns, no consistent dividers, no unifying subtle backgrounds

### The Fix — A Unified Design Language

**1. Standardize section wrapper** (`Index.tsx`)
- Apply consistent vertical padding: `py-8 md:py-12` for all below-fold sections
- Add subtle alternating section backgrounds: odd sections get `bg-transparent`, even sections get a very faint `bg-primary/[0.02]` tint — creating visual rhythm without hard borders
- Wrap each section in a consistent `max-w-[1100px] mx-auto` container

**2. Standardize section headers** (all section components)
Create a consistent header pattern across ALL sections:
- Small pill badge (icon + label) in `bg-primary/10 text-primary` with `border border-primary/15`
- Headline in `text-xl md:text-2xl font-bold text-foreground` (no gradient text — too busy)
- Optional subtitle in `text-sm text-muted-foreground`
- Apply to: HowWeWork, CompareEngine, AudienceSegmentCards, StepTimeline, CollectiveBuyerProtection, SmartRecommendations, CommunityHighlights, FeaturedIdentitySpotlight

**3. Standardize card styling** (all card-based components)
Unified card recipe:
- `rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm`
- Hover: `hover:border-primary/30 hover:shadow-[0_0_20px_-6px_hsl(var(--primary)/0.15)]`
- Remove inconsistent `ai-grain` from cards (keep only on hero/showcase elements)

**4. Fix TractionStats icon colors** (`TractionStats.tsx`)
- Change `text-cyan-400` to `text-primary` — cyan is not in the brand palette

**5. Add subtle section dividers** (`Index.tsx`)
- Between major sections, add a thin `<div className="w-16 h-px bg-border mx-auto" />` line — subtle visual breathing room

**6. Standardize the Trust Strip** (`Index.tsx`)
- Change from solid `bg-primary` block to a softer `bg-primary/10 border border-primary/20 rounded-xl` to match the overall light theme better

**7. Unify animation approach**
- Keep IntersectionObserver fade-in but standardize: `opacity-0 translate-y-4 → opacity-100 translate-y-0` with `duration-500` everywhere (currently some use `duration-300`, some `duration-500`, some `duration-1000`)

### Files Modified
- `src/pages/Index.tsx` — Section wrappers, spacing, dividers, Trust Strip styling
- `src/components/TractionStats.tsx` — Icon colors
- `src/components/HowWeWork.tsx` — Header pattern, card consistency
- `src/components/CompareEngineShowcase.tsx` — Header pattern, card consistency
- `src/components/AudienceSegmentCards.tsx` — Header pattern standardization
- `src/components/StepTimeline.tsx` — Header pattern, remove gradient text
- `src/components/CollectiveBuyerProtection.tsx` — Header badge consistency
- `src/components/SmartRecommendations.tsx` — Card styling
- `src/components/FeaturedIdentitySpotlight.tsx` — Card styling consistency

### What Stays Untouched
- Hero card (already the anchor design)
- JourneyScrollSections (intentionally different — full-width stations with unique theme colors)
- ReviewsCarousel (already well-styled)
- Footer

### No database changes needed.
