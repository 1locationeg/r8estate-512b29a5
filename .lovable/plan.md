
## Goal

Bring the homepage and shared UI primitives up to the polish level of the reference project (`bd194ed0`). The reference doesn't have *more* features — it just feels professional because it is **calm, consistent, well-spaced, and restrained**. We'll port that discipline onto our existing components without removing functionality.

## What makes the reference look "designed"

After reading its `styles.css`, `Navbar`, `HeroSection`, `AudienceCards`, and `FeaturedDevelopers`:

1. **One coherent palette** — Deep Teal primary, Amber accent, Coral destructive, soft warm cream `--page-bg`. No competing brand reds in the hero.
2. **Generous, fluid type scale** — `font-size: clamp()` on body, `heading-hero` ≈ 6xl/7xl, big `font-black tracking-tight` headlines, tiny ALL-CAPS eyebrows with `tracking-[0.2em]`.
3. **Consistent rhythm** — every section is `py-14`, container `max-w-6xl`, gaps `gap-4/5`, cards `rounded-2xl border border-border bg-card p-6`.
4. **One CTA system** — pill `rounded-full` buttons, primary uses a teal→accent gradient with `shadow-lg shadow-primary/30`, secondary is `variant="outline" border-2`.
5. **One card system** — `rounded-xl/2xl border border-border bg-card`, hover `-translate-y-0.5/1` + `hover:shadow-md/lg` + `hover:border-primary/40`. Used identically in audience cards, developer cards, testimonial.
6. **Calm hero** — eyebrow pill → tagline → big shimmer headline → 2 CTAs → trust gauge → 1 floating testimonial → search bar → popular searches. Linear, single-column, lots of whitespace. Our hero crams ~10 widgets above the fold instead.
7. **Sticky translucent navbar** — `bg-background/80 backdrop-blur` with `border-b border-border/60`, h-16, simple text links with `activeProps` highlighting.
8. **Section headers** — left-aligned title + small subtitle on one row with a "View all →" link on the right (FeaturedDevelopers pattern). Consistent everywhere.

## What we'll change in R8ESTATE

### 1. Design token alignment (`src/index.css`)
- Add a `--page-bg` token (soft cream) and apply it to `body` so the whole site sits on one warm neutral, not pure white.
- Tighten the heading utilities `.heading-hero` / `.heading-section` to match the reference scale (mobile 30px → desktop 56–72px for hero; 20→24px for section).
- Add a `.section-divider` utility (200px gradient line) and a `.eyebrow` utility (uppercase, `tracking-[0.2em]`, `text-[10px]`) for reuse.
- Standardise card hover: add `.card-hover` utility (`hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 transition-all`).

### 2. Hero polish (`src/components/HeroSection.tsx` or current hero stack on `Index.tsx`)
Without removing existing widgets, **reorder + breathe**:
- Eyebrow pill (Trust • Shield • Platform) — adopt reference styling.
- Tagline (muted) → shimmer headline (single line, `font-black`, no decorative stars *above the fold*).
- Exactly **2 CTAs** on the primary row: outline "See Real Owners" and gradient "Save Money". Move "AI Assistant" to a small text link below (current `HeroPowerCTAs` keeps its semantics, just visually quieter).
- Single search bar in a `rounded-full border bg-card` shell (matches reference) + 3 popular-search chips.
- Move `HeroTrustShowcase`, `ContractCheckCard`, `TruthCheckHero`, `MiniJourneyArc`, `HeroNextSteps` **below** the hero into clearly separated sections with consistent `py-14` rhythm — they remain, just stop fighting the headline.

### 3. Homepage composition (`src/pages/Index.tsx`)
Adopt the reference's narrative order while keeping all our unique sections:
```text
Navbar → JourneyCorridor (slim) → Hero (calm) →
HeroTrustShowcase → TrustStrip/CollectiveBuyerProtection →
TractionStats → HowWeWork → AudienceSegmentCards →
CompareEngineShowcase → FeaturedIdentitySpotlight →
ReviewsCarousel → CommunityHighlights → BrowseCategoriesGrid →
StepTimeline → PricingTeaser → JourneyCompleteCTA →
SiteExperienceFeedback → Footer
```
Wrap each in a shared `<HomeSection>` helper that enforces `py-14 md:py-16`, `container max-w-6xl px-4`, and the standard left-aligned header (title + subtitle + optional "View all" link).

### 4. Section header standardisation
Create `src/components/SectionHeader.tsx`:
```tsx
<SectionHeader
  title="Top-rated developers"
  subtitle="Highest trust scores from verified buyers"
  viewAllHref="/businesses"
/>
```
Replace ad-hoc headings inside ~10 homepage sections to remove the current variety of sizes/colors/alignments.

### 5. Card primitive consistency
Audit and align these cards to the same `rounded-2xl border border-border bg-card p-6` + `card-hover` recipe (Arabic-friendly, RTL-safe):
- `AudienceSegmentCards`
- `FeaturedIdentitySpotlight`
- `BrowseCategoriesGrid` tiles
- `ReviewsCarousel` items
- `CommunityHighlights` items
- `PricingTeaser` plan cards

### 6. Navbar polish (`src/components/Navbar.tsx`)
- Switch wrapper to `sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur`.
- Reduce nav links to 5 max (Businesses, Reviews, Community, Deals, Launches) with `activeProps` style; move overflow into the user dropdown / mobile sheet (mirrors reference).
- Avatar dropdown becomes the single entry point for Dashboard / Messages / Leaderboard / Settings / Notifications / Sign out (we already have the pieces; just consolidate visual treatment).

### 7. Buttons & inputs
- Default size for hero/section CTAs becomes `size="lg" rounded-full px-6`.
- Primary CTAs use the teal→amber gradient inline style from the reference for that "designed" feel.
- Inputs in hero search adopt the pill-shell pattern (icon, borderless input, primary pill submit).

## Out of scope (intentionally)

- No new features, no copy rewrites beyond labels needed for new section headers.
- No removal of: gamification, R8 Agent, journey corridor, side rail, bottom nav, FAB, contract check, truth check, deal/launch widgets.
- Arabic typography (Cairo/Almarai) and RTL logical properties are preserved exactly as today.
- No backend / RLS / migration changes.

## Files to touch

- `src/index.css` — tokens, heading utilities, `.card-hover`, `.eyebrow`, `.section-divider`.
- `src/pages/Index.tsx` — reorder, wrap sections in `<HomeSection>`.
- `src/components/SectionHeader.tsx` — **new**.
- `src/components/HomeSection.tsx` — **new** (thin wrapper for spacing/container).
- `src/components/Navbar.tsx` — translucent sticky shell, link consolidation.
- Hero stack: `HeroSearchBar.tsx`, `HeroPowerCTAs`, `HeroTrustShowcase` — visual restraint pass.
- Card components listed in §5 — token swap to the standard recipe.

## Acceptance

- Homepage scrolls as one calm narrative on desktop (1024–1440) and mobile (390): every section uses the same container width, vertical rhythm, and header pattern.
- Only one CTA style above the fold; only one card style across the page.
- Body sits on `--page-bg` cream; cards on white pop subtly.
- No horizontal scroll at 390px; touch targets stay ≥44px (existing rule).
- All Arabic strings still flow correctly under `dir="rtl"`.
