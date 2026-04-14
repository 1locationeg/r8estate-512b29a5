

## Plan: Enforce 44px Minimum Touch Targets on Mobile

### What changes
Apply the iOS Human Interface Guideline minimum 44px touch target to all interactive elements on mobile, while keeping desktop sizes compact.

### Approach
Two-layer fix: (1) update the global `Button` component to enforce 44px on mobile via a responsive class, and (2) update the `BottomNav` bar height and button sizes since they currently use `h-12` (48px bar) but individual buttons lack min-height enforcement.

### Changes

**`src/components/ui/button.tsx`**
- Add `min-h-[44px] md:min-h-0` to the base CVA string so every Button instance automatically gets 44px min-height on mobile, unrestricted on desktop
- Keep existing size variants unchanged (they set explicit heights that are ≥44px for `default`/`lg`, but `sm` and `icon` are 36-40px — the new min-h overrides them on mobile only)

**`src/index.css`**
- Update the `.touch-target` utility to be mobile-only: `@apply min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0;` so it can be used as an opt-in class without affecting desktop

**`src/components/BottomNav.tsx`**
- Change individual nav buttons from `min-w-[40px]` to `min-w-[44px] min-h-[44px]` to meet the guideline

### Files changed
- `src/components/ui/button.tsx` — add responsive min-height to base CVA
- `src/index.css` — update `.touch-target` utility
- `src/components/BottomNav.tsx` — enforce 44px on nav buttons

