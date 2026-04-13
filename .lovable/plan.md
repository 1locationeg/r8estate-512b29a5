

## Plan: Fix Mobile Overflow & Spacing Issues

### Issues Found
1. **Testimonial badges clipping right edge** — In `JourneyScrollSections.tsx`, the badge text ("Saved EGP 1.2M") uses `whitespace-nowrap` and overflows on 390px screens
2. **Trust strip 3-pill row** — In `Index.tsx`, three trust pills use `whitespace-nowrap` and push past viewport width on mobile
3. **FeaturedIdentitySpotlight banner** — Developer name and action buttons (save/follow/share) compete for space, causing the name to be cut off on the navy banner

### Changes

#### 1. `src/components/JourneyScrollSections.tsx` — Fix badge overflow
- Line 91: Change badge from `whitespace-nowrap` to `truncate max-w-[100px]` so long badge text ("Saved EGP 1.2M") shrinks gracefully on narrow screens
- Keep `shrink-0` but add a max-width constraint

#### 2. `src/pages/Index.tsx` — Trust strip mobile layout
- Lines 466-479: On mobile, stack the 3 trust pills into a scrollable horizontal row (`flex overflow-x-auto md:flex-row`) or reduce text size to `text-[8px]` on mobile. Simplest fix: remove `whitespace-nowrap` on mobile and let text wrap, or use `overflow-x-auto scrollbar-hide` on the container

#### 3. `src/components/FeaturedIdentitySpotlight.tsx` — Banner layout fix
- Lines 124-154: On mobile, move the action buttons (save/follow/share) below the developer name instead of absolute-positioned `end-0`, so the name gets full width. Use `flex-col` on mobile, `flex-row` on `md:`

### Files touched
1. **Edit** — `src/components/JourneyScrollSections.tsx` (badge overflow)
2. **Edit** — `src/pages/Index.tsx` (trust strip)
3. **Edit** — `src/components/FeaturedIdentitySpotlight.tsx` (banner layout)

