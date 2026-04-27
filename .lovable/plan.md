# Categories Page → Reviews Hub Redesign (v2)

Transform `/directory` from a "grid of icons" into a **Reviews Hub** so visitors instantly understand: *"This is where real buyers share real experiences."* The category grid stays — but is demoted below the social proof. Inspired by the uploaded mock, the page uses a **two-column layout** on desktop: a sticky **Filters sidebar** on the start side, and the main **reviews feed** in the center.

## Page Structure

### Desktop layout (≥ md)

```text
┌────────────────────────────────────────────────────────────────┐
│ HUB HERO BAND (full width)                                     │
│ Eyebrow: REVIEW HUB · TRUST PLATFORM                           │
│ Headline: "Read what real buyers say — before you sign."      │
│ KPIs: [12,480 reviews] [4.2★ avg] [86% verified]              │
│ Search: 🔍 Search reviews, businesses, projects…              │
├────────────────┬───────────────────────────────────────────────┤
│  FILTERS       │  PERSONALIZED STRIP ("For you" — if signed-in)│
│  (sticky)      │  Horizontal scroller of 4-6 ReviewCards       │
│                ├───────────────────────────────────────────────┤
│  Sort by       │  🔥 TRENDING REVIEWS                          │
│   [Newest ▾]   │  Grid of 6 ReviewCards                        │
│                ├───────────────────────────────────────────────┤
│  Min rating    │  ⏱ JUST POSTED                                │
│   [All ▾]      │  Compact live feed, 5 newest reviews          │
│                ├───────────────────────────────────────────────┤
│  Verified      │  📂 BROWSE BY CATEGORY                        │
│   [All ▾]      │  Existing BrowseCategoriesGrid                │
│                │  (Developers tile keeps "Start here" highlight)│
│  Category      ├───────────────────────────────────────────────┤
│   [All ▾]      │  ✍ WRITE-YOUR-REVIEW CTA strip                │
└────────────────┴───────────────────────────────────────────────┘
```

### Mobile layout (< md)
- Hero band stacks full-width.
- Filters collapse into a single **"Filters"** pill button that opens a bottom-sheet (uses existing `Sheet` component).
- All sections stack vertically in the same order.

## Section Details

### Hub Hero Band
- Eyebrow chip: `REVIEW HUB · TRUST PLATFORM`
- Headline: *"Read what real buyers say — before you sign."*
- 3 inline KPIs from DB: total reviews, avg rating, % verified.
- Prominent search bar with rotating placeholder: *"Try 'Orascom O-West'", "Search 'Palm Hills delivery delays'", "Find 'Mountain View'"*.

### Filters Sidebar (new — inspired by uploaded mock)
- Sticky `top-20` on desktop, scrolls with content otherwise.
- Card with `FILTERS` eyebrow header.
- 4 dropdowns (using existing shadcn `Select`):
  - **Sort by**: Newest · Highest rated · Most helpful · Trending
  - **Minimum rating**: All · 5★ · 4★+ · 3★+
  - **Verified**: All · Verified buyers only
  - **Category**: All · 18 segments
- Active filters drive the Trending grid + Just Posted feed in real time.
- "Reset filters" link at bottom when any filter ≠ default.

### Personalized Strip ("For you")
- Visible **only when** user signed-in OR has saved interests via `useTrackInterest`.
- Pulls reviews where business categories overlap with user's tracked interests.
- Horizontal snap scroller, 4–6 cards, RTL-safe (logical scroll padding).
- If guest with no interests → section hidden.

### Trending Reviews
- 6-card grid, 1-col mobile / 2-col tablet / 3-col desktop.
- Reuses existing `ReviewCard` with a small "🔥 Trending" badge.
- Driven by filters sidebar.

### Just Posted
- 5 newest reviews, compact single-line: `[avatar] [name + stars] — "First 80 chars…" · 4m ago · @Developer`.
- Auto-refresh every 30s.
- Click → entity profile, scrolled to the review.

### Browse by Category (demoted)
- Section header: *"Or browse all 18 categories"* — small, secondary.
- Renders **existing** `BrowseCategoriesGrid` unchanged (Developers tile keeps "Start here" treatment).
- Wrapped in `<HomeSection>`.

### Write-Your-Review CTA strip
- Full-width frosted strip in primary color.
- Headline: *"Already a buyer? Your review protects 1,000+ next buyers."*
- Button → opens existing `WriteReviewModal`.

## Technical Implementation

**New files:**
- `src/components/hub/HubHeroBand.tsx` — eyebrow, headline, 3 KPIs, expanded search.
- `src/components/hub/HubFiltersSidebar.tsx` — sticky filters card (Sort / Rating / Verified / Category) + reset link. Mobile variant renders inside a Sheet.
- `src/components/hub/PersonalizedReviewsStrip.tsx` — uses `useAuth` + interest tracking to fetch matching reviews.
- `src/components/hub/TrendingReviewsGrid.tsx` — receives filters via props, fetches from `reviews` table.
- `src/components/hub/JustPostedFeed.tsx` — compact live feed with 30s refetch.
- `src/components/hub/WriteReviewCtaStrip.tsx` — bottom CTA, opens existing modal.
- `src/hooks/useHubFilters.ts` — small hook holding `{sort, minRating, verifiedOnly, category}` state shared between sidebar and feeds.

**Modified files:**
- `src/pages/Categories.tsx` — restructured into hero + 2-column grid (sidebar + feed) with all hub sections.

**Data sources (all existing):**
- `supabase.from("reviews").select(...)` for trending + just-posted (joined with `business_profiles` for the developer name).
- `useAuth()` + interest tracking localStorage for personalization.

**Design tokens / conventions:**
- All colors via semantic tokens (`--primary`, `--muted-foreground`, `--journey-*`).
- Use `.heading-section` and `.eyebrow` utilities from `index.css`.
- Logical properties only (`ms-`, `pe-`, `text-start`, `start-*`).
- 390px viewport safety: horizontal scrollers use `overflow-x-auto snap-x` with `scroll-padding-inline-start`.
- 44px min touch targets on all interactive cards.

## What stays the same
- Route remains `/directory`. Navbar "Developers" button still points here.
- `BrowseCategoriesGrid` logic (Developers-first ordering, expansion, DB merging) untouched.
- Existing `ReviewCard` and `WriteReviewModal` reused.

## Out of scope
- No DB schema changes. Trending uses recency + helpful_count ordering — a true `views_count` can be added later.
- New copy added inline with `isRTL` ternaries; can be extracted to i18n after approval.
