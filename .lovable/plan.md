## Goal
Make `/pro-dashboard` feel like a visual, motivating cockpit for an individual professional — not a wall of text. Reduce copy, lead with icons + numbers + progress, align with R8ESTATE branding (Navy / Gold / Red) plus the Professionals accent (teal), and add a subtle AI-vibe layer (glow, soft gradient mesh, animated pulse).

## Design direction

Visual language
- Hero: compact gradient banner (Navy → Professionals teal) with a soft animated AI mesh + glow orb. Just an avatar, name, tier chip, Trust Score ring, and 2 CTAs. No paragraph copy.
- Cards: frosted glass (`backdrop-blur`, white/8 border), gold accent on highlights, teal for professional accent.
- Iconography over sentences: each tile = icon + 1–3 word label + number. Tooltips hold the long explanation.
- Subtle motion: pulse on Trust Score ring, shimmer on incomplete steps, animated gradient on "Boost" CTA.

Color tokens (existing only)
- Primary surface: `--professionals` (teal accent)
- Highlight: `--gold` for rewards / boosts
- Alert / urgency: `--red` for missing critical steps
- Background gradient mesh uses `--navy` + `--professionals` at low alpha

## New layout (top → bottom)

```text
┌───────────────────────────────────────────────────────────┐
│  HERO  avatar │ name + tier chip │ Trust Ring 78 │ [View] │
│        (gradient + AI mesh, ~140px tall, no paragraph)    │
├───────────────────────────────────────────────────────────┤
│  4 STAT TILES   icon · big number · sparkline · delta     │
│  (views, shares, endorsements, hires)                     │
├───────────────────────────────────────────────────────────┤
│  TRUST PAGE BOOSTER (full width, gold glow)               │
│   Ring 56% · "Reach Elite" · 3 next-step chips            │
│   [Verify phone +10] [Get 5 endorsements +15] [Post +10]  │
├───────────────────┬───────────────────────────────────────┤
│ BENEFITS GRID     │ RIGHT RAIL                            │
│ 6 icon tiles,     │  • Profile strength ring + checklist  │
│ 1-line each,      │  • Who viewed you (3 avatars)         │
│ tooltip on hover  │  • Refer a colleague (gold card)      │
│ (no paragraphs)   │  • AI Coach card (teal, animated)     │
└───────────────────┴───────────────────────────────────────┘
```

### Sections in detail

1. Hero (visual, ~3 words of copy)
   - Background: linear-gradient(navy → professionals) + radial AI mesh + 1 floating glow orb.
   - Left: circular avatar with teal ring, tier emoji badge.
   - Center: name, tier chip, verified tick.
   - Right: animated Trust Score donut (SVG) showing number, with pulse.
   - Two icon-only CTAs: "View" and "Share" (label hidden on mobile).
   - Removes the welcome paragraph and the long subtitle.

2. Stat tiles (4)
   - Replace label-heavy text with: big number, micro-label (1–2 words), inline mini sparkline, colored delta pill.
   - Hover reveals tooltip with longer label.

3. Trust Page Booster (new, replaces "Why your trust page is your unfair advantage" essay)
   - One row, gold-tinted card with subtle animated gradient.
   - Left: progress ring + "56% to Elite".
   - Right: 3 action chips (next best steps) with point rewards.
   - Single CTA "Boost now".

4. Benefits grid (compressed)
   - Keep the 6 benefits but as icon tiles only: icon + 2-word title.
   - Long descriptions move into hover tooltip / popover.
   - Optional flip-on-hover micro-interaction.

5. Quick actions
   - Convert to a horizontal scroll rail of icon chips (Add cert, Add experience, Add portfolio, Connect socials, Request endorsement, Ask review).

6. Right rail
   - Profile strength: replace 9-row checklist with a ring + 3 visible "next steps" (collapsible "see all").
   - Who viewed you: avatars with 1-line label.
   - Refer a colleague: gold card, single CTA, gift icon.
   - AI Coach card (new, AI vibe): teal gradient with animated sparkles; one rotating tip ("Your trust page is 1 endorsement away from Elite").

## Technical notes

- File: rewrite `src/pages/ProfessionalDashboard.tsx` only. No DB/auth changes.
- Use existing tokens: `hsl(var(--professionals))`, `hsl(var(--navy))`, `hsl(var(--gold))`, `hsl(var(--red))`. No hex colors.
- AI mesh: pure CSS (radial-gradients + `animate-pulse` / custom keyframes already in `index.css`); no new deps.
- Trust ring + sparklines: inline SVG components (small, no chart lib).
- Tooltips: `@/components/ui/tooltip` (already in project).
- Respect mobile safety: 390px viewport, `ms-/pe-` logical properties, 44px touch targets, `text-start`.
- Keep all existing routes/links (`/pro/:slug`, `/community`).

## Out of scope
- No backend changes, no new tables.
- No changes to Business Dashboard.
- No new pages or routes.
