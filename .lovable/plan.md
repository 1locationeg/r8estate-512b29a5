

## Plan: Reorder Loop — Agent Result First, Then Reviews, Then Agent Processing

### New Loop Pattern

```text
Agent Result (4s) → Review 1 (4s) → Review 2 (4s) → Agent Processing (typing+steps+result 4s) → Review 3 (4s) → Agent Result → Review 1 → ...
```

The showcase **starts** by showing an agent result badge (no typing/processing on first display), then shows 2 reviews, then runs the full agent processing animation (typing → steps → result), then 1 review, then loops back.

### Changes in `src/components/HeroTrustShowcase.tsx`

**1. New sequence state machine** — Replace the simple `cardPhase: "reviews" | "agent"` with a sequence array approach:

```typescript
// The repeating sequence
const SHOWCASE_SEQUENCE = [
  { type: "agent-result", agentIdx: 0 },
  { type: "review", reviewIdx: 0 },
  { type: "review", reviewIdx: 1 },
  { type: "agent-full", agentIdx: 1 },  // typing → processing → result
  { type: "review", reviewIdx: 2 },
] as const;
```

**2. Replace `startCycling` logic** (lines 156-196):
- Use a single `sequenceIdx` state that increments through `SHOWCASE_SEQUENCE`.
- For `"review"` entries: show review card for 4s, then advance.
- For `"agent-result"`: show result badge directly (skip typing/processing) for 4s, then advance.
- For `"agent-full"`: run the full typing → processing → result flow, then advance after result hold.

**3. Update entrance** (lines 243-246):
- After entrance animation completes, start at sequence index 0 (agent result) instead of calling `startCycling()`.

**4. Remove old refs** — `cycleCountRef`, `agentShownRef`, `cycleIdxRef` replaced by single `sequenceIdx`.

**5. Update agent result transition** (lines 306-318):
- For `"agent-full"`: after result hold, advance `sequenceIdx` instead of checking `teaserIdx`.
- For `"agent-result"`: simply advance after 4s timeout.

### Scope
- Single file: `src/components/HeroTrustShowcase.tsx`
- ~40 lines rewritten in the cycling/state logic section

