

## Add Persistent User Avatar Anchor Across All Views

### Problem
The user's avatar only appears in the desktop navbar dropdown. On mobile, there is zero identity presence — no avatar in the top navbar, bottom nav, PageHeader, or DashboardHeader. Users lose their "personal landmark" and feel disconnected.

### Solution
Add a small, tappable avatar button as a **persistent personal anchor** in three key locations:

```text
MOBILE NAVBAR (top bar):
┌─────────────────────────────────────────┐
│ ☰  [LOGO]          🔍 🌐 🔔 [Avatar]  │
└─────────────────────────────────────────┘

BOTTOM NAV (replace Portfolio with Avatar):
┌─────────────────────────────────────────┐
│ Reviews  Categories  [R8]  Community 👤 │
└─────────────────────────────────────────┘
       Portfolio icon → User Avatar

PAGE HEADER (rightSlot auto-inject):
┌─────────────────────────────────────────┐
│ 🏠 ← Reviews                   [Avatar]│
└─────────────────────────────────────────┘

DASHBOARD HEADER (add avatar):
┌─────────────────────────────────────────┐
│ ☰  🏠 > Dashboard     🪙 🌐 🔔 [Avatar]│
└─────────────────────────────────────────┘
```

### Behavior
- **Logged in**: Shows user's avatar photo or initials. Tap → navigates to dashboard (mobile) or opens dropdown (desktop).
- **Guest**: Shows a generic user icon with a subtle pulse/ring. Tap → navigates to `/auth`.
- Avatar has a `ring-2 ring-primary/30` glow so it's always noticeable as "your spot."

### Files to Change

**1. New: `src/components/UserAvatarAnchor.tsx`**
- Reusable component that reads `useAuth()` for user/profile data
- Props: `size?: 'sm' | 'md'`, `showDropdown?: boolean`
- When `showDropdown=true` (desktop): wraps in DropdownMenu with Dashboard/Messages/Sign Out
- When `showDropdown=false` (mobile): simple tap → dashboard or `/auth`
- Guest state: renders a `UserCircle` icon with subtle animated ring to invite sign-up

**2. Edit: `src/components/Navbar.tsx`**
- Mobile right actions (line ~202-249): Add `<UserAvatarAnchor size="sm" />` after NotificationBell
- Desktop right actions: Replace inline avatar/dropdown code (lines 120-152) with `<UserAvatarAnchor size="md" showDropdown />`

**3. Edit: `src/components/BottomNav.tsx`**
- Replace the Portfolio button (last item) with the avatar anchor
- Logged in: show user avatar image/initials, tap → dashboard
- Guest: show `UserCircle` icon, tap → `/auth`
- Keep "Portfolio" accessible from dashboard sidebar instead

**4. Edit: `src/components/PageHeader.tsx`**
- Auto-inject `<UserAvatarAnchor size="sm" />` into the right side of the header (after any `rightSlot` content)
- This ensures every standalone page shows the user's identity

**5. Edit: `src/components/DashboardHeader.tsx`**
- Add `<UserAvatarAnchor size="sm" />` to the right actions area (after NotificationBell)

### Design Details
- Size `sm` = 32px (h-8 w-8), size `md` = 36px (h-9 w-9)
- Ring styling: `ring-2 ring-primary/20 hover:ring-primary/40` for logged-in, `ring-2 ring-primary/30 animate-pulse` for guest
- Uses existing `Avatar`/`AvatarImage`/`AvatarFallback` components
- RTL-compatible, bilingual dropdown labels
- On mobile bottom nav, the avatar replaces the briefcase icon but keeps the same position for muscle memory

