

# Live Agentic Demo — Hero Right Panel (Gauge Untouched)

## Overview

Add a **Live Agent Demo** component to the right side of the hero section, while keeping the existing `HeroTrustShowcase` (gauge + slider + review card) **exactly as-is** on the left side. The demo simulates a real-time R8 Agent conversation to create an immediate "agentic" first impression.

## Layout Change

The hero card interior (line 228 in `Index.tsx`) becomes a **2-column grid on desktop**, stacked on mobile:

```text
┌──────────────────────────────────────────────────────┐
│  Platform Badge + Headline + Search Bar              │
├──────────────────────────┬───────────────────────────┤
│  LEFT (existing)         │  RIGHT (new)              │
│                          │                           │
│  HeroTrustShowcase       │  ┌─ Agent Window ───────┐ │
│  (gauge, slider,         │  │ ✦ R8 Agent · Online  │ │
│   review card —          │  │                       │ │
│   UNTOUCHED)             │  │ User typing...        │ │
│                          │  │ Agent thinking...     │ │
│                          │  │ Result card slides in │ │
│                          │  │ Agent recommendation  │ │
│                          │  │ [Compare] [Reviews]   │ │
│                          │  └───────────────────────┘ │
├──────────────────────────┴───────────────────────────┤
│  MiniJourneyArc + TractionStats (full width)         │
└──────────────────────────────────────────────────────┘
```

Mobile: stacked — gauge first, then agent demo below.

## New File: `src/components/HeroAgentDemo.tsx`

A self-contained ~280-line component with a scripted auto-playing conversation loop.

### Auto-play Script (loops every ~18s, 2 alternating scenarios)

**Scenario 1 — Trust Recommendation:**
1. User typing (1.5s): *"Show me compounds in New Cairo with proven on-time delivery"*
2. Agent thinking (2s): Shimmer + cycling status — *"Scanning 452 developer reports..." → "Analyzing 1,200+ reviews..."*
3. Result card slides in: Mivida by Emaar — Trust 97, ★4.8, badges (On-Time 98%, Finishing: Excellent)
4. Agent reply types in (2s): *"I recommend Mivida by Emaar. 98% on-time delivery, 4.8/5 finishing quality."*
5. Action chips fade in: "Compare alternatives" · "View reviews"
6. Hold 4s, crossfade to scenario 2

**Scenario 2 — Risk Alert:**
1. User typing: *"Any red flags for Ora Developers?"*
2. Agent thinking: *"Running risk assessment..."*
3. Risk card: Ora Developers — Trust 25, ⚠️ flags
4. Agent: *"⚠️ Caution: Multiple verified complaints about delivery delays."*
5. Chips: "See reviews" · "Compare alternatives"

### Visual Design
- Window chrome with glassmorphism border, `bg-card` background
- Header: Sparkles icon + "R8 Agent" + pulsing green dot + "Online"
- User bubbles right-aligned (`bg-primary`), Agent bubbles left-aligned (`bg-secondary`)
- Thinking state: existing `shimmer` keyframe + `Search` icon pulse
- Result cards: bordered mini-card with trust score color ring, star rating, dimension badges
- Action chips: small rounded `border-primary/20` buttons with hover glow
- **Pause on hover**, resume 3s after mouse leaves

### Animations (using existing Tailwind keyframes)
- Typing cursor: blinking `|` with `animate-pulse`
- Thinking shimmer: existing CSS `shimmer` keyframe
- Card entrance: `animate-fade-in` + `translate-y-2`
- Text streaming: character-by-character at 30ms
- Chip entrance: staggered `animate-fade-in` with 100ms delay

## Changes to `src/pages/Index.tsx`

1. Import `HeroAgentDemo`
2. Wrap the `HeroTrustShowcase` div and a new `HeroAgentDemo` div in a `md:grid md:grid-cols-2 md:gap-4 items-start` container (line 268 area)
3. `HeroTrustShowcase` stays in the left column — **zero changes** to that component
4. `HeroAgentDemo` in the right column
5. On mobile: single column, gauge on top, agent demo below (compact ~260px height)

## Files Summary

| File | Action |
|------|--------|
| `src/components/HeroAgentDemo.tsx` | **Create** — new live agent demo component |
| `src/pages/Index.tsx` | **Edit** — 2-col grid around showcase + demo |
| `src/components/HeroTrustShowcase.tsx` | **No changes** |
| `src/components/HeroTrustGauge.tsx` | **No changes** |

