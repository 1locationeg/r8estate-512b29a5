

# Hero CTA: Icon-Only Glowing Circles with 3D Depth + Tooltips

## What Changes
Replace the two text CTA buttons ("Share Your Experience" / "Check Any Developer") with two circular icon-only buttons that have a gradient glow ring, 3D depth effect, and tooltips showing the full label on hover/tap.

## Visual Result

```text
         [ ✍ ]    [ 🔍 ]
        glow ring  glow ring
        tooltip    tooltip
```

- **Left icon**: `MessageSquarePlus` (write/review) — universally means "share feedback"
- **Right icon**: `ScanSearch` (investigate) — universally means "search/check"

Each button: ~44px circle, gradient border ring (primary → brand-red), glass inner (`bg-white/90 backdrop-blur`), multi-layer shadow for 3D depth, hover lift (`-translate-y-0.5`), subtle pulsing glow animation.

## Technical Plan

### 1. `tailwind.config.ts` — Add `pulse-glow` keyframe
```
"pulse-glow": {
  "0%, 100%": { boxShadow: "0 0 8px 0 hsl(var(--primary) / 0.3)" },
  "50%": { boxShadow: "0 0 16px 4px hsl(var(--primary) / 0.15)" }
}
```
Animation: `"pulse-glow": "pulse-glow 3s ease-in-out infinite"`

### 2. `src/pages/Index.tsx` (lines 319-345) — Replace text buttons with icon circles
- Import `MessageSquarePlus`, `ScanSearch` from lucide-react
- Import `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` from UI
- Two circular buttons wrapped in Tooltip showing `t("hero.shareExperience")` / `t("hero.checkDeveloper")`
- Outer: `w-11 h-11 rounded-full bg-gradient-to-br from-primary via-brand-red to-accent p-[1.5px]` (gradient border)
- Inner: `rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center`
- Shadow: `shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.25),0_2px_4px_-1px_hsl(var(--primary)/0.1)]`
- Hover: `hover:-translate-y-0.5 hover:shadow-lg transition-all`
- Glow: `animate-pulse-glow`
- Icons: `w-5 h-5 text-primary`
- Keep same onClick handlers and staggered `animationDelay`

### Files
1. **`tailwind.config.ts`** — Add `pulse-glow` keyframe + animation
2. **`src/pages/Index.tsx`** — Replace CTA buttons with icon circles + tooltips

