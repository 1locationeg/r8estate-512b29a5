
# Homepage Polish — Consistency & Trust Corridor

Note: I don't see an image attached to this message, but your direction is clear: **keep every existing item, do not invent a new concept** — refactor the homepage so it reads as one calm, professional, trust-driven corridor (Trustpilot/G2 caliber) instead of a stack of mismatched strips and rectangles.

## Goal

Make `/` (Index.tsx) feel like a single guided walkthrough where the visitor always knows: **where they are → what to do → where they're going next**, with brand-consistent navy/gold/red restraint and pixel-aligned rhythm on both 390px mobile and desktop.

## Diagnosis (what's inconsistent today)

Reading `src/pages/Index.tsx` we already have the polish primitives (`HomeSection`, `SectionHeader`, `.eyebrow`, `.card-hover`, `page-bg`) per `mem://design/ui-polish-primitives`, but the homepage doesn't use them. Instead it has:

- **15+ ad-hoc wrappers** like `<div className="w-full max-w-[1100px] py-4 md:py-6">` repeated with slightly different padding (`py-2`, `py-4`, `py-6`, `mt-3`, `mb-0`). Vertical rhythm drifts every section.
- **Three competing container widths** mixed inline: `max-w-[1440px]`, `max-w-[1100px]`, `max-w-[700px]`, plus `px-3 sm:px-4 md:px-8 lg:px-12` repeated 8 times.
- **No section headers**: most blocks (CommunityHighlights, AudienceSegmentCards, ReviewsCarousel, PricingTeaser, SmartRecommendations) drop in without a unified eyebrow + title + "View all →" — so the user can't tell what each strip is or why it's there.
- **Card style drift**: `rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm` vs `rounded-2xl border border-primary/15 bg-card shadow-sm` vs `rounded-xl bg-muted/60 border border-border/40`. Quick Actions, ContractCheck, MarketPulse, DealWatch, LaunchWatch all look like they came from different products.
- **Hero is overcrowded**: tagline → stars animation → 2 CTAs → "ask agent" → trust showcase → traction stats → reviewer spotlight → truth-check → next steps → collective protection → search bar — all stacked inside ONE card with no breathing room. User loses the primary action.
- **Trust strip + Trust badges + Trust showcase + Truth-check** all live within ~600px of scroll using different visual languages (pill / chip / card / hero band). Reads as repetition, not reinforcement.
- **Mobile (390px)**: trust strip uses `text-[8px]`, Quick Actions grid is `grid-cols-2` with 4 widgets that all look different sizes, and CTAs in `business-mode` are `flex-col sm:flex-row` while buyers mode uses `flex-row` always — inconsistent touch rhythm.
- **Section dividers** are dropped in 9 places as `<div className="section-divider" />` between blocks that already have their own borders → double seams.

## Approach (polish, not redesign)

Re-wrap every existing block in the shared `HomeSection` + `SectionHeader` primitives the project already ships, normalize 4 card variants down to 1, and group the homepage into **4 named corridor zones** that map to the existing buyer journey (Research → Choose → Finance → Protect — see `mem://architecture/journey-mapping`). No items removed, no new concepts.

### 1. Hero (Zone 0 — "Where you are")

Single card, max 3 elements visible at once on first paint:
- Eyebrow pill: `TRUST PLATFORM` (keep)
- Hero headline + tagline (keep stars animation, keep Save Money CTA per core memory)
- Two power CTAs (keep "See Owners" + "Protect Money") — promote to primary visual focus
- Move `HeroTrustShowcase`, `TractionStats`, `ReviewerSpotlight`, `TruthCheckHero`, `CollectiveBuyerProtection`, `HeroNextSteps`, search bar **out of the hero card** into their own `HomeSection` blocks below. Hero card breathes.

### 2. Corridor zones with consistent headers

Wrap each below-the-fold block in `<HomeSection>` + `<SectionHeader eyebrow=… title=… subtitle=… link=…>`:

```text
─ Zone 1 · RESEARCH ────────────────────
  HeroTrustShowcase            (eyebrow: HOW IT WORKS)
  TractionStats                (eyebrow: BY THE NUMBERS — no header, just strip)
  HeroSearchBar                (eyebrow: START HERE  · title: "Search any developer or project")
  HeroCategoryItems            (eyebrow: BROWSE  · title: "Where do you want to start?")

─ Zone 2 · CHOOSE ─────────────────────
  FeaturedIdentitySpotlight    (eyebrow: SPOTLIGHT)
  ReviewsCarousel              (eyebrow: REAL BUYERS · link: View all →)
  SmartRecommendations         (eyebrow: FOR YOU · link: See more →)
  CompareEngineShowcase        (eyebrow: COMPARE)

─ Zone 3 · FINANCE ────────────────────
  Quick Actions grid           (DealWatch + LaunchWatch + ContractCheck + MarketPulse — UNIFIED card style)
  TruthCheckHero               (eyebrow: NEW · title: "Verify before you sign")

─ Zone 4 · PROTECT ────────────────────
  CollectiveBuyerProtection    (keep red/green narrative)
  CommunityHighlights          (eyebrow: COMMUNITY · link: Open community →)
  ReviewerSpotlight            (eyebrow: TOP REVIEWERS)
  AudienceSegmentCards         (eyebrow: WHO IS THIS FOR)
  PricingTeaser                (eyebrow: UPGRADE)
  SDGAlignmentStrip            (compact strip)
  JourneyCompleteCTA           (eyebrow: YOUR NEXT STEP — final CTA, full-bleed accent)
  SiteExperienceFeedback
```

