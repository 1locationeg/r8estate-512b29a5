---
name: ui-polish-primitives
description: Shared HomeSection + SectionHeader primitives and global utilities (.eyebrow, .card-hover, page-bg) introduced to align with reference design polish
type: design
---
The polish pass (inspired by reference project bd194ed0) introduced reusable primitives and utilities to enforce a calm, consistent rhythm across the homepage and other inner pages.

**Primitives (src/components/):**
- `HomeSection.tsx` — wraps every homepage section in a consistent shell (`py-10 md:py-14`, `container max-w-6xl px-4`). Props: `id`, `compact`, `bleed`.
- `SectionHeader.tsx` — standard left-aligned title + subtitle + optional "View all →" link on the trailing edge. Supports `eyebrow` (ALL-CAPS), `centered`, RTL-safe (`rtl:rotate-180` on arrow).

**Global CSS utilities (src/index.css @layer components):**
- `.eyebrow` — tiny ALL-CAPS label, `tracking-[0.2em]`, used above section titles or in pill badges.
- `.card-hover` — standardized lift physics: `-translate-y-0.5 + shadow-md + border-primary/40`. Apply to all interactive cards (audience, developer, review, category, pricing).
- `.heading-hero` upgraded to include `lg:text-6xl leading-[1.05]` for desktop presence.
- Body now sits on `hsl(var(--page-bg))` (soft cream) instead of pure white so cards on `bg-card` pop subtly.

**Navbar:**
- Outer `<header>` is now `sticky top-0 z-40 backdrop-blur bg-background/85` with `border-border/60` — translucent floating shell matching the reference.

**Why:** Avoid ad-hoc per-section spacing/headers. New homepage sections SHOULD use `<HomeSection>` + `<SectionHeader>` instead of custom `<section>` markup.
