

## Simplify Avatar Anchor — Reduce to Standard Minimal Positions

### Problem
The avatar appears in **5 places simultaneously**: mobile top navbar, bottom nav, PageHeader, DashboardHeader, and desktop navbar. This is over-engineered and cluttered. Standard apps (Gmail, Instagram, Airbnb) show the avatar in **1-2 strategic spots** max — typically in the top navbar only, with everything else accessible from the hamburger/side menu.

### Strategy
Follow the industry standard pattern:

```text
DESKTOP:  Avatar in top navbar only (with dropdown) ✓ keep
MOBILE:   Avatar in top navbar only               ✓ keep
BOTTOM NAV: Remove avatar, restore Portfolio/Menu  ✗ remove
PAGE HEADER: Remove avatar (navbar already has it) ✗ remove  
DASHBOARD HEADER: Remove avatar (redundant)        ✗ remove
```

The hamburger menu (MobileNavSheet) already contains the full user profile, dashboard link, messages, and sign-out — so the avatar in the top navbar is the single entry point, and everything else is redundant.

### Files to Change

**1. `src/components/BottomNav.tsx`**
- Remove `UserAvatarAnchor` from the last tab position
- Replace with a "More" or "Menu" button (3 dots / ellipsis icon) that opens the MobileNavSheet, OR restore a useful nav item like "Deals" or "Directory"
- This keeps the bottom nav focused on **content navigation**, not identity

**2. `src/components/PageHeader.tsx`**
- Remove `<UserAvatarAnchor>` from the right slot
- Keep only `rightSlot` content (page-specific actions) — the global navbar above already shows the avatar

**3. `src/components/DashboardHeader.tsx`**
- Remove `<UserAvatarAnchor>` from the right actions
- The dashboard sidebar already shows full profile info, and the navbar has the avatar

**4. `src/components/Navbar.tsx`** (keep as-is)
- Desktop: `UserAvatarAnchor` with dropdown — this is the **single** identity anchor ✓
- Mobile: `UserAvatarAnchor` in top bar — this is the **single** mobile identity anchor ✓

### Result
- **Desktop**: 1 avatar (top navbar with dropdown)
- **Mobile**: 1 avatar (top navbar) + full profile in hamburger menu
- Clean, standard, minimal — no visual clutter

