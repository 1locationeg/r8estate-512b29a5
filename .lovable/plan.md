

## Add "For Businesses" Button to Mobile Navbar

Add a compact "For Businesses" CTA button with a right-arrow icon in the **mobile top bar** (the `< md` section of Navbar.tsx), positioned right after the language switcher. Uses the Forest Green business theme.

### What it does
- Shows a small pill-style button labeled "For Businesses →" using business theme colors (`bg-business`, `border-business-border`, `text-business-foreground`)
- Navigates to `/auth?type=business` so the user can sign up as business, claim, or upgrade
- Only visible when the user is **not already a business/admin** (no point showing it to existing business users)
- Uses `Building2` icon + `ArrowRight` or text arrow

### Changes

**File: `src/components/Navbar.tsx`**
- In the mobile nav section (line ~209, after `<NotificationBell />`), add a "For Businesses" button before the hamburger menu
- Conditionally hide it if `role === 'business' || role === 'admin'`
- Compact styling: `text-[10px]` or `text-[11px]`, rounded-full pill, business green colors

### Technical Details

```tsx
{/* After NotificationBell, before hamburger menu */}
{role !== 'business' && role !== 'admin' && (
  <button
    onClick={() => navigate("/auth?type=business")}
    className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full border border-business-border bg-business text-business-foreground font-bold text-[10px] transition-all hover:bg-business/80"
  >
    <Building2 className="w-3 h-3 text-business-border" />
    <span>For Businesses</span>
    <ArrowRight className="w-3 h-3" />
  </button>
)}
```

Single file edit, no new dependencies needed.

