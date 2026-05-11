---
name: trust-page-theme
description: Emerald Velvet single-hue luxury theme scoped to Trust Page (/pro/:slug) and Pro Dashboard/Settings via .emerald-mode class
type: design
---
The Trust Page (`/pro/:slug`), `ProfessionalDashboard`, and `ProfessionalSettings` use a dedicated luxury theme — NOT the global navy/gold/red palette.

**Mechanism**: a single `.emerald-mode` class wraps the outer page div. It remaps the design tokens (in `src/index.css`) so every existing reference to `--primary`, `--professionals`, `--accent`, `--coin`, `--brand-red`, `--buyers`, `--verified`, `--card`, `--background`, `--border`, `--muted`, `--ring`, sidebar tokens collapse into a single emerald hue. Champagne (`--accent`, `--champagne`) is reserved ONLY for star ratings and verified ticks.

**Palette** (HSL):
- Emerald Deep `158 64% 18%` — primary, headings, key icons
- Emerald Mid `158 52% 28%` — ring/hover
- Emerald Soft `158 35% 94%` — secondary surfaces, chips
- Ivory `40 30% 98%` — page bg
- Stone Border `40 12% 88%`
- Charcoal Ink `160 12% 14%` — body
- Muted Ink `160 8% 42%`
- Champagne `40 35% 70%` — stars + verified ONLY

**Finish**: matte velvet — solid `bg-card` + 1px stone border + soft long shadow `var(--velvet-shadow)`. No frosted blur, no multi-stop gradients on chrome. The only allowed gradient is a barely-there radial glow behind the avatar/trust ring.

**Rule**: do NOT reintroduce navy/gold/red literal colors on these three pages. Adding new sections? Use semantic tokens (`text-primary`, `bg-card`, `border-border`) and they'll auto-inherit emerald. To opt a new page into this theme, add `className="emerald-mode"` to its outer wrapper.