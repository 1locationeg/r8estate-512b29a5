

## Plan: Minimal Reviews Carousel with Auto-Transition

### What Changes

**Make cards more compact/minimal:**
- Reduce card padding from `p-4` to `p-3`
- Reduce card width from `85vw/300px/340px` to `78vw/260px/290px`
- Make star icons smaller (`w-3 h-3` instead of `w-4 h-4`)
- Reduce comment text from `text-sm` to `text-xs`, tighten line height
- Shrink business logo from `w-6 h-6` to `w-5 h-5`
- Reduce gaps between elements (`gap-1.5` instead of `gap-2`)
- Remove the border-top separator on the footer row (use spacing only)
- Tighten the overall vertical spacing

**Improve auto-scroll/transition behavior:**
- Reduce auto-scroll interval from 5000ms to 4000ms for snappier transitions
- Add a CSS transition/fade effect on scroll for smoother card changes
- Keep existing hover/touch pause behavior

### File to Edit
- `src/components/ReviewsCarousel.tsx` — compact card styles and faster auto-scroll

### Technical Details
- All changes are Tailwind class adjustments — no structural/content removal
- Every existing element (stars, badge, comment, more/less, logo, name, time) stays
- Auto-scroll interval reduced from 5s → 4s

