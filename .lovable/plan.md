

# Theme-Aware Footer Copyright Bar

## What Changes

The bottom copyright bar area of the footer (containing the BrandLogo, Sitemap link, and copyright text) will use theme-aware colors instead of hardcoded dark slate. This makes it white in light mode and will automatically adapt if dark mode is added later.

## Changes

| File | Details |
|---|---|
| `src/components/Footer.tsx` | Change the copyright bar wrapper from `border-slate-800` → `bg-background border-border` with `text-foreground`/`text-muted-foreground` for text. The Sitemap link hover changes to `hover:text-foreground`. This uses the existing CSS variable system so it's white now and auto-adapts to any future theme. |

The main footer body (newsletter, columns) stays dark navy as designed — only the bottom copyright strip becomes theme-aware.

