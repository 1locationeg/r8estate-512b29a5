

# HeroCategoryItems — Airport Terminal Walking Path Redesign

## Concept
Replace the current tabbed stepper with a **vertical linear corridor** — a scrollable walking path where each journey stage is a visible "terminal gate" with its categories and businesses nested directly underneath. Users scroll through the entire journey naturally, like walking through an airport terminal, rather than clicking tabs.

## Layout (ASCII)

```text
┌─────────────────────────────────┐
│ ● GATE 1 — Research             │
│   "Know who to trust"           │
│   ┌──────┐ ┌──────┐ ┌──────┐   │
│   │ pill │ │ pill │ │ pill │   │  ← category pills
│   └──────┘ └──────┘ └──────┘   │
│   (tap pill → items slide out)  │
│         │                       │
│    ─ ─ ─┼─ ─ ─  connector line  │
│         │                       │
│ ● GATE 2 — Choose              │
│   "Pick your perfect match"     │
│   ┌──────┐ ┌──────┐            │
│   │ pill │ │ pill │            │
│   └──────┘ └──────┘            │
│         │                       │
│    ─ ─ ─┼─ ─ ─                  │
│         │                       │
│ ● GATE 3 — Finance             │
│ ● GATE 4 — Protect             │
└─────────────────────────────────┘
```

## Key Design Elements

1. **Vertical walking path** — A thin connector line (dashed or glowing) runs vertically on the start side (left in LTR, right in RTL) connecting all 4 gates. Each gate has a numbered circle on the line.

2. **Gate headers** — Each gate shows: colored number badge, step name, one-line benefit tagline, and total companies count. Compact, bold.

3. **Inline category pills** — Horizontal wrap of small pills under each gate (icon + name + count + chevron). Tapping expands items below the pill row, same as current behavior.

4. **Expanded items** — Same compact avatar cards (3-col on mobile) slide in under the expanded category within that gate.

5. **Gate progress indicator** — Past gates get a checkmark or muted style. Current/future gates are full color. This creates the "inevitable sequential" feeling.

6. **No tab switching** — All 4 gates are visible at once in one scrollable column. The corridor IS the content.

7. **Max-height with scroll** — On mobile, container gets `max-h-[60vh] overflow-y-auto` with a subtle gradient fade at the bottom to hint at more content below.

## Files to Modify

1. **`src/components/HeroCategoryItems.tsx`** — Full rewrite of the render. Remove stepper tabs, replace with vertical corridor layout. Keep all data/categories/handlers intact. Add connector line via `absolute` positioned element.

2. **`src/i18n/locales/en.json`** — Minor: update `journey` nudge text to gate-style language. Add `gate` label if needed.

3. **`src/i18n/locales/ar.json`** — Same Arabic translations.

## Technical Approach

- Remove `activeStep` state — no longer needed since all gates are visible
- Keep `expandedCategory` state for pill expand/collapse
- Connector line: a `div` with `absolute left-3 top-0 bottom-0 w-px border-l border-dashed border-primary/30` (flipped for RTL)
- Gate circles: `absolute left-1.5` on the line, colored per step
- Mobile: `max-h-[55vh] overflow-y-auto` with `mask-image: linear-gradient(...)` fade at bottom
- Desktop: full height, 2-3 column pill grid per gate

