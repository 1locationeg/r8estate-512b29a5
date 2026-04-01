

# Journey Full-Page Snap-Scroll Homepage

## What Changes

Replace the buyer-mode homepage content with a **5-section full-viewport snap-scroll experience**. Each section fills `100dvh` and snaps into view. All existing homepage components (StepTimeline, HowWeWork, CompareEngine, AudienceSegments, etc.) are **preserved** — they move below the snap container so they're still accessible by scrolling past section 5.

## The 5 Sections

```text
┌──────────────────────────────────┐
│ SECTION 1 — HERO (existing)      │  100dvh
│ Platform descriptor, tagline,    │
│ search bar, HeroTrustShowcase,   │
│ TractionStats, JourneyStationsBar│
├──────────────────────────────────┤
│ SECTION 2 — RESEARCH (navy)      │  100dvh
│ "STEP 1 OF 4 · RESEARCH"        │
│ Search icon in navy ring + "1"   │
│ Heading + 4 bullets + CTA        │
├──────────────────────────────────┤
│ SECTION 3 — CHOOSE (gold)        │  100dvh
│ "STEP 2 OF 4 · CHOOSE"          │
│ Building icon in gold ring + "2" │
│ Heading + 4 bullets + CTA        │
├──────────────────────────────────┤
│ SECTION 4 — FINANCE (teal)       │  100dvh
│ "STEP 3 OF 4 · FINANCE"         │
│ Wallet icon in teal ring + "3"   │
│ Heading + 4 bullets + CTA        │
├──────────────────────────────────┤
│ SECTION 5 — PROTECT (purple)     │  100dvh
│ "STEP 4 OF 4 · PROTECT"         │
│ Shield icon in purple ring + "4" │
│ Heading + 4 bullets + CTA        │
├──────────────────────────────────┤
│ ... existing components below    │  normal scroll
│ (HowWeWork, StepTimeline, etc.)  │
│ Footer                           │
└──────────────────────────────────┘
```

## New Component: `JourneyFullPageScroll.tsx`

- Parent container: `overflow-y-auto scroll-snap-type: y mandatory h-[100dvh]`
- Each section: `min-h-[100dvh] scroll-snap-align: start` with station-tinted gradient background
- **Dot navigation**: Fixed right-side vertical dots (4 dots for sections 2-5), highlighted via `IntersectionObserver`. Clicking scrolls to that section.
- Reusable `JourneyStepSection` sub-component renders: step badge ("STEP X OF 4 · NAME"), tagline quote, large icon inside a colored ring with numbered badge, heading, description, 4 bullet points with green CheckCircle icons, and a station-colored CTA button

## Station Content (from reference screenshots)

| Station | Heading | Tagline | CTA | Route |
|---------|---------|---------|-----|-------|
| Research | "Find Developers You Can Trust" | "Know before you go" | "Start Researching →" | /categories |
| Choose | "Pick a Project You Can Rely On" | "Pick verified projects" | "Explore Live Launches →" | /launch-watch |
| Finance | "Fund Your Purchase Safely" | "Fund safely" | "See Live Deals →" | /deal-watch |
| Protect | "Land Secure. Stay Protected." | "Land secure" | "Create Free Account →" | /auth |

## Changes to `Index.tsx`

- The buyer-mode view wraps the hero card + `JourneyFullPageScroll` sections 2-5 inside the snap container
- All existing components (HowWeWork, CollectiveBuyerProtection, StepTimeline, CompareEngineShowcase, AudienceSegmentCards, HeroCategoryItems, etc.) move **after** the snap container — they remain in the DOM, just below the fold
- Business/industry view toggle is unchanged
- Modals (TrustInsights, Compare, Contract) remain unchanged

## i18n Keys Added

New keys under `"journeyScroll"` namespace in both `en.json` and `ar.json` for all 4 station sections: heading, tagline, description, 4 bullets each, and CTA label.

## Files

| File | Action |
|------|--------|
| `src/components/JourneyFullPageScroll.tsx` | **Create** — snap-scroll container with 5 sections + dot nav |
| `src/pages/Index.tsx` | **Edit** — integrate JourneyFullPageScroll, move existing components below snap sections |
| `src/i18n/locales/en.json` | **Edit** — add journeyScroll keys |
| `src/i18n/locales/ar.json` | **Edit** — add journeyScroll Arabic translations |

