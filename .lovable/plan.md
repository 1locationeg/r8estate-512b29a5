

## Plan: Separate Green Safe Zone with Light Green Pattern Background

### What changes
Pull the green "WITH R8ESTATE" section out of the red card into its own standalone block with a light green patterned background, separated by a **6px gap**.

### Changes — `src/components/CollectiveBuyerProtection.tsx`

1. **Remove** the divider line and green safe zone from inside the red card
2. **Close** the red card before the green section
3. **Add a new standalone green card** below with `mt-1.5` (6px gap):
   - Background: `bg-green-50/80 dark:bg-green-950/20`
   - Border: `border border-green-200/40 dark:border-green-900/30 rounded-2xl`
   - Green dot-pattern texture overlay (same approach as red card but green)
   - Subtle green gradient overlay
4. **Move** the existing green zone content (protected count, avatars, CTA) into the new card

### Files changed
- `src/components/CollectiveBuyerProtection.tsx`

