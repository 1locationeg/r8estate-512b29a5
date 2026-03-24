

## Fix: Entity Pages Displaying Inconsistently

### Problem
When navigating to an entity page, some entities show full details (name, header, business details, trust score) while others skip straight to the summary and trust categories. This happens because:

1. Entities found in the **search index** have rich `meta` data (location, employees, capital, etc.) → `renderEntityDetails()` shows content
2. Entities found only in the **categories list** (e.g. Farida, Studio, Villa) are constructed in `EntityPage.tsx` **without `meta`** → `renderEntityDetails()` returns `null`, skipping that section

### Fix

**Update `EntityPage.tsx`** — when constructing a `SearchItem` from a category item, include the available data (`likes`, `shares`, `replies`, `trendScore`, `launchDate`) as `meta`:

```tsx
return {
  id: item.id,
  name: isRTL ? item.nameAr : item.nameEn,
  category: categoryToSearchCategory(cat.labelKey),
  subtitle: t(cat.labelKey),
  image: item.avatar,
  rating: item.rating,
  reviewCount: item.reviewCount,
  meta: {
    likes: item.likes,
    shares: item.shares,
    replies: item.replies,
    trendScore: item.trendScore,
    launchDate: item.launchDate,
  },
};
```

**Additionally**, the `ItemDetailSection` currently only renders entity details for specific categories (`developers`, `projects`, `brokers`, `apps`) that have category-specific fields. For generic categories (`units`, `categories`), it returns `null`. We need to add a fallback details renderer for entities that don't match those specific categories — showing whatever meta is available (e.g. trend score, launch date) and the category/subtitle info, so every entity page has a consistent layout with at least a basic details card.

### Changes

1. **`src/pages/EntityPage.tsx`** — Pass `meta` when constructing `SearchItem` from category items
2. **`src/components/ItemDetailSection.tsx`** — Add a fallback in `renderEntityDetails` for categories not explicitly handled (`units`, `categories`), showing available generic metrics like launch date, trend score, likes, and the category subtitle

