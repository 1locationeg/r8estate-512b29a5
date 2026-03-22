

# Unify All Logos to Homepage Size

## Problem
Despite previous unification attempts, logos still render at different sizes across pages. Some use `size="xs"` (Reviews, DealWatch, Community, Insights, DashboardHeader, ReviewsCarousel), others `size="sm"` (Portfolio, Footer, Leaderboard, Directory, Sidebar, MobileNav), and only a few match the homepage `size="hero"`. Raw `logoIcon` images in BottomNav and PWAInstallBanner also differ.

## Solution
Change every `<BrandLogo>` instance across the entire platform to `size="hero"` — matching the exact homepage logo dimensions (`h-14 w-14`, scaling to `h-20 w-20` on desktop).

## Files to Update

### Navigation/Page Headers (change `xs` → `hero`)
1. **`src/components/DashboardHeader.tsx`** — line 50
2. **`src/pages/Reviews.tsx`** — line 94
3. **`src/pages/DealWatch.tsx`** — line 65
4. **`src/pages/Community.tsx`** — line 125
5. **`src/pages/InsightsPage.tsx`** — line 185
6. **`src/components/ReviewsCarousel.tsx`** — line 308

### Navigation (change `sm` → `hero`)
7. **`src/pages/Portfolio.tsx`** — line 341
8. **`src/components/Footer.tsx`** — line 17
9. **`src/pages/Leaderboard.tsx`** — line 102
10. **`src/pages/DeveloperDirectory.tsx`** — line 36
11. **`src/components/DashboardSidebar.tsx`** — line 109
12. **`src/components/MobileNavSheet.tsx`** — line 45
13. **`src/components/MobileNav.tsx`** — line 51

### Raw `logoIcon` replacements
14. **`src/components/BottomNav.tsx`** — Replace raw `<img>` (line 56) with dimensions matching hero size (`h-14 w-14`)
15. **`src/components/PWAInstallBanner.tsx`** — Replace raw `<img>` (line 76) with dimensions matching hero size (`h-14 w-14`)

### Already correct (no change needed)
- `src/pages/Index.tsx` — `hero` ✓
- `src/pages/Auth.tsx` — `hero` ✓
- `src/pages/NotFound.tsx` — `hero` ✓
- `src/pages/Install.tsx` — `hero` ✓
- `src/pages/ForgotPassword.tsx` — `hero` ✓
- `src/pages/ResetPassword.tsx` — `hero` ✓

## Result
Every logo instance across the entire platform — headers, footers, sidebars, mobile nav, bottom nav, page headers — will render at the exact same dimensions as the homepage logo.

