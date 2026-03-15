

## Plan: Update Reviews Carousel with New Uploaded Assets

### Goal
Replace the existing star and logo assets in the ReviewsCarousel with the newly uploaded versions.

### Current State
- **Existing**: `src/assets/r8-stars.png` (old house-shaped stars)
- **Existing**: `src/assets/logo-slogan.jpg` (current logo)
- **New uploads**: `user-uploads://stars-2.png` and `user-uploads://LOGO_word_SLOGAN.jpg`

### Implementation

**1. Replace Asset Files**
- Copy `user-uploads://stars-2.png` → `src/assets/r8-stars.png` (overwrite)
- Copy `user-uploads://LOGO_word_SLOGAN.jpg` → `src/assets/logo-slogan.jpg` (overwrite)

**2. No Code Changes Required**
The `ReviewsCarousel.tsx` component already imports and uses these exact asset paths:
```typescript
import r8Stars from "@/assets/r8-stars.png";
import logoSlogan from "@/assets/logo-slogan.jpg";
```

The component will automatically display the new images once the files are replaced.

### Visual Changes
- **Stars**: Will change from current house-shaped stars to the new yellow stars in blue squares
- **Logo**: Will update to the newly uploaded logo with slogan

