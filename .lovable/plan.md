

## Plan: Progressive Star Fill with Color Gradient (Red → Yellow → Green)

### Current Behavior
Stars appear one by one in solid green (`#00b67a`), invisible stars are transparent.

### New Behavior
1. **Start**: Show all 5 stars with grey borders (empty, unfilled) — like the uploaded reference image but hollow
2. **Fill progressively** (600ms each): Each star fills with a color based on the cumulative rating:
   - Star 1 (rating 1): **Red** (`#e74c3c`)
   - Star 2 (rating 2): **Orange** (`#e67e22`)
   - Star 3 (rating 3): **Yellow/Amber** (`#f1c40f`)
   - Star 4 (rating 4): **Light Green** (`#2ecc71`)
   - Star 5 (rating 5): **Green** (`#00b67a`) — all 5 stars become green
3. **On reaching 5 stars**: All filled stars transition to green (`#00b67a`) to match the uploaded reference
4. **Hold** 1s at full green, then swap back to "Reviews" text for 6s

### Changes — `src/pages/Index.tsx` only

**Star color logic** (lines 287-297): Replace the single green color with a gradient function:

```tsx
const getStarFillColor = (starIndex: number, totalFilled: number) => {
  if (starIndex > totalFilled) return null; // unfilled
  if (totalFilled >= 5) return '#00b67a'; // all green at 5
  const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#00b67a'];
  return colors[totalFilled - 1]; // color based on current count
};
```

**Rendering**: Unfilled stars show with `text-muted-foreground/40` (grey border, no fill). Filled stars use the dynamic color for both `fill` and `text`. When `starCount` reaches 5, all stars smoothly transition to green.

### Scope
- `src/pages/Index.tsx` — ~10 lines changed in the star rendering block

