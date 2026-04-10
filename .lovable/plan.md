

## Plan: Two-CTA Hero with Drawer Sub-Actions

### Concept

Replace the 4-button grid with **two clear CTAs**:

1. **"Start Here"** — for first-time buyers. Opens a bottom drawer with guided options: Check Reviews, Compare Developers, Track Launches, Protect Your Deal.
2. **"Smart Tools"** — for experienced buyers. Opens a bottom drawer with the same tools but framed for power users (Compare Now, Track Launches, Contract Check).

Both drawers reuse existing modals/routes (CompareModal, ContractUploadModal, /reviews, /launch-watch).

### Layout (mobile 390px)

```text
┌──────────────────────────────┐
│  🏠  "Start Here"           │  ← full-width, primary style
│  Your first step to a safe  │
│  property purchase           │
├──────────────────────────────┤
│  ⚡ "Smart Tools"            │  ← full-width, outline style
│  Compare, track & protect   │
│  like a pro                 │
└──────────────────────────────┘
   • 2,847 buyers this week
```

On desktop (sm+): side-by-side two columns.

### Drawer Content (both share same actions, different framing)

Each drawer uses the Shadcn `Drawer` component and lists 4 action cards:
- **Check Reviews** → `/reviews`
- **Compare** → opens CompareModal
- **Track Launches** → `/launch-watch`
- **Protect My Deal** → opens ContractUploadModal

### Files to Change

1. **`src/components/HeroNextSteps.tsx`** — Rewrite to render two CTA buttons + two Drawer components with action lists inside.

2. **`src/i18n/locales/en.json`** — Update `nextSteps` keys:
   - `nextSteps.startHere.cta`, `nextSteps.startHere.subtitle`
   - `nextSteps.smartTools.cta`, `nextSteps.smartTools.subtitle`
   - Keep existing sub-action keys (`reviews`, `compare`, `launch`, `contract`)

3. **`src/i18n/locales/ar.json`** — Arabic translations for the same new keys.

### Technical Notes

- Uses existing `Drawer` from `src/components/ui/drawer.tsx`
- Keeps CompareModal and ContractUploadModal as-is
- Staggered fade-in animation preserved for the two buttons
- Social proof line kept below

