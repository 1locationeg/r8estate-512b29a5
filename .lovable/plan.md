

## Plan: Create a "Businesses" Directory Page

### Overview
Create a new `/businesses` page that displays all business profiles from the database in a professional grid layout inspired by the Trustbob reference. The page features a left sidebar with filters (search, rating, categories, verification) and a right content area with paginated business cards. Each card links to the entity page (`/entity/:id`). Update navigation links throughout the site to point to this new page.

### Page Layout (Trustbob-inspired)

```text
┌──────────────────────────────────────────────────┐
│  PageHeader: "Explore high rated businesses"     │
├──────────┬───────────────────────────────────────┤
│ SIDEBAR  │  "All Businesses"    [Sort ▼] [⊞][≡] │
│          │  ┌────────┐┌────────┐┌────────┐       │
│ Search   │  │ Card 1 ││ Card 2 ││ Card 3 │       │
│ ──────── │  └────────┘└────────┘└────────┘       │
│ Rating   │  ┌────────┐┌────────┐┌────────┐       │
│ ○ 5★     │  │ Card 4 ││ Card 5 ││ Card 6 │       │
│ ○ 4★     │  └────────┘└────────┘└────────┘       │
│ ──────── │                                       │
│ Category │  [1] [2] [3] [>]  (pagination)        │
│ □ Apps   │                                       │
│ □ Devs   │  ┌─────────────────────────────┐      │
│ □ Broker │  │ Can't find a business?      │      │
│ ──────── │  │ + Add Business              │      │
│ Verified │  └─────────────────────────────┘      │
│ ○ Yes    │                                       │
│ ○ No     │  Popular searches: [chips...]         │
└──────────┴───────────────────────────────────────┘
│  Footer                                          │
└──────────────────────────────────────────────────┘
```

### Business Card Design
Each card shows: logo/avatar, company name, website domain, star rating with count, description snippet (2 lines), and a verified badge if applicable. Clicking navigates to `/entity/:id`.

### Data Source
- Fetch all rows from `public_business_profiles` view (or `business_profiles` table)
- Compute avg rating and review count per business from the `reviews` table
- Client-side filtering and pagination (12 per page)

### Files to Create/Edit

| File | Change |
|------|--------|
| `src/pages/Businesses.tsx` | **New** — Full page with sidebar filters, business card grid, pagination, "Add Business" CTA, popular category chips |
| `src/App.tsx` | Add lazy import + route `/businesses` |
| `src/components/Navbar.tsx` | Update "Businesses" nav link from `/directory` to `/businesses` |
| `src/components/Footer.tsx` | Add "Businesses" link |
| `src/data/routeRegistry.ts` | Add `/businesses` route entry |

### Filter Sidebar
- **Search**: text input filtering by company name
- **Rating**: radio buttons (Excellent 5★, Great 4★, Average 3★, Fair 2★, Poor 1★)
- **Categories**: checkboxes from the categories data (Apps, Developers, Brokers, etc.) — links to `/categories` page
- **Verification**: Verified / Unverified toggle

### Sorting
- Sort dropdown: Best Rating, Most Reviews, Newest, A-Z

### Pagination
- 12 businesses per page
- Numbered page buttons with prev/next arrows

### Mobile Responsive
- Sidebar collapses into a filter drawer/sheet on mobile
- Cards go from 3-column to 1-column grid

### Category Integration
- Category chips in sidebar and "Popular searches" section at bottom link to `/categories` with a filter param
- Maintains consistency with existing BrowseCategoriesGrid navigation

