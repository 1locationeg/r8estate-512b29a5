

# Refined Hero CTA Buttons — Lighter, Minimal, Animated

## Problem
The CTA buttons are visually heavy (bold font, thick borders, solid fills, shadows) making the hero section feel crowded.

## Approach

### 1. Restyle buttons to be minimal and modern (Index.tsx, lines 317-340)
- **"Share Your Experience"**: Remove `border-2`, use `border` (1px). Change `font-bold` → `font-medium`. Reduce padding slightly.
- **"Check Any Developer"**: Remove `shadow-lg`, use subtle `shadow-sm`. Change `font-bold` → `font-semibold`. Use slightly rounded pill shape (`rounded-full`).
- Both: Use `text-[11px] sm:text-xs` for smaller, cleaner text. Add `backdrop-blur-sm` for glass feel.
- Social proof text: make it slightly more subtle with `opacity-80`.

### 2. Add entrance animation without framer-motion
Since framer-motion isn't installed, use CSS keyframe animation (already have `fade-in` in tailwind config which does translateY(10px) + opacity). Apply `animate-fade-in` with staggered `animation-delay` via inline styles.

### 3. Files to change
- **`src/pages/Index.tsx`** — Update button classes + add animation classes with staggered delays

### Result
Clean, airy CTAs with a gentle fade-in+slide-up entrance. No new dependencies needed.

