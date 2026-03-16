

## Rotating Trust Categories (2 at a time, 2s interval)

**File:** `src/components/FeaturedIdentitySpotlight.tsx`

**Changes:**

1. Add `categoryPairIndex` state (default 0), auto-cycle every 2 seconds via `useEffect`/`setInterval`, wrapping back to 0 after the last pair

2. Compute visible pair: `trustCategories.slice(pairIndex * 2, pairIndex * 2 + 2)`

3. Wrap category bars in a keyed container with fade transition (`transition-opacity duration-500`)

4. Add small dot indicators below categories — active dot highlighted, tappable to jump to a pair (resets timer)

**Behavior:** Show 2 categories → fade → next 2 → fade → ... every 2 seconds, looping continuously.

