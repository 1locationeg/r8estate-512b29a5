## Goal

Move the **Trust Page** (`/pro/:slug`) and **Professional Dashboard** (`/pro-dashboard`, `/pro-settings`) away from the current rainbow palette (amber + navy + gold + red + teal + green) to a single, calm, high‑end **Emerald Jewel** identity with a **matte velvet** finish. Keep the rest of the platform (homepage, buyer flows, dev pages) untouched.

## Visual direction — "Emerald Velvet"

One dominant deep-emerald hue, neutral ivory/stone surfaces, no competing accents.

```
Emerald Deep      hsl(158 64% 18%)   ← primary, headings, key icons
Emerald Mid       hsl(158 52% 28%)   ← hover, rings
Emerald Soft      hsl(158 35% 92%)   ← secondary surfaces, chips
Ivory             hsl(40 30% 98%)    ← page bg (warm, not white)
Stone Border      hsl(40 12% 88%)    ← borders, dividers
Charcoal Ink      hsl(160 12% 14%)   ← body text
Muted Ink         hsl(160 8% 42%)    ← secondary text
Champagne Hint    hsl(40 35% 70%)    ← used ONLY for star ratings + verified tick
```

No multi-stop gradients on chrome. Only allowed gradient: a barely-there radial glow `from emerald/8 → transparent` behind the avatar / trust ring. Cards use **matte velvet** = solid `bg-card` + `border border-stone` + `shadow-[0_1px_2px_rgba(20,40,30,0.04),0_8px_24px_-12px_rgba(20,60,40,0.12)]`. No frosted blur on these two surfaces.

## Scope

In:
- `src/pages/ProfessionalProfile.tsx` (Trust Page)
- `src/pages/ProfessionalDashboard.tsx`
- `src/pages/ProfessionalSettings.tsx`
- `src/components/professional-edit/*` (cover editor, custom sections, editable field, cropper safe-area lines)
- `src/index.css` — add a new `.emerald-mode` class that remaps tokens (mirrors how `.business-mode` / `.services-mode` / `.professionals-mode` already work)

Out of scope:
- Homepage, buyer dashboard, dev directory, community, copilot — they keep current theme.
- No DB / business-logic changes.

## Implementation steps

1. **Add `.emerald-mode` token block in `src/index.css`** (next to `.professionals-mode`):
   - Remap `--primary`, `--primary-foreground`, `--accent`, `--secondary`, `--ring`, `--verified`, `--border`, `--muted`, `--muted-foreground`, `--card`, `--background`, `--page-bg` to the emerald + ivory + stone scale above.
   - Add three velvet-specific vars: `--velvet-shadow`, `--velvet-glow`, `--champagne` (for stars only).

2. **Wrap the three pages in the mode** by adding `className="emerald-mode"` on the outer `<div>` of:
   - `ProfessionalProfile.tsx`
   - `ProfessionalDashboard.tsx`
   - `ProfessionalSettings.tsx`
   This automatically retones every `bg-primary`, `text-primary`, `border-border`, `bg-accent`, etc. without touching component files.

3. **Purge hard-coded color references** inside the three pages and `professional-edit/` components:
   - Replace any `text-[hsl(var(--professionals))]`, `bg-amber-*`, `text-gold-*`, `from-navy-*`, `bg-gradient-to-*` chrome with semantic tokens (`text-primary`, `bg-secondary`, `border-border`).
   - Trust ring + sparkline: switch stroke from `--professionals` to `--primary`; keep the soft glow as `--primary / 0.18` blur.
   - Stars stay champagne (`text-[hsl(var(--champagne))] fill-[hsl(var(--champagne))]`) — the only non-emerald accent allowed.
   - Remove the colored "journey station" tints inherited from `StationPageWrapper` on these routes (skip wrapping or pass a neutral override).

4. **Velvet card utility** in `index.css`:
   ```css
   .card-velvet {
     @apply bg-card border border-border rounded-xl;
     box-shadow: var(--velvet-shadow);
   }
   ```
   Replace the ad‑hoc card classes on Trust Page sections (About, Experience, Skills, Portfolio, Certificates, FAQ, Custom sections) with `card-velvet`.

5. **Cover & avatar polish**:
   - Cover overlay: replace current dark gradient with a single `bg-gradient-to-t from-[hsl(160_30%_8%/0.55)] to-transparent` for legible identity text.
   - Avatar ring: 3px solid emerald with a 1px inner ivory hairline (matte jewel-cut feel) instead of the current colored glow.
   - Cropper safe-area dashed lines: emerald `--primary / 0.4`.

6. **Buttons / chips on these pages**:
   - Primary CTA: solid emerald, white text, no gradient, subtle 1px inner highlight via `box-shadow: inset 0 1px 0 hsl(0 0% 100% / 0.12)`.
   - Secondary: ivory bg, emerald border + text.
   - Badges (verified, top-rated): emerald-soft bg + emerald-deep text, except the verified tick which uses champagne.

7. **Dashboard sidebar tone**: on `/pro-dashboard` and `/pro-settings`, override sidebar tokens inside `.emerald-mode` so the existing navy sidebar becomes deep-emerald with ivory text — keeps structural parity with other dashboards.

8. **Save a memory** `mem://design/trust-page-theme` capturing the Emerald Velvet palette + the `.emerald-mode` scoping rule so future edits don't reintroduce the old multi-color tokens on these pages.

## Acceptance check

- Loading `/pro/ahmed-hassan`, `/pro-dashboard`, `/pro-settings` shows a single emerald hue across all chrome — no amber, no navy, no gold gradients, no teal.
- Stars + verified tick are the only champagne touches.
- Cards feel matte (solid surface, soft long shadow, no glassy blur).
- Homepage and other routes are visually unchanged.
- Light/dark contrast: body text ≥ AA on ivory; primary CTA ≥ AA on emerald.
