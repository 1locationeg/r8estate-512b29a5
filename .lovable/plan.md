

## Fix: Search Items Not Displaying in Focus Area

### Problem
When a user clicks search results in the hero search bar, only **developers** display inline on the page (in the focus/detail area). All other item types (projects, locations, brokers, apps, units, property-types, categories) **navigate away** to `/entity/:id`, breaking the focused experience.

### Root Cause
In `HeroSearchBar.tsx`, the `handleSelect` function splits behavior:
- `developers` → calls `onSelectDeveloper(item.id)` → shows `DeveloperDetailCard` inline ✓
- **Everything else** → `searchNavigate('/entity/${item.id}')` → leaves the page ✗

### Solution
Route all search result clicks through a unified callback so every item type displays inline in the focus area (using `ItemDetailSection`), keeping the user on the homepage.

### Files to Change

**1. `src/components/HeroSearchBar.tsx`**
- Add new prop: `onSelectItem?: (item: SearchItem) => void`
- Update `handleSelect`: instead of navigating to `/entity/:id` for non-developer items, call `onSelectItem(item)` which will display the item inline via `ItemDetailSection`
- Keep developer handling via `onSelectDeveloper` for backward compatibility

**2. `src/pages/Index.tsx`**
- Pass a new `onSelectItem` callback to `HeroSearchBar` that sets `specialViewItem` state
- This triggers `ItemDetailSection` to render inline (already wired up at line 383-389)
- Also clear `selectedDeveloperId` and `activeView` when an item is selected (same pattern as `HeroCategoryLinks.onSelectItem`)

### Behavior After Fix
- User clicks any search result → page scrolls to inline detail section showing that item
- Works for all categories: projects, locations, brokers, apps, units, etc.
- Developer items continue to show `DeveloperDetailCard` as before
- User stays on the homepage in the "focus area" instead of being navigated away

