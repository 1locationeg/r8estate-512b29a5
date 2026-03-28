

## Dynamic Business Upsell Teaser — Extended to Buyers + Admin Controls

### What We're Building

1. **`DeveloperInsightsUpsell` component** — as previously planned (blurred SVG charts, 3 icon bullets, bilingual headline/CTA)
2. **Show it on Buyer Dashboard** — render the upsell at the bottom of `BuyerOverview` to encourage buyers to unlock business insights
3. **Admin Upsell Management** — a new `AdminUpsell` section at `/admin/upsell` where admins can toggle the upsell on/off, edit headline/subtext/CTA per language, and preview changes — all stored in `platform_settings`

### Files & Changes

#### 1. Database Migration — Seed `platform_settings` keys for upsell
Insert 3 rows into `platform_settings`:
- `upsell_enabled` → `"true"`
- `upsell_content_en` → JSON with `headline`, `subtext`, `bullet1-3`, `cta`
- `upsell_content_ar` → same structure in Arabic

These are data inserts using the insert tool (not schema changes).

#### 2. New Component: `src/components/DeveloperInsightsUpsell.tsx`
- Fetches `platform_settings` keys `upsell_enabled` and `upsell_content_{lang}` on mount
- If `upsell_enabled !== "true"`, renders nothing
- Falls back to hardcoded i18n strings if no DB content found
- Blurred SVG background with fake 24-month trend lines
- Three icon rows: `AlertTriangle`, `TrendingUp`, `Shield` with bullet text
- Headline + subtext + CTA button
- RTL/LTR auto-switch via `useTranslation()` direction
- CTA opens `BusinessUpgradeModal` (authenticated) or navigates to `/auth`

#### 3. `src/i18n/locales/en.json` — Add `upsell` namespace (fallback strings)
```json
"upsell": {
  "headline": "Want to see the full picture?",
  "subtext": "Don't settle for surface-level reviews...",
  "bullet1": "Deep-dive into complaint trends and patterns.",
  "bullet2": "Predictive risk indicators (Delivery & Quality).",
  "bullet3": "Benchmarking against top-tier local competitors.",
  "cta": "Unlock Business Insights"
}
```

#### 4. `src/i18n/locales/ar.json` — Arabic `upsell` namespace

#### 5. Integration Points — Render `<DeveloperInsightsUpsell />`
- **`src/components/DeveloperDetailModal.tsx`** — bottom of modal
- **`src/components/DeveloperDetailCard.tsx`** — bottom of card
- **`src/pages/BuyerDashboard.tsx`** (`BuyerOverview`) — after the stats/activity section, before the "Upgrade to Business" CTA

#### 6. New Component: `src/components/AdminUpsell.tsx`
Admin panel at `/admin/upsell` with:
- **Toggle switch**: Enable/Disable upsell globally (updates `upsell_enabled`)
- **EN tab / AR tab**: Editable fields for headline, subtext, 3 bullets, CTA text
- **Save button**: Writes updated JSON to `upsell_content_en` / `upsell_content_ar` in `platform_settings`
- **Live preview**: Mini preview card showing current upsell appearance

#### 7. `src/pages/AdminDashboard.tsx` — Add Upsell route
- Import `AdminUpsell`
- Add nav item under "Content" group: `{ icon: <TrendingUp />, label: 'Upsell Teaser', path: '/admin/upsell' }`
- Add route: `<Route path="upsell" element={<AdminUpsell />} />`

### Technical Details
- Uses existing `platform_settings` table pattern (same as Spotlight, WhatsApp, SEO)
- No schema migration needed — only data inserts for initial seed values
- Component gracefully degrades to i18n fallback if DB settings not found
- Admin can fully control visibility and copy without code changes

