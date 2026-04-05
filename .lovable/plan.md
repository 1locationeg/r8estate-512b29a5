

## Plan: Multi-Category Business Assignment & Category-Aware Trust Metrics

### Problem
1. All dynamic business profiles are hardcoded as `"developers"` category
2. Admin has no way to assign/change categories for a business
3. A business can only belong to one category
4. Trust category bars show generic developer metrics regardless of actual business type

### Solution

#### 1. Database: Add `categories` column to `business_profiles`
- Add a new `text[]` column `categories` (default `'{}'`) to `business_profiles` table
- This allows a business to belong to multiple categories (e.g., "apps", "brokers", "developers")
- Update the `public_business_profiles` view to expose this column

**Migration SQL:**
```sql
ALTER TABLE public.business_profiles 
  ADD COLUMN categories text[] NOT NULL DEFAULT '{}';

-- Update the public view
CREATE OR REPLACE VIEW public.public_business_profiles AS
  SELECT id, company_name, location, logo_url, website, 
         specialties, year_established, description, categories
  FROM public.business_profiles
  WHERE is_reviewable = true OR is_reviewable IS NULL;
```

#### 2. Admin UI: Category Picker in `AdminUserDetailSheet`
- Add a multi-select category picker below the "Description" field
- Available categories: Developers, Apps, Brokers, Units, Projects, Locations, Property Types, Categories (matching `SearchCategory` type)
- Each category rendered as a toggleable chip/badge — click to add/remove
- Selected categories are highlighted; saved with the profile
- The **first** category in the array is treated as the "primary" category

#### 3. Update `businessProfileSearch.ts`
- Read the `categories` array from the profile row
- Use the first category as the `SearchItem.category` (instead of hardcoded `"developers"`)
- Pass all categories in `meta.categories` for multi-category display

#### 4. Update `ItemDetailSection` Trust Category Bars
- When rendering a dynamic business profile, use `item.category` to pick the correct metric keys via `getCategoryMetricKeys()`
- This already works once the category is correct — the fix is upstream in step 3

#### 5. Update `EntityPage.tsx`
- Ensure the Supabase query for `public_business_profiles` also selects the `categories` column
- Pass it through to `mapPublicBusinessProfileToSearchItem`

### Files to Change
| File | Change |
|------|--------|
| Migration SQL | Add `categories text[]` column, update view |
| `src/components/AdminUserDetailSheet.tsx` | Add category toggle chips UI + save logic |
| `src/lib/businessProfileSearch.ts` | Use `categories[0]` as primary category |
| `src/pages/EntityPage.tsx` | Select `categories` in query |
| `src/components/SearchSuggestions.tsx` | Select `categories` in remote search query |

### Admin Workflow
1. Open Admin Dashboard → Users tab
2. Click "Manage" on a user → Detail sheet opens
3. Upgrade user to "Business" role → Create profile
4. In the profile editor, toggle category chips (e.g., select "Apps" instead of "Developers")
5. Save → Entity page now shows correct category label, icon, and trust metric bars

