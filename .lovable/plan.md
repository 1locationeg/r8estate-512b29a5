

## Redesign Registration Slots Banner — Floating Overlay with Color-Sensitive Progress

### What changes

Replace the inline banner with a **floating overlay card** (bottom-right corner, like a toast/notification) that:
- Stays visible but **does not block** the sign-up form
- Has a **dismissible close button** (user can hide it)
- Shows the **color-sensitive progress bar** matching the admin panel's 4-tier system:
  - **Green** (>60% remaining) → calm, plenty of slots
  - **Amber** (30–60%) → moderate urgency
  - **Orange** (10–30%) → filling up
  - **Red** (<10%) → pulsing urgent warning
- Includes a subtle entrance animation (slide-in from bottom)
- When slots are full, shows a "sold out" state but still allows sign-up (doesn't block the form)

### Files to edit

**`src/components/RegistrationSlotsBanner.tsx`** — Full rewrite:
- Position: `fixed bottom-4 right-4 z-50` (or `left-4` in RTL)
- Card with shadow, rounded corners, close button (X)
- Progress bar color driven by `remainPct` thresholds (same logic as admin panel)
- Label color matches bar color
- Dismissible via local state (close button sets `dismissed=true`, returns null)
- Animate in with `animate-slide-in` or Tailwind transition

**`src/pages/Auth.tsx`** — Minor: remove the banner from inline position, keep the import (it's now fixed-position so placement in JSX doesn't matter, but move it outside the form card area)

### No other files needed
No database or admin changes — just the public-facing component redesign.

