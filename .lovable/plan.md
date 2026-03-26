

## Sidebar Redesign: Light Theme + Bottom Leaderboard

### What Changes

Based on the reference image, two main adjustments:

1. **Move Leaderboard to Bottom** — Currently the `MiniLeaderboard` sits between navigation and the sign-out area. It should be pinned to the bottom of the sidebar (just above sign-out), so users can tap it without scrolling past nav items. The nav section gets the scrollable overflow, and the leaderboard stays fixed at the bottom.

2. **Light Background Theme** — The reference shows a white/light sidebar background with dark text, green active states, and subtle gray borders — not the current dark navy (`bg-sidebar-bg`). The sidebar content will switch to `bg-white` with `text-foreground` styling, matching the attached image's clean look.

### Technical Details

**File: `src/components/DashboardSidebar.tsx`**
- Change outer container from `bg-sidebar-bg text-sidebar-foreground` to `bg-white text-foreground` (light theme)
- Update brand header border from `border-white/10` to `border-border`
- Update profile section colors: text from `text-sidebar-foreground/muted` to `text-foreground/muted-foreground`, avatar ring to match light bg
- Update nav item active/inactive colors to use light-theme equivalents (green active text stays, backgrounds become `bg-primary/10` instead of `bg-sidebar-active/15`)
- Restructure layout: nav gets `flex-1 overflow-y-auto`, leaderboard + sign-out are pinned below nav in a non-scrolling footer area
- Pass `darkMode={false}` (or remove the prop) to `MiniLeaderboard`

**File: `src/components/MiniLeaderboard.tsx`**
- No structural changes needed — already supports `darkMode={false}` for light rendering
- Will render with light card styling automatically

**File: `src/components/DashboardSidebar.tsx` — Layout restructure:**
```text
┌──────────────────┐
│  Brand Logo      │  ← fixed top
├──────────────────┤
│  Profile Card    │  ← fixed
├──────────────────┤
│  MENU            │
│  Nav Items       │  ← scrollable (flex-1 overflow-y-auto)
│  ...             │
├──────────────────┤
│  LEADERBOARD     │  ← fixed bottom (MiniLeaderboard)
├──────────────────┤
│  Sign Out        │  ← fixed bottom
└──────────────────┘
```

### Scope
- 1 file modified: `DashboardSidebar.tsx`
- Light theme color swap + layout reorder
- MiniLeaderboard already handles light mode

