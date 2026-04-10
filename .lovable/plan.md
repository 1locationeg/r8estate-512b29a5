

## Plan: Reviews Discovery with Business & Category Filters

### What We're Building

Transform the Reviews page from a flat list into a discoverable review directory where users can filter by **business name** (cloud tags) and **category** (chips), in addition to the existing star rating filter.

### UI Layout (top to bottom)

1. **Stats bar** — unchanged
2. **Search input** — new, small search bar to quickly find a business name
3. **Business cloud tags** — a wrap of pill/cloud tags showing all businesses that have reviews (e.g. "Palm Hills", "CIB Home Loans", "1 LOCATION"), with review count badges. Clicking one filters to that business. Active tag is highlighted.
4. **Category filter chips** — horizontal scroll of the 18 categories from `BUSINESS_CATEGORIES`. Only show categories that have at least one reviewed business. Clicking filters reviews to businesses in that category.
5. **Star rating filter** — existing `ReviewFilters` component, unchanged
6. **Reviews list** — filtered results

### Data Strategy

- Fetch reviews with `developer_id` and `developer_name` (already available)
- Fetch `business_profiles` to get category mappings per `developer_id` (join client-side)
- Extract unique businesses from reviews to build cloud tags
- Map business → categories to build category filter
- For mock reviews, use `developerId` to look up mock developer data

### Files to Edit

1. **`src/pages/Reviews.tsx`**
   - Add state: `selectedBusiness` (string | null), `selectedCategory` (string | null), `businessSearch` (string)
   - Fetch `business_profiles` (id, company_name, categories) on mount
   - Build `businessMap`: developer_id → { name, categories }
   - Extract unique businesses from combined reviews
   - Add `filteredReviews` logic: chain business → category → star filters
   - Render new UI sections: search, business clouds, category chips

2. **`src/components/ReviewFilters.tsx`** — no changes needed (star filter stays as-is)

3. **`src/i18n/locales/en.json`** — add keys: `reviews.searchBusiness`, `reviews.allBusinesses`, `reviews.allCategories`, `reviews.filterByBusiness`, `reviews.filterByCategory`

4. **`src/i18n/locales/ar.json`** — Arabic translations for same keys

### UX Details

- Business cloud tags: wrapped flex, pill-shaped, showing `name (count)`, scrollable on mobile
- Search filters the cloud tags in real-time
- Category chips: only visible categories (those with reviews), horizontal scroll
- Clicking a business tag or category is a toggle (click again to deselect)
- All three filters (business, category, stars) work together as AND filters
- Empty state updates to reflect active filters

