

## Plan: Replace Star Icons with Custom House-Star Asset in ReviewCard

The user wants to replace the Lucide `Star` icons in `ReviewCard.tsx` with their branded `r8-stars.png` asset, using the same dynamic `clipPath` technique already working in `ReviewsCarousel.tsx`.

### Changes to `src/components/ReviewCard.tsx`

1. **Import** `r8Stars` from `@/assets/r8-stars.png`
2. **Remove** unused imports: `Star` from lucide-react, `getStarColorClass` from ratingColors
3. **Replace** the star loop (lines 95-101) with the layered image approach:
   - Grayscale background image (empty stars)
   - Clipped foreground image based on `review.rating / 5 * 100`
   - Size: `h-5` / `100px` wide for good visibility at ReviewCard's larger layout

This is the exact same pattern used in `ReviewsCarousel.tsx` lines 185-188, just slightly larger to match the card's bigger layout.

### Optional

If the user wants to upload a **different** star asset (not the existing `r8-stars.png`), they can provide the image and we'll save it as a new asset. Otherwise we reuse the existing house-star asset.

