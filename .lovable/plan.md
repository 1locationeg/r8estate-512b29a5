

## Competitive Leaderboard Strip — Integrated Into Nav List

### Idea
Instead of a separate widget or a bottom banner, **embed the leaderboard as a styled nav item within the navigation list itself** — but make it richer than a plain link. It becomes a "live competition card" sitting naturally among the nav items, always visible without overlapping anything.

The Leaderboard nav item transforms from a plain text link into a **mini competition strip** that shows:
- Your rank with a pulsing indicator
- A rival row ("You vs #4 — only 3 pts behind!")
- A slim progress bar racing toward the next rank
- Tapping it navigates to `/leaderboard`

This creates FOMO and a competitive feeling every time they glance at the sidebar, without taking extra space or overlapping other items.

### Layout Within Nav List

```text
  Dashboard
  My Reviews
  Search Alerts
  ┌─────────────────────────────┐
  │ 🏆 Leaderboard        #12  │
  │ ▓▓▓▓▓▓▓▓▓░░░  3 pts to #11 │
  │ Beat Ahmed K. to rank up!   │
  └─────────────────────────────┘
  Community
  Achievements
  Invite Friends
  ...
```

It sits exactly where "Leaderboard" already is in the nav, but expanded into a competition card. No extra space, no overlap.

### File Changes

**`src/components/DashboardSidebar.tsx`**

1. In `renderNavButton`, detect when `item.path === '/leaderboard'` and render an enhanced competition card instead of a plain nav button
2. The card shows:
   - Trophy icon + "Leaderboard" label + user's rank badge (`#12`)
   - A slim progress bar showing how close they are to the next rank (percentage based on points gap)
   - Rival name: the person one rank above them (fetched from existing `get_weekly_leaderboard` data)
   - Motivational text: "Beat [Name] to rank up!" or "You're #1!" if top
3. Style: gradient border on the left (like active state but gold/coin colored), subtle coin-tinted background, slightly more padding than regular nav items
4. Still navigates to `/leaderboard` on click
5. When user has no rank yet, fall back to a simpler motivational version: "Start reviewing to join the race!"

**Data**: Already fetched via the existing `useEffect` that calls `get_weekly_leaderboard`. Just need to also store the rival's name from `data[idx-1]`.

**`src/pages/BuyerDashboard.tsx`**
- No changes needed — the Leaderboard nav item already exists in `navItems`.

### Why This Works for Competition & Engagement
- **Always visible** — sits in the nav list, no scrolling needed
- **Personal rival** — seeing a real name creates emotional competition
- **Progress bar** — visualizes how close they are, triggering "almost there" psychology  
- **No layout issues** — it's just a slightly taller nav item, flows naturally
- **Motivates clicks** — the competitive data makes them want to check the full board

