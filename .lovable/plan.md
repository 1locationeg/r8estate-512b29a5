

## Plan: Increase Category Icon Sizes on Mobile

The category grid icons are currently `w-10 h-10` on mobile and `w-11 h-11` on md+. With the available space on mobile (428px viewport), we can make them larger for better visibility.

### Changes

**File: `src/components/BrowseCategoriesGrid.tsx`**

1. Increase the icon circle from `w-10 h-10` to `w-14 h-14` on mobile (keeping `md:w-11 md:h-11` or bumping to `md:w-14`)
2. Increase the button column width from `w-14` to `w-16 md:w-18` to accommodate larger icons
3. Slightly increase the label text from `text-[9px]` to `text-[10px]` on mobile for better readability alongside the bigger icons
4. Adjust the count badge size proportionally

