

# Coin-Style Points System with Action Rewards and Celebrations

## Overview
Add a persistent "coin counter" to the dashboard, show point rewards beside every actionable item, and celebrate completions with confetti + toast notifications — creating a game-like motivation loop throughout the platform.

## What Changes

### 1. Coin Counter Component (`src/components/CoinCounter.tsx`)
A new reusable component showing the user's total points as animated "coins" — displayed in the dashboard header and sidebar. Uses `useBuyerGamification()` to pull live `totalPoints`. Features a gold coin icon with subtle pulse animation when points change. Compact for header, expanded for sidebar.

### 2. Dashboard Header — Coin Display
Add the CoinCounter to `src/components/DashboardHeader.tsx` beside the notification bell. Shows as a compact gold pill: `🪙 125` that links to `/buyer/achievements`.

### 3. Dashboard Sidebar — Coin Display  
Add an expanded CoinCounter to `src/components/DashboardSidebar.tsx` in the profile card area, showing total coins with current tier emoji and a mini progress bar to next tier.

### 4. Quick Actions with Point Rewards (`src/pages/BuyerDashboard.tsx`)
Update each Quick Action card to show the points the user can earn:
- "Search Developers" → `+2 coins per view`
- "Developer Directory" → `+2 coins per profile`
- "Saved Projects" → `+4 coins per save`

Each card gets a small gold badge in the corner showing the reward.

### 5. Mission Cards with Coin Rewards
Update `MissionCard` in `src/components/BuyerGamificationPanel.tsx` to prominently display the coin reward with a gold coin icon: `🪙 +30` beside each mission title, making the reward visually prominent.

### 6. Celebration Toasts on Completion
Create a `src/components/CoinEarnedToast.tsx` — a reusable celebration toast with coin animation. Integrate it into:
- **Review submission** (`WriteReviewModal.tsx`) — show `🪙 +25 coins earned!` after submit
- **Project save** (`useSaveFollow.ts`) — show `🪙 +4 coins!`
- **Developer profile view** (`useTrackInterest.ts`) — show `🪙 +2 coins!`
- **Community post/reply** (`useCommunity.ts`) — show `🪙 +15/+10 coins!`
- **Profile completion** (`BuyerDashboard.tsx` profile save) — show congratulations with total coins

### 7. Nav Item Badges
In the sidebar nav items (`src/pages/BuyerDashboard.tsx` navItems), add coin hints to key items:
- "My Reviews" → small `+25/review` label
- "Community" → small `+15/post` label
- "Achievements" → show total coins count

### 8. Points Reference Map
A small constant mapping actions to their point values (derived from the existing badge/mission system) for consistent display across all components:
```
POINTS_PER_ACTION = {
  developer_view: 2,
  project_save: 4,
  review_write: 25,
  report_unlock: 10,
  community_post: 15,
  community_reply: 10,
  community_vote: 5,
  helpful_vote: 3,
}
```

## Files Modified
- `src/components/CoinCounter.tsx` — **new** — animated coin display component
- `src/components/CoinEarnedToast.tsx` — **new** — celebration toast with coin animation
- `src/lib/buyerGamification.ts` — add `POINTS_PER_ACTION` constant
- `src/components/DashboardHeader.tsx` — add coin counter beside notifications
- `src/components/DashboardSidebar.tsx` — add coin display in profile card
- `src/pages/BuyerDashboard.tsx` — add coin rewards to quick actions, nav item hints
- `src/components/BuyerGamificationPanel.tsx` — coin icons on missions and badges
- `src/components/WriteReviewModal.tsx` — celebration toast after review submit
- `src/hooks/useSaveFollow.ts` — coin toast on save
- `src/hooks/useCommunity.ts` — coin toast on post/reply
- `src/components/ReviewSuccessOverlay.tsx` — update to show coins instead of generic "points"

## Design Approach
- Gold coin color: `#F5A623` (amber-500) — stands out without clashing with business green or buyer blue
- Coin icon: Lucide `Coins` icon or a custom `🪙` emoji
- Animations: CSS `animate-bounce` on earn, `transition-all` on counter increment
- All celebrations use existing `ConfettiCelebration` + `toast` infrastructure

