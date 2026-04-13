

## Fix: Make Collective Buyer Protection a Full-Bleed Dark Accent Strip

### Current State
The `CollectiveBuyerProtection` component sits inside the hero's `max-w-[1100px]` padded container at line 378 of `Index.tsx`. It has `rounded-2xl` corners and the same horizontal padding as every other hero element. It looks like "just another card" rather than a dramatic contrast moment.

### The Fix
Pull the component **outside** the content container so it spans the full viewport width — a deliberate "break" in the grid that creates visual drama and marks the transition from hero to journey content.

### Changes

#### 1. `src/pages/Index.tsx`
- Move `<CollectiveBuyerProtection />` out of the `max-w-[1100px]` wrapper and place it as a standalone full-width row between the hero block and the search/journey sections.
- Remove the containing `div` with `mt-3 mb-0` and let the component itself handle its spacing.

#### 2. `src/components/CollectiveBuyerProtection.tsx`
- Remove `rounded-2xl` from the inner container — full-bleed strips should have no border radius.
- Add negative horizontal margin (`-mx-4 md:-mx-0`) or simply let the parent handle full-width flow.
- Add subtle top/bottom padding increase for breathing room as a standalone band.
- Keep the existing gradient, dot texture, and all content unchanged.

### Result
The dark navy gradient will stretch edge-to-edge, creating a clear visual "moment" that separates the hero intro from the journey/search area below — exactly the kind of deliberate contrast break that gives the page drama without noise.

### Files Touched
1. `src/pages/Index.tsx` — relocate the component outside the content container
2. `src/components/CollectiveBuyerProtection.tsx` — remove rounded corners, adjust to full-bleed layout

