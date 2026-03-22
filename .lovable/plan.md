

# Reposition FloatingChatFAB to Avoid Overlap

## Problem
The FloatingChatFAB (chat bubble button) is fixed at `bottom-6 end-6` with `mb-16 md:mb-0`, which can overlap the BottomNav on mobile and the ReviewMotivatorFloat on the left. Similarly, the ReviewMotivatorFloat sits at `bottom-6 left-6` and can cover page content.

## Solution
Move both floating elements so they sit **above** the BottomNav on mobile and don't overlap page content:

### 1. `src/components/FloatingChatFAB.tsx`
- Change positioning from `bottom-6 mb-16 md:mb-0` to `bottom-20 md:bottom-6` — this places it clearly above the h-12 BottomNav on mobile, and at normal position on desktop where there's no BottomNav.
- Remove the `mb-16` hack and use direct bottom offset instead.

### 2. `src/components/ReviewMotivatorFloat.tsx`
- Same fix: change `bottom-6 mb-16 md:mb-0` to `bottom-20 md:bottom-6` on the container.

### 3. Hide on dashboard pages
- Both FABs already render globally in App.tsx. They should avoid overlapping dashboard sidebars/content. Add a route check to hide them on `/buyer-dashboard`, `/business-dashboard`, `/admin-dashboard` paths (the dashboards have their own layouts). This is optional but prevents overlap in those contexts.

## Result
The chat FAB and review motivator will always float above the BottomNav on mobile and in clear space on desktop, never covering interactive content beneath them.

