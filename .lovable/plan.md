

# Embeddable Trust Widget System — Implementation Plan

## Overview
Build 5 embeddable widget types that pull live data from the database, a public iframe-safe route, and an admin panel to create/manage/copy embed codes.

## Important Data Reality
The current `reviews` table has only a single `rating` integer (1-5) — there are **no sub-rating columns** (Delivery, Build Quality, etc.). The sub-scores shown on the homepage are hardcoded in `HeroTrustShowcase.tsx`. The `launch_ratings` table does have sub-scores but only for launches.

This means widgets will use the aggregate `rating` average as the R8 Score. Sub-KPIs (Delivery, Quality, Communication, Transparency) cannot be populated from real data unless we add sub-rating columns to the `reviews` table. The plan below will use the single overall score and display it prominently, with sub-KPI rows shown only when data exists.

## Step 1 — Database Schema
Create migration for `widget_configs` table:

```text
widget_configs
├── id (uuid, PK)
├── type (text) — 'micro_badge' | 'entity_profile' | 'project_journey' | 'comparison_strip' | 'review_us'
├── entity_type (text) — 'developer' | 'project' | 'agent' | 'agency'
├── entity_id (text) — matches business_profiles.id or mock developer IDs
├── settings (jsonb) — { theme, language, show_verified, cta_url, max_reviews }
├── is_active (boolean, default true)
├── embed_token (text, unique, not null)
├── created_by (uuid, references auth.users)
├── created_at (timestamptz, default now())
└── updated_at (timestamptz, default now())
```

RLS:
- Admins: full CRUD via `has_role(auth.uid(), 'admin')`
- Anon/public: SELECT only where `is_active = true`

Database function `generate_embed_token()` returns a 12-char alphanumeric string using `substr(md5(random()::text || now()::text), 1, 12)`.

## Step 2 — Five Widget Components
Create `src/components/widgets/` directory with:

1. **MicroBadge.tsx** — 320×80px pill. R8 logo, score, stars, review count, "Verified by R8ESTATE" label.
2. **EntityProfileWidget.tsx** — 400px card. Entity name, type badge, large score ring, up to 4 KPI rows (when available), 2 review snippets, CTA button.
3. **ProjectJourneyWidget.tsx** — 420px timeline card. 3-stage horizontal timeline (Sales → Construction → Handover) with sentiment icons, overall score.
4. **ComparisonStrip.tsx** — 560×100px horizontal bar. Entity vs market average score bars.
5. **ReviewUsWidget.tsx** — 320px CTA box. Star selector, "Write a Review" button, R8ESTATE branding.

All styled with the existing dark glassmorphism aesthetic (#0a3d62 navy, #fac417 gold, green verified signals). Props-driven, initially with mock data.

## Step 3 — Live Data Hook
Create `src/hooks/useWidgetData.ts`:
- Fetch `widget_configs` by `embed_token` (anon client, no auth)
- Based on `entity_id`, query `reviews` table for: avg rating, count, latest 2 approved review snippets
- Query `business_profiles` for entity name and metadata
- For ProjectJourney: approximate stages from review dates (oldest third = Sales, middle = Construction, recent = Handover)
- Returns: `{ config, entityName, score, reviewCount, recentReviews, isLoading, error }`

## Step 4 — Public Embed Route
Add `/embed/widget/:token` route in `App.tsx`:
- Renders outside the main layout (no navbar, footer, bottom nav, FAB)
- Calls `useWidgetData(token)` and renders the matching widget component
- Transparent/white background, iframe-safe
- Loading skeleton and error fallback states

## Step 5 — Admin Panel
Add `/admin/widgets` route to `AdminDashboard.tsx`:

**Widget List Table** — type, entity name, status toggle, created date, actions (preview modal, copy embed code, edit, deactivate)

**Create Widget Drawer** — form with: widget type dropdown, entity type, entity search (from `business_profiles`), theme toggle (dark/light), language, show verified badge, CTA URL, max reviews. On save: insert into `widget_configs` with auto-generated token.

**Embed Code Display** — iframe HTML snippet in code block with copy button, live preview below.

Add sidebar nav item under "Content" group: `{ icon: <Code />, label: 'Widgets', path: '/admin/widgets' }`

## Files Created/Modified
- **New**: `src/components/widgets/MicroBadge.tsx`
- **New**: `src/components/widgets/EntityProfileWidget.tsx`
- **New**: `src/components/widgets/ProjectJourneyWidget.tsx`
- **New**: `src/components/widgets/ComparisonStrip.tsx`
- **New**: `src/components/widgets/ReviewUsWidget.tsx`
- **New**: `src/hooks/useWidgetData.ts`
- **New**: `src/components/AdminWidgets.tsx`
- **New**: `src/pages/EmbedWidget.tsx`
- **Modified**: `src/App.tsx` — add embed route outside main layout
- **Modified**: `src/pages/AdminDashboard.tsx` — add widgets route + sidebar nav
- **New migration**: `widget_configs` table + `generate_embed_token()` function

## Execution Order
1. Database migration (table + function + RLS)
2. Five widget components with mock data
3. `useWidgetData` hook wired to live Supabase data
4. `/embed/widget/:token` public route
5. `/admin/widgets` control panel

Each step builds on the previous. Estimated 5 implementation messages.

