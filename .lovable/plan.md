

## Plan: Oscillating Needle Motion for Trust Gauge

### Problem
The gauge needle currently jumps instantly to new scores during the auto-cycle (review transitions set `displayScore` directly). Even the `animateToScore` function uses a simple ease-out with no oscillation — it moves once and stops.

### Solution
Two changes to make the needle feel alive:

**1. Spring-based score transitions** (`advanceSequence` + `animateToScore`)
- Replace the direct `setDisplayScore(nextScore)` in review transitions with an animated spring that overshoots the target, bounces back, and settles (damped oscillation)
- Easing: `1 - e^(-6t) * cos(4πt)` — a damped sine wave that overshoots ~15% then settles within ~1.2s

**2. Subtle idle micro-oscillation**
- When the needle is "resting" at a score, add a continuous ±1–2 point wobble using a slow sine wave (`sin(t * 0.8)`) — like a real analog gauge with slight vibration
- This runs via `requestAnimationFrame` and only affects `displayScore`, not the logical `score`

### Files Modified
- `src/components/HeroTrustShowcase.tsx` — Replace `animateToScore` easing with spring physics, add idle oscillation effect, update `advanceSequence` to use animated transitions instead of instant jumps

### No database changes.

