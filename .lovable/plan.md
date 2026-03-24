

## Plan: Categories Button Opens Full Category Grid with Businesses

### What's happening now
The "Categories" button in the bottom nav scrolls to `HeroCategoryItems` — a horizontal scrollable tab bar. This isn't what you want.

### What we'll build
When a user taps "Categories" in the bottom nav, they'll see the **BrowseCategoriesGrid** — a full grid showing all 18 categories (Units, Apps, Shares, Platforms, Brokers, Exhibitions, Channels, Law Firms, Valuation, Training, Auctions, Mortgage, Research, Tax, Management, Leasing, Blockchain, Lands) as cards, with the businesses/items listed under each category.

### Changes

**1. Create a dedicated `/categories` page**
- New file: `src/pages/Categories.tsx`
- Renders a clean header with back button + "Categories" title centered
- Uses the existing `BrowseCategoriesGrid` component
- When a user taps a sub-item, it navigates back to home and opens the `ItemDetailSection` for that item
- When a user taps a category header, it navigates home and scrolls to that category in `HeroCategoryItems`

**2. Update `BottomNav.tsx`**
- Change the Categories button to `navigate("/categories")` instead of scrolling to the hero section
- Highlight it as active when on `/categories`

**3. Update `src/App.tsx`**
- Add route: `/categories` → `Categories` page

### Technical details
- The `BrowseCategoriesGrid` already imports `categories` from `HeroCategoryItems` and renders all 18 segments with their items — we reuse it as-is
- Navigation from the categories page back to item details uses URL params or navigation state

