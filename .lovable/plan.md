

## Plan: Lighten Collective Buyer Protection Background

### Problem
The dark navy background feels heavy and visually disconnected from the rest of the site's lighter aesthetic.

### Approach
Replace the dark gradient with a light, subtle design that still conveys urgency/risk through color accents (red tones) rather than a heavy dark background. Use a soft pattern overlay and the site's card recipe (border, backdrop-blur) to blend with the homepage.

### Changes — `src/components/CollectiveBuyerProtection.tsx`

1. **Background**: Replace dark navy gradient with a light frosted card style — `bg-card/80 backdrop-blur-sm border border-destructive/15` with a very subtle red-tinted gradient overlay (`from-destructive/[0.03] via-transparent to-destructive/[0.02]`).

2. **Dot texture**: Change dots from white to `destructive` color at low opacity (`opacity-[0.04]`) — gives a subtle "warning grid" feel without heaviness.

3. **Text colors**: Swap all `text-white` and `text-white/60` to use foreground tokens (`text-foreground`, `text-muted-foreground`) so they work on the light background.

4. **Risk counter**: Keep the red color for "847M EGP" (`text-destructive`) — it pops on light backgrounds too.

5. **"WITH R8ESTATE" section**: Change gold color to `text-primary` or keep gold but ensure contrast on light bg.

6. **Divider**: Change `border-white/10` to `border-border/60` to match site style.

This keeps the fear/urgency expression through red accents and destructive color tokens while making the component feel integrated with the rest of the homepage.

