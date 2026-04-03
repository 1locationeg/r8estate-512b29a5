

# Auto-Updating Sitemap

## Problem

The sitemap has a hardcoded `STATIC_PAGES` array that gets out of sync whenever new routes are added to `App.tsx`. New entities already auto-update (via `getSearchIndex()`), but pages do not.

## Solution

Create a centralized **route registry** (`src/data/routeRegistry.ts`) that both `App.tsx` and `Sitemap.tsx` import from. This is the single source of truth — when you add a new page, you add it to the registry, and both the router and sitemap pick it up automatically.

Additionally, the sitemap will also pull in category items from `HeroCategoryItems.tsx` (which aren't in the search index) so nothing is missed.

## File Changes

| Action | File | Details |
|---|---|---|
| New | `src/data/routeRegistry.ts` | Central array of `{ name, path, isPublic }` for all public routes |
| Edit | `src/pages/Sitemap.tsx` | Import from registry instead of hardcoded list; also include HeroCategoryItems |
| Edit | `src/App.tsx` | Import route list from registry (for reference/consistency) |

## How the Registry Works

```typescript
// src/data/routeRegistry.ts
export const PUBLIC_ROUTES = [
  { name: "Home", path: "/" },
  { name: "Reviews", path: "/reviews" },
  { name: "Directory", path: "/directory" },
  // ... all public routes
];
```

- `Sitemap.tsx` imports `PUBLIC_ROUTES` — always in sync
- Entity items come from `getSearchIndex()` — already dynamic
- Category items from `HeroCategoryItems.categories` are merged in to catch any items not in the search index
- Adding a new page = add one entry to `routeRegistry.ts` + the route in `App.tsx` — sitemap updates automatically

## What Auto-Updates

1. **Pages** — driven by `PUBLIC_ROUTES` registry (single source of truth)
2. **Entities** (developers, projects, etc.) — driven by `getSearchIndex()` (already dynamic)
3. **Category items** — driven by `categories` from `HeroCategoryItems.tsx` (merged + deduplicated)
4. **XML download** — regenerated on every click from the same live data

