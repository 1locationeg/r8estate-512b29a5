## Goal

When a professional shares their `/pro/:slug` link on WhatsApp / LinkedIn / Facebook, the link preview should show:
- **Image**: their cover photo (not the generic R8ESTATE banner)
- **Text**: "R8ESTATE professional trust page — showcasing real client reviews, expertise, achievements, certifications, and trusted off-plan real estate experience."

Plus an admin control to override the preview (image + rich text) per professional URL — useful for marketing campaigns and offers.

---

## Why a new edge function is needed

Social crawlers (WhatsApp, LinkedIn, Facebook, Slack) do **not** execute JavaScript, so they only ever read the static `index.html`. React-helmet/per-route meta tags are invisible to them. The existing `og-community` function already solves this for community posts using a meta-refresh redirect pattern — we'll mirror it for professionals.

---

## Plan

### 1. Database — admin overrides table

New migration creating `og_overrides`:
- `id`, `slug` (unique, the `/pro/:slug` value), `image_url` (nullable), `body_html` (nullable, rich text), `title` (nullable), `description` (nullable), `enabled` (bool), timestamps
- RLS: public SELECT (so the edge function can read with anon key), INSERT/UPDATE/DELETE restricted to admins via `has_role(auth.uid(), 'admin')`
- A small storage bucket `og-professional-assets` (public) for admin-uploaded marketing images

### 2. Edge function — `og-professional`

`supabase/functions/og-professional/index.ts` (modeled on `og-community`):
- Accepts `?slug=mohamed-mahmoud`
- Looks up `og_overrides` first → if `enabled`, use its image/title/description/body
- Otherwise calls `get_professional_by_slug` and uses `cover_url` + the standard tagline
- Returns HTML with `og:title`, `og:description`, `og:image`, `twitter:card`, and a `<meta http-equiv="refresh">` redirect to `https://meter.r8estate.com/pro/:slug`
- Falls back to default OG image if no cover

### 3. Share link wiring

In `ProfessionalProfile.tsx`, the existing share/copy-link button copies the **edge-function URL** (`https://mcekdnvxeblikixmfyni.supabase.co/functions/v1/og-professional?slug=...`) instead of the raw `/pro/:slug` URL. Crawlers see rich preview, humans get redirected to the SPA.

Optional convenience: add a friendlier alias `meter.r8estate.com/s/pro/:slug` later — out of scope for this pass.

### 4. Admin dashboard control

Add a new section in `AdminDashboard.tsx` called **"Trust Page Share Previews"**:
- Table listing all professionals (slug + name) with current override status
- "Edit preview" opens a modal with:
  - Slug field (auto-filled, read-only)
  - Image picker: upload to `og-professional-assets` OR paste URL OR "Use cover photo" (clears override → falls back to cover)
  - Title input (optional override)
  - Description input (optional override; default is the new tagline)
  - **TipTap rich-text editor** for `body_html` (used as the long-form description for crawlers that render it; we'll also strip-to-plaintext for `og:description` if title/description are empty)
  - Enable toggle + Save / Reset buttons
- Live preview card showing how the share will look (mimics WhatsApp/LinkedIn card)

### 5. Default tagline rollout

Replace the hard-coded community-style description in the new function with the requested copy:
> "R8ESTATE professional trust page — showcasing real client reviews, expertise, achievements, certifications, and trusted off-plan real estate experience."

---

## Files touched

**New**
- `supabase/migrations/<timestamp>_og_overrides.sql`
- `supabase/functions/og-professional/index.ts`
- `src/components/admin/SharePreviewManager.tsx` (admin UI + TipTap editor + live preview)

**Edited**
- `src/pages/ProfessionalProfile.tsx` — share/copy-link uses edge-function URL
- `src/pages/AdminDashboard.tsx` — mount the new manager as a tab/section

---

## Caveats to flag

- WhatsApp aggressively caches previews. Existing shared links won't refresh until WhatsApp re-fetches (usually after ~7 days, or via a query param tweak).
- The edge-function URL is what gets shared. Humans clicking it are redirected to `/pro/:slug` instantly via `meta refresh` — the URL bar briefly shows the function host. If you want the URL bar to always show `meter.r8estate.com`, that requires a custom-domain rewrite which Lovable's static hosting doesn't support today.
