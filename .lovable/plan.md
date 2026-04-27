## Goal

Give admins a single control panel at `/admin/truth-check` to fully manage the Truth-Check feature: turn it on/off across the site, control where it appears (homepage card, dedicated `/truth-check` page, navbar/CTAs, link from CompareModal), edit its copy and example claims, and tune throttling — without touching code.

## Where it appears today

- **Homepage** (`src/pages/Index.tsx` line 403) — `<TruthCheckHero />` rendered between ReviewerSpotlight and HeroNextSteps.
- **Dedicated page** at `/truth-check` (`src/pages/TruthCheck.tsx`, route in `src/App.tsx` line 221).
- **Edge function** `supabase/functions/truth-check` performs the verdict.

## Plan

### 1. New admin component: `src/components/AdminTruthCheck.tsx`

Single page with sections (mirrors `AdminWelcomeMessage.tsx` pattern using `platform_settings` upserts + sonner toasts):

**A. Master switch**
- Toggle: `truth_check_enabled` (default `true`). When `false`, the homepage card AND the `/truth-check` page hide / redirect.

**B. Placement controls** (each a Switch, all default `true`)
- `truth_check_show_on_homepage` — controls `<TruthCheckHero />` on Index.
- `truth_check_page_enabled` — controls the `/truth-check` route. When off, page redirects to `/` with a toast.
- `truth_check_show_compare_link` — shows/hides the "Truth-Check this claim" entry the user previously asked for in CompareModal (we'll wire it conditionally; if not present yet it just becomes a no-op flag for future use).

**C. Copy & content**
- `truth_check_page_title` (text)
- `truth_check_page_subtitle` (textarea)
- `truth_check_card_eyebrow` (text — the "R8 Truth-Check" pill on the homepage card)
- `truth_check_example_claims` (textarea, one example per line — feeds the chip suggestions like "Delivery in 2026, 100% on schedule"). Min 0, max 6 lines.
- "Reset to defaults" button per text field group.

**D. Behaviour & safety**
- `truth_check_throttle_seconds` (number, default 10) — used by the edge function's per-IP throttle.
- `truth_check_min_claim_chars` (number, default 8).
- `truth_check_require_auth` (switch, default `false`) — when on, the edge function rejects anonymous calls with a friendly "Sign in to use Truth-Check" message and the UI shows a sign-in CTA instead of the textarea for guests.

**E. Live preview panel**
- Read-only render of `<TruthCheckHero variant="compact" />` showing exactly what users see, reflecting current saved copy/examples.

### 2. New hook: `src/hooks/useTruthCheckSettings.ts`

- Fetches all `truth_check_*` keys in one query, returns typed object with sensible defaults if a row is missing.
- Exposes `{ settings, loading }`.
- Used by: `Index.tsx` (to gate `<TruthCheckHero />`), `TruthCheck.tsx` page (gate + copy), `TruthCheckHero.tsx` (example chips, eyebrow text, auth gate).

### 3. Wire conditional rendering

- `src/pages/Index.tsx` — wrap `<TruthCheckHero />` in `settings.enabled && settings.showOnHomepage`.
- `src/pages/TruthCheck.tsx` — if `!settings.enabled || !settings.pageEnabled` → `<Navigate to="/" />` + toast.
- `src/components/TruthCheckHero.tsx` — read `eyebrow`, `exampleClaims`, `requireAuth` from settings; replace the hard-coded title/subtitle/example chips. Hide the textarea behind a sign-in CTA when `requireAuth && !user`.

### 4. Edge function update: `supabase/functions/truth-check/index.ts`

- On invocation, fetch the four behaviour keys via service role: `truth_check_enabled`, `truth_check_throttle_seconds`, `truth_check_min_claim_chars`, `truth_check_require_auth`.
- If `enabled === false` → return `503` with `{ error: "Truth-Check is temporarily disabled by the admin." }`.
- Use the dynamic throttle window and min-claim-chars instead of hard-coded `10_000` / `8`.
- If `require_auth` and the request has no valid `Authorization` Bearer (validate via `supabase.auth.getUser`) → return `401`.

### 5. Register in admin shell

- Add nav item under the "Settings" group in `src/pages/AdminDashboard.tsx`:
  `{ icon: <ScanSearch className="w-4 h-4" />, label: 'Truth-Check', path: '/admin/truth-check' }`
- Add route: `<Route path="truth-check" element={<AdminTruthCheck />} />`.
- Add import: `import AdminTruthCheck from '@/components/AdminTruthCheck';`

### 6. Memory

Update `mem/features/truth-check.md` to document the admin control surface, the `truth_check_*` settings keys, and how to disable the feature without redeploying.

## Technical details

- Storage: `platform_settings` table, `(key text PK, value text)` — already used by Welcome Message, Guest Timer, Registration Slots. Booleans stored as `"true"`/`"false"` strings (matches existing rows).
- Defaults are coded in the hook so the feature works the same as today even if no `platform_settings` rows exist.
- Realtime not required — admin save followed by client refetch on next page load is enough; we'll also fire a `localStorage` event so an open tab picks up changes after save.
- Auth gating in the edge function uses `createClient` with the user's JWT to call `auth.getUser()`; service-role client is still used for data reads.
- No DB migration required — `platform_settings` already exists with the right shape and RLS.

## Files touched

- **New**: `src/components/AdminTruthCheck.tsx`, `src/hooks/useTruthCheckSettings.ts`
- **Edited**: `src/pages/AdminDashboard.tsx`, `src/pages/Index.tsx`, `src/pages/TruthCheck.tsx`, `src/components/TruthCheckHero.tsx`, `supabase/functions/truth-check/index.ts`, `mem/features/truth-check.md`

Approve and I'll build this end-to-end.