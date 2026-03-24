

# Fix Broken Images — Replace External URLs with Reliable Local Avatars

## Problem
All developer logos, project images, reviewer avatars, and category item images use external Unsplash URLs. These frequently fail to load (rate limits, hotlink blocking, slow CDN), causing the fallback initials ("SOD", "Mou") to show instead of actual images.

## Solution
Replace all external Unsplash image URLs with programmatically generated SVG-based avatars using [DiceBear](https://www.dicebear.com/) or a local utility function. This eliminates external dependencies entirely.

### Approach: Local SVG Avatar Generator

Create a utility `src/lib/avatarUtils.ts` that generates deterministic, colorful SVG data URLs from a name string — no external requests needed. Different styles for different entity types:

- **Developer logos** — Bold initials on a branded gradient background (like the "SOD" fallback but designed to look intentional and polished)
- **Project images** — Property-themed color palette with project initials
- **Reviewer avatars** — Circular avatars with warm tones and person initials
- **Category items** — Icon-style avatars with category-appropriate colors

### Step 1 — Create `src/lib/avatarUtils.ts`
A pure function `generateAvatar(name: string, type: 'developer' | 'project' | 'reviewer' | 'category'): string` that returns an inline SVG data URL. Uses a hash of the name to pick from a curated color palette, ensuring each entity gets a consistent, unique color.

### Step 2 — Update `src/data/mockData.ts`
Replace all Unsplash `logo`, `image`, and `avatar` URLs with calls to `generateAvatar()`:
- 7 developer logos
- 8 project images
- ~20 reviewer avatars

### Step 3 — Update `src/components/HeroCategoryItems.tsx`
Replace all ~30+ Unsplash `avatar` URLs in the hardcoded category items with `generateAvatar()` calls.

### Step 4 — Improve fallback rendering across components
Update key components to use `generateAvatar()` as a reliable fallback when `AvatarImage` fails:
- `DeveloperCard.tsx`
- `DeveloperDirectoryCard.tsx`
- `DeveloperDetailCard.tsx`
- `DeveloperDetailModal.tsx`
- `FeaturedIdentitySpotlight.tsx`
- `ReviewCard.tsx`
- `BusinessProfileHeader.tsx`

## Files Modified
- `src/lib/avatarUtils.ts` — **new** — SVG avatar generator
- `src/data/mockData.ts` — replace all Unsplash URLs
- `src/components/HeroCategoryItems.tsx` — replace all Unsplash URLs
- `src/components/DeveloperCard.tsx` — use avatar utility for fallback
- `src/components/DeveloperDirectoryCard.tsx` — use avatar utility for fallback
- `src/components/DeveloperDetailCard.tsx` — use avatar utility for fallback
- `src/components/DeveloperDetailModal.tsx` — use avatar utility for fallback
- `src/components/FeaturedIdentitySpotlight.tsx` — use avatar utility for fallback
- `src/components/ReviewCard.tsx` — use avatar utility for fallback
- `src/components/BusinessProfileHeader.tsx` — use avatar utility for fallback

## Result
Every image on the platform will render instantly with zero external network requests — no more broken images or generic initials fallbacks.

