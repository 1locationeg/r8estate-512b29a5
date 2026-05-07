# Demo Showcase Page (`/demo`)

A public, no-login page to share with prospects, investors, and partners so they can preview the Buyer, Business, and Admin experiences end-to-end without signing up.

## Goals

- Anyone with the link can explore all 3 role dashboards
- Read-only: no writes, no real account, no data leakage
- Interactive UI (real components) + an optional guided tour overlay per role
- Single shareable URL: `https://meter.r8estate.com/demo`

## Page Structure

One route `/demo`, three tabs at the top: **Buyer** · **Business** · **Admin**.

```text
┌──────────────────────────────────────────────────┐
│  R8ESTATE — Live Demo (Read-only Preview)        │
│  [ Buyer ] [ Business ] [ Admin ]   [▶ Take Tour]│
├──────────────────────────────────────────────────┤
│  Sticky banner: "Demo mode — actions disabled.   │
│   Sign up free to use the real platform →"       │
├──────────────────────────────────────────────────┤
│                                                  │
│   <Selected role dashboard rendered here>        │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Per-Role Content

### 1. Buyer tab
- Buyer dashboard shell (sidebar + main panel) with mock:
  - Followed developers, saved projects, gamification tier, recent reviews
  - Trust Insights cards, notifications, journey corridor progress
- Quick links into preview-mode versions of: write a review, compare developers, contract check, deal watch

### 2. Business tab
- Business owner dashboard with mock:
  - Profile completeness, incoming reviews, reply box (disabled), trust score trend
  - Lead inbox, widget analytics, sub-business list
- Visible upgrade/pricing teaser (already in product) shown as static

### 3. Admin tab
- Admin dashboard with mock:
  - User counts, pending verifications queue, flagged content, platform KPIs
  - Moderation actions visible but disabled

## Guided Tour

- "▶ Take Tour" launches a step-by-step overlay (8–10 steps per role) highlighting key UI areas with tooltips: what it is, why it matters, who uses it.
- Tour state lives in component state only; dismissible; restartable per tab.
- Lightweight implementation — custom overlay (no new heavy dependency) using fixed-position spotlight + tooltip card. Reuses existing design tokens.

## Read-Only Safety

- Uses a dedicated `DemoModeProvider` context that:
  - Forces `isDemo = true` for everything rendered inside `/demo`
  - Wraps mutating actions (review submit, follow, reply, moderation) to show a toast: "Sign up free to do this →" instead of calling Supabase
- All data is hardcoded mock objects in `src/data/demoData.ts` — no live DB queries from this page, so no auth/RLS concerns and no risk of leaking real user data
- Tab switch is local state, no route change needed (URL hash optional: `/demo#buyer`)

## Entry Points

- Add a small "Live Demo" link in the footer
- Shareable directly: `meter.r8estate.com/demo`

## Out of Scope

- No real auth bypass, no impersonation of real accounts
- No analytics dashboards backed by real DB (everything is mock)
- No editing tour content via CMS — copy lives in code

## Technical Notes

- New route in `src/App.tsx`: `/demo` → `src/pages/Demo.tsx`
- New files:
  - `src/pages/Demo.tsx` — tabs + tour controller + sticky banner
  - `src/components/demo/DemoBuyerView.tsx`
  - `src/components/demo/DemoBusinessView.tsx`
  - `src/components/demo/DemoAdminView.tsx`
  - `src/components/demo/DemoTour.tsx` — overlay/spotlight component
  - `src/contexts/DemoModeContext.tsx` — `isDemo` flag + `blockAction()` helper
  - `src/data/demoData.ts` — mock buyer/business/admin payloads
- Reuse existing dashboard primitives (cards, sidebar, charts) but render with mock props instead of fetching
- Bilingual (EN/AR) via existing i18n; logical CSS properties only
- Mobile: tabs become a segmented control; tour tooltips reposition to bottom sheet
