

# Apply Full Business Theme When User Switches to Business Mode

## Problem
When a user toggles to "Business" mode on the homepage, the content still uses the buyer's navy/primary color palette. Cards, stats, CTAs, icons, gradients, and the hero section all remain in the buyer theme. The user should feel an immediate visual shift — everything should turn "Forest Green" to signal they're in a different world.

## Approach
Wrap the entire business section in a CSS class (e.g., `business-mode`) that overrides CSS custom properties, flipping `--primary`, `--accent`, and related tokens to the business green palette. This way, every component inside automatically inherits the business theme without editing each individual component.

## Changes

### 1. Add Business Mode CSS Override (`src/index.css`)
Add a `.business-mode` class that remaps core CSS variables:
- `--primary` → business green (`93 72% 25%` / #3B6D11)
- `--primary-foreground` → white
- `--accent` → lighter business green
- `--secondary` → business fill (#EAF3DE)
- Subtle green-tinted backgrounds

This single class cascades through all child components (buttons, badges, cards, stats, gradients).

### 2. Apply `business-mode` class to Industry Section (`src/pages/Index.tsx`)
- Wrap the entire `userMode === "industry"` block (lines 408–503) in a `div` with `className="business-mode"`
- Update the hero card gradient from `from-primary/[0.03]` to use business-specific greens
- Change the CTA button from `bg-primary` to `bg-business-border` with `text-white`
- Update stat numbers from `text-primary` / `text-accent` to `text-business-border` / `text-business-foreground`
- Update icon backgrounds from `bg-primary/10` to `bg-business-border/10` with `text-business-border` icons
- Change the "Not a business?" banner from primary tints to business tints
- Update the hero `ai-glow` to use a green glow variant

### 3. Update Navbar Business Toggle Feedback (`src/components/Navbar.tsx`)
When in business/industry mode, tint the navbar bottom border green:
- Add a conditional class on the `<header>` to show a green bottom border when `userMode === "industry"`

### 4. Trust Badges Footer Section (`src/pages/Index.tsx`)
When in business mode, change the trust badge strip (lines 512–521) from `border-verified` / `border-accent` to business green variants.

## File Summary
| File | Change |
|---|---|
| `src/index.css` | Add `.business-mode` CSS variable overrides |
| `src/pages/Index.tsx` | Wrap industry section with `business-mode` class, update hardcoded colors to business tokens |
| `src/components/Navbar.tsx` | Add green border accent when in industry mode |

