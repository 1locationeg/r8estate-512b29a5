

# Standardize Logo Display Across All Pages

## Reference Pattern (Index.tsx header)
The logo on the Index page uses: icon image with negative margin overlap + stacked text ("R8ESTATE" + tagline). This is the canonical format to replicate everywhere.

## Current Inconsistencies

There are **two categories** of logo display across ~15 files:

**Category A — Missing tagline / wrong layout** (logo + text side-by-side without tagline):
- `src/pages/NotFound.tsx` — flat span, no tagline
- `src/pages/ForgotPassword.tsx` — flat span, no tagline
- `src/pages/ResetPassword.tsx` — flat span, no tagline
- `src/pages/Auth.tsx` — flat span, no tagline
- `src/pages/Install.tsx` — flat span, no tagline
- `src/pages/Leaderboard.tsx` — flat h1, no tagline
- `src/pages/DeveloperDirectory.tsx` — flat h1, no tagline
- `src/pages/Reviews.tsx` — only icon, no R8ESTATE text at all
- `src/components/DashboardSidebar.tsx` — has portal label but different structure

**Category B — Already correct** (icon + stacked text + tagline):
- `src/pages/Index.tsx` (reference)
- `src/components/Footer.tsx`
- `src/components/MobileNav.tsx`
- `src/components/DashboardHeader.tsx`
- `src/components/BottomNav.tsx` (MobileNavSheet section)

**Special case:**
- `src/components/BottomNav.tsx` center brand button — icon-only in circle, keep as-is
- `src/components/ReviewsCarousel.tsx` footer — uses different logo assets, keep as-is
- `src/components/PWAInstallBanner.tsx` — small banner logo, keep icon-only
- `src/pages/Portfolio.tsx` — decorative watermark, keep as-is

## Plan

Standardize all **Category A** files to use the same pattern:

```text
[Logo Icon (negative margin)] + [Stacked: "R8ESTATE" bold + "Real Reviews · Real Estate" tagline]
```

Sizes will be context-appropriate (smaller in headers, larger on standalone pages) but the structure will be identical.

### Files to update (9 files):

1. **NotFound.tsx** — Replace flat span with stacked layout + tagline
2. **ForgotPassword.tsx** — Replace flat span with stacked layout + tagline
3. **ResetPassword.tsx** — Replace flat span with stacked layout + tagline
4. **Auth.tsx** — Replace flat span with stacked layout + tagline
5. **Install.tsx** — Replace flat span with stacked layout + tagline
6. **Leaderboard.tsx** — Replace flat h1 with stacked layout + tagline
7. **DeveloperDirectory.tsx** — Replace flat h1 with stacked layout + tagline
8. **Reviews.tsx** — Add R8ESTATE text + tagline next to existing icon
9. **DashboardSidebar.tsx** — Adjust to use consistent stacked layout (keeping portal label below)

### Consistent structure per context:

**Standalone pages** (Auth, ForgotPassword, ResetPassword, NotFound, Install):
```tsx
<img src={logoIcon} className="h-12 w-12 object-contain -mr-1.5" />
<div className="flex flex-col leading-none gap-0">
  <span className="inline-flex text-xl font-extrabold leading-none">
    <span className="text-brand-red">R8</span>
    <span className="text-primary">ESTATE</span>
  </span>
  <span className="text-[7px] text-muted-foreground tracking-wide whitespace-nowrap -mt-0.5">
    Real Reviews · Real Estate
  </span>
</div>
```

**Page headers** (Leaderboard, DeveloperDirectory, Reviews):
```tsx
<img src={logoIcon} className="h-10 w-10 object-contain -mr-1.5" />
<div className="flex flex-col leading-none gap-0">
  <span className="inline-flex text-lg font-extrabold leading-none">
    <span className="text-brand-red">R8</span>
    <span className="text-primary">ESTATE</span>
  </span>
  <span className="text-[7px] text-muted-foreground tracking-wide ...">
    Real Reviews · Real Estate
  </span>
</div>
```

