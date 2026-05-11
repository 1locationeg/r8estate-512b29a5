## Goal
Redesign the public Trust Page at `/pro/:slug` (`src/pages/ProfessionalProfile.tsx`) so a buyer instantly *feels* they've found an expert: trust score, stars, and benefits hit first; storytelling stays but as visual moments, not paragraphs. Align with R8ESTATE branding (Navy / Gold / Red) + Professionals teal accent + a subtle AI-vibe layer.

## Design direction

Visual principles
- Lead with numbers + icons: stars, trust score, deals — visible above the fold without scroll on desktop and at top of mobile.
- Replace dense paragraphs with chips, tiles, sparklines, ribbons.
- Storytelling stays — but as visual "moments" (emotional one-liners, big quote cards, before/after style stats).
- Branding: Navy primary surface, Professionals teal accent, Gold for trophy / hero metric, Red only for risk/missing.
- AI vibe: animated gradient mesh in hero, soft glow orb behind avatar, pulse on Trust Score ring, shimmer on "Verified Pro" badge.

## New layout (top → bottom)

```text
┌───────────────────────────────────────────────────────────┐
│ HERO  (Navy→Teal gradient + AI mesh + glow orb)           │
│  ┌────────┐  Name · 👑 Elite · ✓ Verified Pro             │
│  │ Avatar │  Headline (one short line)                     │
│  │  ring  │  ⭐4.9 (87) · TrustRing 94 · 142 deals · 9y    │
│  └────────┘  [Contact] [Message]  ·  ♡ 🔗 ↗               │
│  ribbon: "TOP 1% in New Cairo · 2024"  (gold)             │
├───────────────────────────────────────────────────────────┤
│ TRUST AT A GLANCE  (4 visual tiles, no paragraphs)        │
│  ⭐ 4.9     🛡 94      🤝 142     ⏱ <2h                   │
│  Reviews   Trust      Deals      Replies                  │
│  sparkline sparkline  sparkline  pulse dot                │
├───────────────────────────────────────────────────────────┤
│ WHY BUYERS PICK AHMED  (6 icon benefit tiles)             │
│  🛡 Delivery-first   💰 Plan structuring   🎯 No pressure │
│  🏛 Top developers   🌍 GCC investors      📞 Always on   │
│  (icon + 2-word title; long copy in tooltip on hover)     │
├───────────────────────────────────────────────────────────┤
│ EMOTIONAL QUOTE STRIP (full-width gold card)              │
│  "Saved us from a 4.2M EGP mistake." — Mona K.            │
│  (rotates 3 quotes, no extra body copy)                    │
├───────────────────┬───────────────────────────────────────┤
│ STORY (left)      │ RIGHT RAIL                            │
│  • About: 1 line  │  Trust Score donut + 3 signal chips   │
│    + chip cloud   │  Quick Contact (sticky)               │
│  • Experience:    │  Languages · Coverage map pin         │
│    visual time-   │  Refer a friend (gold mini)           │
│    line, 1-line   │  AI Insight card (teal, animated)     │
│    bullets        │   "Replies 3× faster than peers"      │
│  • Reviews:       │                                        │
│    big rating     │                                        │
│    block + cards  │                                        │
│  • Skills/Cert/   │                                        │
│    Edu/FAQ as     │                                        │
│    compact accord │                                        │
└───────────────────┴───────────────────────────────────────┘
```

### Sections in detail

1. Hero (visual, branded, AI vibe)
   - Background: `linear-gradient(135deg, hsl(var(--navy)), hsl(var(--professionals)))` + radial AI mesh + 1 floating glow orb behind avatar (already-supported CSS, no new deps).
   - Avatar: square-rounded with animated teal ring, gold tier badge floating on the corner.
   - Identity row: name + 👑 tier chip + ✓ Verified Pro shimmer badge.
   - Headline: shortened to one emotional line.
   - Inline metric strip: ⭐ rating · TrustRing 94 · deals · years (icon + number, no labels).
   - CTAs: primary "Contact" (teal), secondary "Message". Save / Share / Refer become icon-only buttons.
   - Gold ribbon under hero ("TOP 1% in New Cairo · 2024") if applicable.

2. Trust at a Glance strip (new, replaces old "stat row")
   - 4 frosted tiles (Navy on white card): big number + icon + 1-word label + mini sparkline / pulse dot.

3. Why Buyers Pick {Name} (new, replaces long About paragraph as the hook)
   - 6 icon tiles (icon + 2-word benefit). Long descriptions in tooltips.
   - Derived from `pro.specialties` + a small benefit map; no schema changes.

4. Emotional quote strip (new)
   - Gold-tinted full-width card. Single rotating verified-buyer quote (sourced from existing `pro.reviews`). One line. No body text.

5. About / Experience (compressed)
   - About: one short emotional sentence (first sentence of `pro.bio`) + chip cloud of specialties. Full bio behind "Read more".
   - Experience: vertical timeline kept but each role = role + company chip + max 2 one-line highlights (rest hidden behind "+N more").

6. Reviews
   - Keep the big rating block (4.9, stars, breakdown bars) — this *is* visual.
   - Review cards: tighten copy density, show first 2 reviews then "Show all".

7. Skills / Portfolio / Certificates / Education / FAQ
   - Convert to compact accordions with icon + count badge in the trigger.

8. Right rail (sticky on desktop)
   - Trust Score donut (animated, pulse) + 3 signal chips (Verified Pro, Top responder, Repeat clients).
   - Sticky Quick Contact card (Contact + Message buttons).
   - Languages + coverage as icon chips.
   - Refer-a-friend gold mini card.
   - **AI Insight card (new, AI vibe)**: teal gradient, animated sparkles, one rotating data line ("Replies 3× faster than peers in New Cairo").

### Color tokens (existing only)
- `hsl(var(--navy))` hero base
- `hsl(var(--professionals))` accent, ring, primary CTA, AI card
- `hsl(var(--gold))` ribbon, tier badge, refer card, emotional quote strip
- `hsl(var(--red))` only used if a missing/at-risk signal appears
- Verified token kept for the shimmer badge

### Motion
- Pulse on Trust Score ring
- Shimmer on Verified Pro badge
- Gradient drift on hero AI mesh
- Sparkle motion on AI Insight card
- All using existing `animate-pulse` / keyframes in `index.css`; no new deps.

## Technical notes

- File: rewrite `src/pages/ProfessionalProfile.tsx` only.
- Reuse: `TrustGaugeMini`, `Stars` (already in file), `Avatar`, `Badge`, `Button`, `Tooltip`.
- Add small inline SVG components inside the file: `TrustRing`, `Sparkline` (no chart lib).
- Tooltips for benefit tiles via `@/components/ui/tooltip`.
- Mobile safety: 390px viewport, logical props (`ms-/pe-/text-start`), 44px touch targets.
- No DB changes, no new routes, no auth changes, no edits to mock data shape — derive benefits/quotes from existing fields (`specialties`, `reviews`, `tier`, `responseTime`, `dealsClosed`).

## Out of scope
- Backend, auth, schema, mock data shape changes.
- Changes to dashboards or other pages.
- New routes or new dependencies.
