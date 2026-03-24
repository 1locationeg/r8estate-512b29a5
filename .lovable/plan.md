

## Plan: Dedicated Entity/Business Pages

### What's needed
Currently, clicking a business/entity item opens an inline detail section or modal on the homepage. The user wants every entity to have its own URL page (e.g., `/entity/nawy`, `/entity/studio`) so users can navigate directly to any business.

### Changes

**1. Create `/entity/:id` page (`src/pages/EntityPage.tsx`)**
- Takes the entity `id` from URL params
- Looks up the entity in the search index (`getSearchIndex()`) by ID
- Also checks `categories` from `HeroCategoryItems` to find items not in the search index (covers all items)
- Renders a full-page layout: back button header, then the existing `ItemDetailSection` component with the resolved `SearchItem`
- Shows a "Not Found" state if no entity matches

**2. Add route in `App.tsx`**
- Add `<Route path="/entity/:id" element={<EntityPage />} />`
- Lazy-load the new page

**3. Update `BrowseCategoriesGrid.tsx` — navigate to entity page on item click**
- Instead of calling `onSelectItem` callback, use `navigate(`/entity/${item.id}`)` directly
- Keep `onSelectItem` as optional override for backward compatibility

**4. Update `HeroCategoryItems.tsx` — item clicks navigate to entity page**
- When a category item is clicked, navigate to `/entity/${item.id}` instead of opening inline detail

**5. Update `HeroSearchBar.tsx` / `HeroCategoryLinks` — search result clicks navigate to entity page**
- When selecting a search result that isn't a developer, navigate to `/entity/${item.id}`

### Technical details
- The `ItemDetailSection` already accepts a `SearchItem` and renders the full trust score, reviews, metrics, and actions — we reuse it as the page body
- For items that exist in `categories` (HeroCategoryItems) but not in `getSearchIndex()`, we construct a `SearchItem` from the `CategoryItem` data
- The entity page will include proper back navigation and the standard navbar/bottom nav from the app shell

