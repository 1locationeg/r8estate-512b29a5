

## Replace MiniLeaderboard with a Compact Rank Banner

### Problem
The full `MiniLeaderboard` widget (with period toggle, top 3 entries, user row) takes ~200px of vertical space inside the scrollable area, pushing nav items out of view and competing for attention.

### Solution
Remove the full `MiniLeaderboard` from the sidebar scroll area and replace it with a **slim, always-visible rank banner** pinned to the bottom footer (above sign-out). This banner is a single clickable row showing:

```text
┌──────────────────────────────────┐
│ 🏆  #12 this week · 45 pts  →   │
│     "5 pts to climb to #11"      │
└──────────────────────────────────┘
```

- Shows user's current rank + points in one line
- A motivational sub-line ("X pts to overtake next")
- Tapping navigates to `/leaderboard`
- Takes only ~50px vs ~200px, no overlap with nav

### File Changes

**`src/components/DashboardSidebar.tsx`**
1. Remove `MiniLeaderboard` import and usage from the scroll area
2. Add a new inline compact rank strip in the pinned bottom section (above sign-out)
3. Fetch minimal rank data (user rank + points) via a lightweight `supabase.rpc` call inside `SidebarContent`
4. Render: trophy icon, rank number, points, and a motivational nudge — all in a single `<button>` that navigates to `/leaderboard`

### Layout After

```text
┌──────────────────┐
│  Profile Card    │  ← fixed
├──────────────────┤
│  Nav Items       │  ← scrollable (full height now)
│  Dashboard       │
│  My Reviews      │
│  Search Alerts   │
│  Account Details │
│  Notifications   │
│  Leaderboard     │
│  Community       │
│  Achievements    │
│  Invite Friends  │
├──────────────────┤
│ 🏆 #12 · 45 pts │  ← pinned compact rank banner
├──────────────────┤
│  [Action Button] │  ← pinned
│  Sign Out        │  ← pinned
└──────────────────┘
```

