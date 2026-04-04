

# Agent Teaser: Inside the Review Card Only

## Concept

Instead of a separate component that replaces or sits outside the showcase, the agent teaser lives **inside the review card rectangle itself** — the exact same card area (lines 388–637 of `HeroTrustShowcase`). The gauge stays permanently visible above; only the card content swaps.

After the 3 review scenarios cycle once, the card content cross-fades to a compact agent teaser **within the same card dimensions** (~180px min-height, same padding/border/shadow). Then it fades back to reviews permanently.

```text
┌──────────────────────────────┐
│        GAUGE (always)        │  ← never changes
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │  Review Card area      │  │  ← THIS rectangle only
│  │  (cycles 3 reviews)    │  │
│  │  then becomes:         │  │
│  │  Agent teaser content  │  │
│  │  then back to reviews  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

## Agent Teaser Content (inside the card)

A minimal, motivating layout within the same card dimensions:

- **Sparkles icon + "R8 Agent"** label (small, top-left)
- **Rotating question** with typing effect: e.g. *"Is Ora Developers safe?"*
- **One-line answer** fading in: *"⚠️ 3 red flags found — 18mo delivery delay"*
- **CTA button**: "Try R8 Agent →" linking to `/copilot`
- Same card border, radius, shadow, padding — visually seamless

## Changes

### `src/components/HeroTrustShowcase.tsx`
- Add internal phase: after 3 reviews cycle, set `cardPhase` to `"agent"` for ~8s, then `"reviews"` permanently
- The gauge section (lines 296–386) stays untouched and always visible
- The review card container (line 389–637) gets a `position: relative` wrapper with two children:
  - Review content (visible when `cardPhase !== "agent"`)
  - Agent teaser content (visible when `cardPhase === "agent"`)
- Cross-fade via opacity transition within the same fixed-height container
- Remove `onCycleComplete` prop (no longer needed externally)

### `src/pages/Index.tsx`
- Remove `heroPhase` state machine entirely
- Remove `HeroAgentDemo` import and conditional rendering
- Render `<HeroTrustShowcase />` directly without phase wrappers — no opacity toggling, no absolute positioning

### `src/components/HeroAgentDemo.tsx`
- **Delete** — no longer needed as a standalone component

### Files Summary

| File | Action |
|------|--------|
| `src/components/HeroTrustShowcase.tsx` | Edit — add inline agent teaser phase inside the card |
| `src/pages/Index.tsx` | Edit — simplify, remove phase logic |
| `src/components/HeroAgentDemo.tsx` | Delete |

