

# Hero CTA: Icon-Only Buttons with Tooltips

## Current State
Two text buttons: "Share Your Experience" and "Check Any Developer" — pill-shaped, taking horizontal space.

## Ideas & Options

### Option A: Glowing Icon Circles (Recommended)
Two circular icon buttons with a subtle gradient glow ring and tooltip on hover/tap:

```text
  [ ✍️ ]    [ 🔍 ]
   glow      glow
```

- **"Share Your Experience"** → `Pencil` or `MessageSquarePlus` icon — universally understood as "write/review"
- **"Check Any Developer"** → `Search` or `ScanSearch` icon — universally understood as "search/investigate"

Each button: `w-11 h-11 rounded-full` with a gradient border (primary → brand-red), glass-like `backdrop-blur`, and a soft pulsing glow animation. On hover, a `Tooltip` shows the full label text.

### Option B: Floating Action Pill with Icon + Short Word
Hybrid — icon with a 1-word label:

```text
  [ ✍ Review ]    [ 🔎 Search ]
```

Smaller text, icon-led. Still compact but zero guessing.

### Option C: 3D-style Raised Icons
Use `box-shadow` layering + gradient fills to create a pseudo-3D raised button effect:
- Slight `translateY` on hover (lifts up)
- Multi-layer shadows for depth
- Gradient icon fill matching brand colors

## Recommendation: Option A + C combined
Circular icon buttons with 3D depth effect + tooltip. Clean, modern, zero clutter. The icons `MessageSquarePlus` and `ScanSearch` from Lucide are distinctive and self-explanatory.

## Technical Plan

### 1. Update `src/pages/Index.tsx` (lines 320-345)
- Replace text buttons with two icon-only circular buttons
- Use `MessageSquarePlus` (share experience) and `ScanSearch` (check developer)
- Add gradient border via `bg-gradient-to-r from-primary to-brand-red` wrapper trick
- Add 3D depth: multi-layer `shadow`, `hover:-translate-y-0.5` lift
- Subtle pulse glow via CSS animation
- Wrap each in `<Tooltip>` showing the translated label

### 2. Add glow keyframe to `tailwind.config.ts`
- Add `pulse-glow` keyframe: subtle box-shadow pulse animation

### 3. No translation changes needed
- Tooltip text reuses existing `hero.shareExperience` and `hero.checkDeveloper` keys

### Result
Two small, elegant, glowing icon circles that feel premium and AI-modern. Instantly recognizable. Tooltips ensure zero guessing. The 3D lift on hover adds tactile feedback.

