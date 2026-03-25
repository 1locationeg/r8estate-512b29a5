

# Global RTL/LTR Responsive Mirroring

## Current State
- i18n already sets `dir="rtl"` on `<html>` and adds `.rtl` class to `<body>` when Arabic is active (src/i18n/index.ts)
- Some CSS overrides exist in index.css (lines 351-388) for margin flips, chevron flips, text alignment
- A few components manually apply `flex-row-reverse` when RTL (ReviewCard, BrowseCategoriesGrid, ReviewsCarousel)
- Dashboard sidebar is hardcoded `side="left"` for mobile Sheet; desktop sidebar is always on the left via source order
- MobileNavSheet uses `side="right"` always
- ~223 occurrences of `text-left`/`text-right` across 34 files
- Physical margin/padding classes (`ml-*`, `mr-*`, `pl-*`, `pr-*`) used throughout

## Plan

### 1. Dashboard Layout — Sidebar Mirroring
**File: `src/components/DashboardLayout.tsx`**
- The `flex` container already respects `dir="rtl"` natively — when `dir="rtl"` is set on `<html>`, flexbox automatically reverses the visual order. No `flex-row-reverse` needed since the sidebar comes first in DOM order and flex handles direction.
- Verify no explicit `flex-direction: row` override is fighting it (there isn't one currently).

**File: `src/components/DashboardSidebar.tsx`**
- Desktop aside: change `border-e` (already logical, good) — no change needed.
- Mobile Sheet: change `side="left"` to be direction-aware using i18n language check: `side={isRTL ? "right" : "left"}`.

### 2. Mobile Navigation Sheet Direction
**File: `src/components/MobileNavSheet.tsx`**
- Change `side="right"` to `side={isRTL ? "left" : "right"}` so the slide-in drawer comes from the correct edge.

**File: `src/components/MobileNav.tsx`**
- Same change: `side="right"` → `side={isRTL ? "left" : "right"}`.

### 3. Header & Navigation Flip
**File: `src/components/DashboardHeader.tsx`**
- The header uses `flex items-center justify-between` which naturally mirrors in RTL. No structural change needed.
- Replace any `ml-*`/`mr-*` with `ms-*`/`me-*` logical equivalents.

**File: `src/components/Navbar.tsx`**
- Same approach: replace physical margin/padding with logical properties.

### 4. Global CSS — Replace Physical RTL Overrides with Logical Properties
**File: `src/index.css`**
- Remove the manual `[dir="rtl"] .ml-*`, `[dir="rtl"] .mr-*`, `[dir="rtl"] .text-left` CSS overrides (lines 351-388) as they'll be replaced by proper Tailwind logical utilities in components.
- Keep the `.rtl-flip` utility for chevron/arrow rotation.

### 5. Bulk Component Refactor — Logical Properties
Across ~34 files, systematically replace:

| Physical | Logical |
|----------|---------|
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `ml-*` | `ms-*` |
| `mr-*` | `me-*` |
| `pl-*` | `ps-*` |
| `pr-*` | `pe-*` |
| `left-*` (positioning) | `start-*` |
| `right-*` (positioning) | `end-*` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |

**Priority files** (most user-facing):
- DashboardHeader, DashboardSidebar, DashboardLayout
- Navbar, MobileNavSheet, MobileNav, BottomNav
- ReviewCard, ReviewsCarousel, CommunityPostCard
- HeroSearchBar, HeroCategoryItems, BrowseCategoriesGrid
- Footer, DealComparePanel, LaunchComparePanel
- All form components (DealSubmitForm, LaunchSubmitForm, WriteReviewModal)
- Admin components (AdminModerationQueue, AdminGuestReviews, etc.)
- Dialog header (`sm:text-left` → `sm:text-start`)

### 6. Navigation Icons — RTL Arrow Flip
- Add `rtl:rotate-180` class to all directional icons (ArrowLeft, ArrowRight, ChevronLeft, ChevronRight) used as back buttons or navigation indicators across pages (Categories, EntityPage, Leaderboard, DealWatch, LaunchWatch, Portfolio).
- Remove manual `isRTL && "rotate-180"` checks where they exist and use the Tailwind `rtl:` modifier instead.

### 7. BottomNav RTL
**File: `src/components/BottomNav.tsx`**
- Already uses `flex items-center justify-around` which is direction-neutral. No structural change needed.
- Ensure the center brand button positioning works in both directions.

### 8. Remove Manual RTL Conditionals
- Remove `isRTL && "flex-row-reverse"` from BrowseCategoriesGrid, ReviewCard, ReviewsCarousel since flexbox in an RTL document already reverses row direction.
- Remove manual `scaleX(-1)` transforms that duplicate what `rtl:rotate-180` would do.

## Technical Details

- **Tailwind RTL support**: Tailwind v3+ supports `rtl:` and `ltr:` modifiers out of the box, and logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `start-*`, `end-*`, `rounded-s-*`, `rounded-e-*`) are built-in.
- **No new dependencies** needed.
- **Flexbox auto-mirroring**: When `dir="rtl"` is on `<html>`, flex containers with `flex-row` (default) automatically lay out children right-to-left. Grid `auto-flow` also respects direction.
- **Estimated scope**: ~34 files need logical property migration; 4 files need Sheet side logic; CSS cleanup in index.css.