The existing `JourneyCorridor` (already global) gets the matching zone IDs so the side rail and scroll progress stay in sync.

### 3. Visual consistency rules (applied everywhere)

| Element | Rule |
|---|---|
| Section padding | Always `<HomeSection>` (= `py-10 md:py-14`). Use `compact` only for strips. Remove all inline `py-4 md:py-6`. |
| Container | Always `max-w-6xl px-4` from `HomeSection`. Drop the mixed `1440/1100/700` widths. Hero stays `max-w-[1100px]`. |
| Cards | One canonical class: `rounded-2xl border border-border/60 bg-card shadow-sm card-hover`. Apply to Quick Actions widgets, Spotlight, Pricing tiers, Audience cards, Review cards. |
| Icon chips | One size: `w-10 h-10 rounded-xl bg-primary/8` with `w-5 h-5` icon. Today they range from `w-8 h-8` to `w-12 h-12`. |
| Eyebrows | `.eyebrow` utility (ALL-CAPS, `tracking-[0.2em]`, `text-[11px]`, `text-primary`). Used above every section title. |
| Titles | `.heading-section` (already exists). No more raw `text-2xl md:text-4xl font-bold`. |
| Dividers | Delete all 9 `section-divider` instances. `HomeSection` rhythm replaces them. |
| Trust strip | Single horizontal pill row, `text-xs` minimum on mobile (kill the `text-[8px]`). |
| Buttons | Primary = `bg-primary` filled pill, Secondary = `border bg-card` pill. Min height `44px` (mobile touch). |
| Mobile hero CTAs | Stack vertically only below 360px; otherwise side-by-side with equal widths. |

### 4. Trust language reinforcement (no new content)

- Add a thin **Trustpilot-style 5-color rating bar** under the hero headline (uses existing `--trust-excellent/good/fair` tokens) to anchor the "we are a rating platform" identity instantly.
- Every section header's `link` arrow uses `rtl:rotate-180` (already in `SectionHeader`) so Arabic flows correctly.
- `Verified` badges (Shield + green) reused identically wherever a card mentions verification — same pill, same color, same icon size — so the badge becomes a recognizable trust glyph instead of 5 lookalikes.

### 5. Business mode

Apply the same `HomeSection` wrapping and unified card class to the `business-mode` branch (lines 606–702) so switching modes feels like the same product, not a different page. Keep the Forest Green token remap.

## Files to change

- `src/pages/Index.tsx` — main rewrap (no logic / state / data changes; only JSX shell).
- `src/components/SectionHeader.tsx` — add optional `link` + `linkLabel` prop wired to React Router (if not already there).
- `src/index.css` — add 2 small utility classes if missing: `.card-canonical` (the unified card) and `.icon-chip` (the unified icon container). Tighten `.heading-section` size on mobile.
- `src/components/HomeSection.tsx` — already correct, no edit needed.
- Quick-action widget components (`DealWatchWidget`, `LaunchWatchWidget`, `ContractCheckCard`, `MarketPulseWidget`) — replace their root `className` with the canonical card class so the 4-up grid finally aligns.
- `src/components/CollectiveBuyerProtection.tsx`, `PricingTeaser.tsx`, `AudienceSegmentCards.tsx`, `ReviewsCarousel.tsx`, `CommunityHighlights.tsx` — strip their internal `<section>` wrappers (let `HomeSection` own the shell) and switch their inner cards to `card-canonical`.

## Out of scope (explicitly NOT touched)

- No items removed, no content rewritten, no new sections added.
- No changes to data fetching, hooks, routes, auth, RLS, edge functions, copilot, i18n keys.
- No changes to `JourneyCorridor`, `Navbar`, `Footer`, `BottomNav` behavior — only their spacing rhythm aligns to `HomeSection`.
- No new colors. Only existing brand tokens (Navy `#0a3d62`, Gold `#fac417`, Red `#ed1b40`, Verified Green).

## Acceptance check

- Homepage scroll on 390px and 1280px shows **identical vertical rhythm** between every section (eye-test: section gap is constant).
- Every below-the-fold block has an eyebrow + title + (optional) "View all →".
- Quick Actions 4-up grid renders 4 cards at the **same height & corner radius** on mobile and desktop.
- Hero card on first paint shows only: eyebrow → headline → 2 CTAs → ask-agent hint. Everything else lives below in its own labeled section.
- No horizontal scroll at 390px (existing mobile-safety memory).
- RTL Arabic: all section header arrows mirror, all spacings use logical properties.
