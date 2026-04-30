
## Fix Search Bar Layout

Two issues to fix in `src/components/HeroSearchBar.tsx`:

### 1. Show "Protect Money" button on all screen sizes
Currently the button has `hidden sm:flex` which hides it on mobile. Remove `hidden sm:flex` and replace with `flex` so it's always visible, matching the reference image.

### 2. Ensure "Smart Assistant" text is always visible and search input fills remaining space
- Remove `min-w-[140px] md:min-w-[260px]` from the search input wrapper so it doesn't force the Smart Assistant button to shrink
- Keep `flex-1` so the input still takes available space
- Remove the standalone `Search` icon (magnifying glass between mic and Protect Money) to save horizontal space — the search intent is already clear from the placeholder text
- Hide the mic/voice button on small screens (`hidden sm:flex`) to give more room to the core elements

These changes ensure the layout matches the reference: Smart Assistant (left) | Search input (stretches) | Protect Money (right), on all screen sizes.
