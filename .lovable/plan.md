

## Plan: Declutter Hero CTAs — Minimal, Clean, Powerful

### Problem
At 390px viewport, the hero area feels crowded with the tagline, two dense CTA buttons (icon + title + subtitle), and the search bar stacked tightly together.

### Solution
Strip the CTAs down to their essence — remove the subtitle text, keep only the icon + bold label, reduce padding, and use pill-shaped compact buttons instead of card-like blocks. The powerful words ("See Real Owners", "Protect Your Money") stay intact.

### Changes in `src/pages/Index.tsx` (lines 248-269)

**Before**: Two card-like buttons with icon + title + subtitle, `py-3 px-3 rounded-xl`
**After**: Two slim pill buttons with icon + label only, `py-2 px-4 rounded-full`, smaller gap

```text
Before:
  [👥 See Real Owners          ] [🛡 Protect Your Money        ]
       Real stories from             Don't pay millions
       real buyers                   before you check

After:
  [👥 See Real Owners]  [🛡 Protect Your Money]
```

- Remove subtitle `<span>` elements (the sub-copy)
- Change `rounded-xl` → `rounded-full` for pill shape
- Reduce `py-3 px-3` → `py-2 px-4`
- Remove nested `<div>` wrapper, keep just icon + single `<span>`
- Reduce `mt-4` → `mt-3` on the container
- Keep the same hover effects and navigation behavior

### Files Modified
- `src/pages/Index.tsx` — simplify CTA button markup and styling

