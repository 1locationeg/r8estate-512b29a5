

# Sitemap Page

## What This Is

A public `/sitemap` page that lists every page and entity on the R8ESTATE platform in an organized, browsable layout. Users can also download the sitemap as an XML file (standard SEO sitemap format).

## Pages & Data Sources

The sitemap will aggregate:

1. **Static pages** — hardcoded list: Home, Auth, Reviews, Directory, Community, Leaderboard, Rewards, Deal Watch, Launch Watch, Categories, Messages, Install, Portfolio, Insights
2. **Entity pages** — pulled from `getSearchIndex()` (developers, projects, locations, brokers, apps, units, property-types, categories) → all render at `/entity/:id`
3. **Category items** — pulled from `categories` in `HeroCategoryItems.tsx` → also at `/entity/:id`

## UI Design

- **Header** with page title "Sitemap" and a "Download XML" button
- **Grouped sections** — one collapsible section per category (Pages, Developers, Projects, Locations, etc.)
- Each item is a clickable link to its actual route
- Shows item count per section
- Download button generates a standard `sitemap.xml` file with all URLs using `meter.r8estate.com` as the base domain

## File Changes

| Action | File | Details |
|---|---|---|
| New | `src/pages/Sitemap.tsx` | Full sitemap page with grouped links + XML download |
| Edit | `src/App.tsx` | Add lazy `/sitemap` route |
| Edit | `src/components/Footer.tsx` | Add "Sitemap" link in footer |

## Technical Notes

- XML download uses `Blob` + `URL.createObjectURL` with proper `text/xml` mime type
- Base URL for XML: `https://meter.r8estate.com`
- No database changes needed — all data comes from existing search index and static routes

