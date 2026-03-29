

## Fix "Lost User" Problem — Consistent Navigation Across All Pages

### Problem

Users feel lost because pages have inconsistent navigation patterns — some have only a logo, some have only a back arrow, some have neither a clear page title nor a way home. There's no unified header telling the user "where am I" and "how do I go back."

### Solution

Create a **reusable `PageHeader` component** used by all standalone pages (not dashboard pages, which already have `DashboardHeader`). Every page gets:

1. **Home icon** (left) — always navigates to `/`
2. **Back arrow** — navigates to previous page (`navigate(-1)`)
3. **Page title** — clear, bold label showing where the user is
4. **Optional breadcrumb** — e.g., "Home > Community > Post"
5. **Right slot** — for page-specific actions (write review button, language switcher, etc.)

```text
┌──────────────────────────────────────────────────┐
│  🏠  ←  Reviews                        [+ Write] │
│       Home > Reviews                              │
└──────────────────────────────────────────────────┘
```

### Files

**1. New: `src/components/PageHeader.tsx`**
- Sticky header with `backdrop-blur`, matching the existing `DashboardHeader` style
- Props: `title`, `breadcrumbs?: {label, path?}[]`, `rightSlot?: ReactNode`, `showBack?: boolean`
- Home icon button → `navigate("/")`
- Back arrow button → `navigate(-1)` (shown by default, hideable)
- Breadcrumb trail: Home > Parent > **Current** (last segment bold)
- Bilingual: RTL flips arrows, uses i18n for "Home"

**2. Edit: `src/pages/Reviews.tsx`**
- Replace custom header with `<PageHeader title="Reviews" rightSlot={writeButton} />`

**3. Edit: `src/pages/Portfolio.tsx`**
- Replace custom header with `<PageHeader title="My Portfolio" />` + keep avatar/tabs below

**4. Edit: `src/pages/Community.tsx`**
- Add `<PageHeader title="Community" />` above the composer card

**5. Edit: `src/pages/DealWatch.tsx`**
- Replace BrandLogo-only header with `<PageHeader title="Deal Watch" />`

**6. Edit: `src/pages/LaunchWatch.tsx`**
- Replace BrandLogo-only header with `<PageHeader title="Launch Watch" rightSlot={liveBadge} />`

**7. Edit: `src/pages/InsightsPage.tsx`**
- Replace custom back-arrow header with `<PageHeader title="AI Insights" rightSlot={refreshButton} />`

**8. Edit: `src/pages/Leaderboard.tsx`**
- Replace custom header with `<PageHeader title="Leaderboard" />`

**9. Edit: `src/pages/Categories.tsx`**
- Replace custom header with `<PageHeader title="Categories" />`

**10. Edit: `src/pages/DeveloperDirectory.tsx`**
- Replace custom header with `<PageHeader title="Developer Directory" />`

**11. Edit: `src/pages/EntityPage.tsx`**
- Replace custom back-only header with `<PageHeader title={entityName} breadcrumbs={[{label: 'Directory'}]} />`

**12. Edit: `src/i18n/locales/en.json` + `ar.json`**
- Add `pageHeader.home`, `pageHeader.back` translations

### Design Decisions
- Consistent 54px height matching `DashboardHeader`
- Home icon is always the house icon (not the brand logo) for clarity — BrandLogo stays in Index/Navbar only
- On mobile, the header works with the existing `BottomNav` — no conflict
- Back button uses `navigate(-1)` so it respects actual browser history, not hardcoded routes

