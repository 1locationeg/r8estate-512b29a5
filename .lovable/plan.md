

# Journey Progress Bar — Multi-Segment Top Bar

## What Changes

Replace the current single-color 4px `JourneyStripe` with a **segmented progress bar** that shows all 4 journey stations as segments. The current station and all previous stations are filled with their respective colors; future stations are dimmed. This creates a visual sense of achievement — the further you are in your journey, the more the bar fills up.

## Layout

```text
┌─────────────────────────────────────────────────────┐
│ ███ NAVY ███│███ GOLD ███│░░ teal ░░│░░ emerald ░░ │  ← on a "Choose" page
│  (filled)   │  (filled)  │ (dimmed)  │  (dimmed)    │
└─────────────────────────────────────────────────────┘
```

Each segment is 25% width. Stations up to and including the current one are filled with their bold journey color; stations after are shown as faint tinted versions (10% opacity). A subtle transition animates when navigating between stations.

## Design Details

- **4 equal segments** in a single `flex` row, each `flex-1`, height `4px`
- Filled segments: `bg-journey-research`, `bg-journey-choose`, etc.
- Dimmed segments: `bg-journey-research/15`, `bg-journey-choose/15`, etc.
- Thin `1px` gap between segments (using `gap-px` or a transparent border) for visual separation
- Smooth `transition-colors duration-500` on each segment for animated fill when navigating
- Same hide logic as current stripe (hidden on homepage, auth, embed routes)

## Files to Modify

1. **`src/components/JourneyStripe.tsx`** — Replace with the segmented progress bar. Use `JOURNEY_STATIONS` array, find the current station index, and render 4 segments where `idx <= currentIdx` gets the full color and `idx > currentIdx` gets the dimmed version.

