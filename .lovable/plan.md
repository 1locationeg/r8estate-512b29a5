

# Move "More" Menu to Header, Replace with Portfolio in Bottom Nav

## Changes

### 1. `src/components/BottomNav.tsx`
- **Remove** the "More" button (lines 98-105) and the `MobileNavSheet` trigger/state (`menuOpen`, `setMenuOpen`)
- **Remove** the `MobileNavSheet` rendering block (lines 109-117)
- **Remove** the `MobileNavSheet` component definition (lines 122-229) — it stays but moves to be triggered from elsewhere
- **Add** a "Portfolio" button (using `Briefcase` or `FolderHeart` icon from lucide) that navigates to `/portfolio` (auth-gated: redirect to `/auth` if no user)
- Place it in the last slot where "More" was

### 2. `src/pages/Index.tsx` (mobile header, ~lines 208-219)
- **Add** a "More" hamburger menu button (`Menu` icon) to the right of `NotificationBell` in the mobile header actions
- Wire it to open the `MobileNavSheet` (import and use state)
- Import `MobileNavSheet` from BottomNav or extract it

### 3. `src/components/DashboardHeader.tsx`
- **Add** the same "More" menu button to the right of `NotificationBell` (for mobile only, `md:hidden`)
- Wire it to open `MobileNavSheet`

### 4. Extract `MobileNavSheet` to shared location
- Keep the `MobileNavSheet` component in `BottomNav.tsx` but **export** it so `Index.tsx` and `DashboardHeader.tsx` can import it
- Or move it to its own file for cleanliness

### Summary of bottom nav after change:
```text
Reviews | Categories | [Logo] | Insights | Community | Portfolio
```

Header mobile actions after change:
```text
[mode toggle] [search] [lang] [bell] [≡ more]
```

