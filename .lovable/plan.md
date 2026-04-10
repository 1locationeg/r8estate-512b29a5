

## Plan: Make Hero CTAs Side-by-Side on Mobile

### Change
In `src/pages/Index.tsx` line 248, change `flex-col sm:flex-row` to just `flex-row` so the buttons sit beside each other at all screen sizes. Also reduce padding/text size slightly so they fit well on small screens.

### Details
- **Line 248**: Change container from `flex flex-col sm:flex-row` → `flex flex-row`
- **Lines 251, 261**: Reduce horizontal padding from `px-5` → `px-3` to fit both buttons in ~390px width
- **Lines 255, 265**: Reduce text from `text-sm` → `text-xs` for mobile fit

### File Modified
- `src/pages/Index.tsx`

