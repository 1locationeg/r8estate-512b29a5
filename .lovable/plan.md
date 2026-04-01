

## Fix: Slider inline between developer name and trust label (same row)

Currently the layout is:
```text
Row: [🏠 Developer Name]     [Trust Label]
Row: [========= slider ===========]
```

The user wants everything on **one single line**:
```text
[🏠 Developer Name] [=== slider ===] [Trust Label]
```

### Changes — `src/components/HeroTrustShowcase.tsx`

1. **Merge the two containers** (name row + slider row) into a single `flex items-center` row
2. Developer name + house SVG on the left (flex-shrink-0)
3. Slider in the middle (flex-1, taking remaining space)
4. Trust label on the right (flex-shrink-0)
5. Remove the `mb-1` from the name row and the `mt-1` from the slider container
6. Remove the outer `px-[5%]` wrapper — the slider sits naturally between the two text elements
7. Adjust slider height to fit inline (keep `h-[18px]`)

### File: `src/components/HeroTrustShowcase.tsx` (lines ~480-598)

Replace the two-row structure with a single flex row containing: house+name → slider → trust label, all `items-center` aligned.

