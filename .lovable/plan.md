

# Unify All Logos to BrandLogo Component

## Problem
Logo appears in different sizes and formats across the platform — some pages use the `BrandLogo` component with varying sizes (`xs`, `sm`, `md`, `lg`, `hero`), while others use raw `logoIcon` images with inconsistent dimensions. The user wants all logos unified to match the selected homepage logo's dimensions and style.

## Approach
Standardize all logo instances to use the `BrandLogo` component consistently, and unify the sizing so there are only two contexts: **header/nav** (compact) and **hero/splash** (large). Replace all raw `logoIcon` usages with `BrandLogo`.

### Size Standardization
- **Nav/header contexts** (dashboard header, footer, mobile nav, sidebar, bottom nav, page headers): all use `size="sm"` (h-10 w-10 icon, text-lg)
- **Hero/splash contexts** (homepage hero, auth page, install page, 404 page): all use `size="hero"` (h-14/h-20 icon)
- Remove usage of `xs` and `md` sizes — they create inconsistency

### File Changes

1. **`src/components/BrandLogo.tsx`** — Update `xs` config to match `sm` dimensions (h-10 w-10) so even if `xs` is used somewhere it matches. Remove size fragmentation.

2. **`src/components/DashboardHeader.tsx`** — Change `size="xs"` → `size="sm"`

3. **`src/pages/Auth.tsx`** — Change `size="md"` → `size="hero"` (splash context)

4. **`src/pages/NotFound.tsx`** — Change `size="md"` → `size="hero"` (splash context)

5. **`src/pages/Portfolio.tsx`** — Replace raw `logoIcon` img with `<BrandLogo size="sm" />`

6. **`src/components/BottomNav.tsx`** — Replace raw `logoIcon` img with the logo icon from `BrandLogo`'s asset, keeping the circular wrapper but using consistent `h-10 w-10` sizing (already matches)

7. **`src/components/PWAInstallBanner.tsx`** — Replace raw `logoIcon` img with `<BrandLogo size="sm" tagline="" />` or keep icon-only but at consistent `h-10 w-10` (already matches)

### Result
Every logo across the platform will render at one of two consistent sizes with the same component, eliminating visual fragmentation between pages.

