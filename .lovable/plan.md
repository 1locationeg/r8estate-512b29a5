

# Apply Forest Green Business Theme Across Platform

## Summary
Add a dedicated "business green" color token to the design system, then apply it consistently to every Business-related button, tab, toggle, and CTA across all views (desktop and mobile).

## Color Spec
- Fill/Background: `#EAF3DE`
- Border + Icon: `#3B6D11`
- Text: `#27500A`

## Step 1 — Add CSS custom properties

In `src/index.css`, add new business color tokens under `:root` (and `.dark`):

```css
--business: 93 40% 90%;          /* #EAF3DE */
--business-foreground: 93 66% 17%; /* #27500A */
--business-border: 93 72% 25%;    /* #3B6D11 */
```

And in `tailwind.config.ts`, register them:
```
business: "hsl(var(--business))"
business-foreground: "hsl(var(--business-foreground))"
business-border: "hsl(var(--business-border))"
```

## Step 2 — Update all Business UI elements

Files and locations to update:

1. **`src/components/Navbar.tsx`** (3 places)
   - Line 87-93: Desktop "Business" mode toggle button — change from `border-primary/30 bg-secondary` to `bg-business border-business-border text-business-foreground`
   - Line 162-168: Desktop "For Businesses" CTA — change from `bg-accent` to `bg-business border border-business-border text-business-foreground`
   - Line 176-182: Mobile "Business" mode toggle — same green styling

2. **`src/components/ViewToggle.tsx`** (line 21-31)
   - Active "Business" tab — apply `bg-business border border-business-border text-business-foreground` instead of `bg-primary text-primary-foreground`

3. **`src/components/MobileNavSheet.tsx`** (2 places, lines 151-158 and 168-175)
   - "For Businesses" buttons — change from `border-primary text-primary` to `border-business-border text-business-foreground bg-business hover:bg-business/80`

4. **`src/pages/BuyerDashboard.tsx`** (lines 67-94)
   - "Upgrade to Business" CTA card — change gradient and button to use business green tokens

## Step 3 — Icon colors

Wherever `Building2` icon appears alongside these business elements, change from `text-primary` to `text-business-border` (the `#3B6D11` shade) for consistency.

## Files Modified
- `src/index.css` — add CSS variables
- `tailwind.config.ts` — register color tokens
- `src/components/Navbar.tsx` — 3 button style updates
- `src/components/ViewToggle.tsx` — active tab style
- `src/components/MobileNavSheet.tsx` — 2 CTA button styles
- `src/pages/BuyerDashboard.tsx` — upgrade CTA card

