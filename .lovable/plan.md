

## Auto-Cycling Reviews + Visible "TRUST SCORE" Label

### Problems
1. The gauge and review card are static after entrance — they should auto-cycle through all 4 scenarios every 4 seconds (giving enough time to read each review).
2. The "TRUST SCORE" text inside the SVG is hidden behind the review card overlap (`-mt-2` still covers it).

### Changes to `src/components/HeroTrustShowcase.tsx`

**1. Auto-cycle through scenarios every 4 seconds**
- Add a `useEffect` with `setInterval` that cycles through scenario indices (0→1→2→3→0...).
- Each cycle calls `animateToScore(scenarios[nextIdx].score)` so the needle sweeps and the review card content updates.
- The interval pauses when the user interacts (slider drag or preset click) and resumes 6 seconds after the last interaction via a `userInteracted` ref + timeout.
- 4 seconds per scenario gives enough reading time while keeping it dynamic.

**2. Show "TRUST SCORE" label clearly**
- Move the "TRUST SCORE" text **outside** the SVG, rendered as a styled `<span>` between the gauge and the review card.
- Change the card margin from `-mt-2` to `mt-1` so it no longer overlaps the label.
- Style: small caps, tracking-widest, muted color, centered — consistent with existing design.

**3. Crossfade review content on scenario change**
- Add a brief opacity transition (200ms fade-out, swap content, 200ms fade-in) when the scenario changes, using a `transitioning` state boolean.

### Implementation Detail

```
[Gauge SVG]
   ↓ (no overlap)
"TRUST SCORE" label (outside SVG, as HTML span)
   ↓ mt-1
[Review Card — cycles every 4s]
   ↓
[Slider + Presets + Replay]
```

Auto-cycle logic:
- `cycleIdxRef` tracks current scenario index
- On interval tick: increment index, animate to that scenario's score
- On user interaction: clear interval, set 6s resume timeout
- On replay: restart from scenario 0

