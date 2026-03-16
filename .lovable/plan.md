

## Make Search Dropdown Items Compact on Mobile

### Changes to `src/components/SearchSuggestions.tsx`

**1. Reduce item padding and spacing on mobile**
- Change item container padding from `px-4 py-3.5` to `px-3 py-2.5 md:px-4 md:py-3.5`
- Reduce gap in the main button row from `gap-4` to `gap-2.5 md:gap-4`

**2. Shrink logos on mobile**
- Change logo size from `w-11 h-11` to `w-9 h-9 md:w-11 md:h-11`
- Reduce verification badge size proportionally: `w-4 h-4 md:w-5 md:h-5` with smaller check icon

**3. Compact star ratings on mobile**
- Reduce star icon size: `w-3 h-3 md:w-4 md:h-4`
- Reduce rating text size: `text-xs md:text-sm`

**4. Compact action buttons on mobile**
- Reduce action row margin: `mt-2 md:mt-2.5`
- Reduce left offset for actions: `ms-[46px] md:ms-[60px]`
- Hide text labels ("Write Review", "Compare") on mobile, showing only icons
- Use smaller button heights on mobile: `h-6 md:h-7`

**5. Reduce dropdown max height on mobile**
- Change container max-height: `max-h-[320px] md:max-h-[400px]`

### Technical Details
- All changes are responsive using Tailwind breakpoint prefixes (`md:`)
- No new dependencies or components needed
- Only `src/components/SearchSuggestions.tsx` is modified

