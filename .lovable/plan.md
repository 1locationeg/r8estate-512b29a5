

# Hero Sequence: Full Gauge Cycle → Agent Demo → Gauge Forever

## The Flow

```text
TIME ──────────────────────────────────────────────────────►

 ┌───────────────────┐    ┌──────────────┐    ┌──────────────┐
 │  GAUGE + REVIEWS  │    │  R8 AGENT    │    │  GAUGE +     │
 │  (full cycle:     │──► │  DEMO PLAYS  │──► │  REVIEWS     │
 │   all 4 reviews   │    │  (1 scenario)│    │  (permanent) │
 │   ~16-18s)        │    │              │    │              │
 └───────────────────┘    └──────────────┘    └──────────────┘
```

The showcase has 4 scenarios cycling every 4s. After all 4 have played (~16s), it cross-fades to the agent demo. After the agent finishes one full scenario, it cross-fades back to the gauge permanently.

## Changes

### `src/components/HeroTrustShowcase.tsx` — Add `onCycleComplete` prop
- Accept an optional `onCycleComplete?: () => void` prop
- Inside `startCycling`, track how many transitions have occurred. After the 4th scenario has been shown (one full loop through all `scenarioDefs`), call `onCycleComplete()`
- No visual changes — just a callback signal

### `src/components/HeroAgentDemo.tsx` — Add `onComplete` prop
- Accept an optional `onComplete?: () => void` prop
- After the first scenario finishes its `hold` phase, call `onComplete()` instead of looping to scenario 2

### `src/pages/Index.tsx` — Phase state machine
- Replace `showcaseRevealed` with `heroPhase: "gauge" | "agent" | "gauge-final"`
- Start at `"gauge"`
- When `HeroTrustShowcase` fires `onCycleComplete` → set phase to `"agent"`
- When `HeroAgentDemo` fires `onComplete` → set phase to `"gauge-final"`
- Layout: both components in the same container, visibility toggled by opacity + absolute positioning transitions
- Agent demo only mounts during `"agent"` phase (unmounts after completion)

### Layout Structure
```text
<div id="trust-showcase" className="relative mt-1">
  {/* Gauge — visible in "gauge" and "gauge-final" */}
  <div className={phase !== "agent" ? "opacity-100" : "opacity-0 absolute inset-0"}>
    <HeroTrustShowcase onCycleComplete={...} />
  </div>

  {/* Agent — mounted only in "agent" phase */}
  {phase === "agent" && (
    <HeroAgentDemo onComplete={...} />
  )}
</div>
```

### Files Changed
| File | Action |
|------|--------|
| `src/components/HeroTrustShowcase.tsx` | Edit — add `onCycleComplete` callback after all 4 reviews shown |
| `src/components/HeroAgentDemo.tsx` | Edit — add `onComplete` prop, stop after 1 scenario |
| `src/pages/Index.tsx` | Edit — `heroPhase` state machine replacing `showcaseRevealed` |

