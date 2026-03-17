

## Plan: Tighten Logo Spacing & Force Tagline Single Line

**Changes across 2 files:**

### 1. `src/pages/Index.tsx` (lines 117-131)
- Increase negative margin on logo icon from `-mr-1` to `-mr-2 md:-mr-3` to close the gap between symbol and text
- Reduce gap between brand name and tagline by adding `-mt-0.5` or `gap-0` and tighter `leading-none`
- Add `whitespace-nowrap` to tagline span so it never wraps on any screen size

### 2. `src/components/DashboardHeader.tsx` (lines 35-48)
- Increase negative margin on logo icon from `-mr-0.5` to `-mr-1.5`
- Add `whitespace-nowrap` to tagline span
- Tighten vertical spacing between brand name and tagline

**Also check and update the same pattern in:**
- `src/components/Footer.tsx`
- `src/components/MobileNav.tsx`
- `src/components/BottomNav.tsx`

These components currently lack the tagline but have the logo — will add tagline with same tight spacing for consistency, or just tighten existing spacing if tagline is absent.

