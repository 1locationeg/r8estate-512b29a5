

## Plan: Create R8 MAP Interactive Demo Page

### What it does
When clicking the "R8 MAP" product card on the Products page, it navigates to a new `/products/r8-map` route that shows an interactive Leaflet-based map demo with 24 real Egyptian projects, color-coded trust markers, a sidebar with search/filters, and a detail panel for each project.

### Changes

**1. New page: `src/pages/R8MapDemo.tsx`**
Convert the uploaded HTML into a React component:
- Leaflet map centered on Egypt with dark tile styling
- 24 projects with color-coded markers (green 80+, yellow 60-79, orange 40-59, red <40)
- Heatmap glow circles for risk concentration zones
- Clickable markers opening a slide-in detail panel (trust score, delivery status, delay, reviews, sentiment tags)
- Left sidebar with search input, filter chips (Trust Zone, Stage, Area), scrollable project list
- Top bar with "R8 MAP" branding, live badge, and stat chips
- HUD overlay showing market avg trust score and zone breakdown
- Use `react-leaflet` library (needs install) or load Leaflet via CDN script tag
- Dark theme using CSS variables matching the uploaded file's aesthetic
- Back link to `/products`

**2. Update `src/pages/Products.tsx`**
- Make the "R8 MAP" product row clickable with `onClick={() => navigate('/products/r8-map')}`
- Add a small "PREVIEW" or arrow indicator to show it's interactive
- Import `useNavigate` from react-router-dom

**3. Update `src/App.tsx`**
- Add lazy import for `R8MapDemo`
- Add route: `<Route path="/products/r8-map" element={<R8MapDemo />} />`

**4. Install dependency**
- `react-leaflet` + `leaflet` + `@types/leaflet` for the map

### Technical details

```text
/products page
  └── Click "R8 MAP" row → navigate("/products/r8-map")

/products/r8-map page
  ├── TopBar: "R8 MAP · Live Trust Intelligence Layer" + LIVE badge
  ├── Sidebar (300px, left)
  │   ├── Search input (filters project list)
  │   ├── Filter chips: Trust Zone / Stage / Area
  │   ├── Scrollable project list (click → highlight + open detail)
  │   └── Legend (score color ranges)
  ├── Map (Leaflet, dark tiles)
  │   ├── 24 numbered markers (color = trust score)
  │   ├── 5 heatmap glow circles
  │   └── Search bar overlay
  ├── Detail Panel (slide-in right, 280px)
  │   ├── Trust score circle + grade
  │   ├── Delivery status, delay, reviews
  │   └── Buyer sentiment tags
  └── HUD (bottom-right)
      ├── Market Avg Trust Score: 67/100
      └── Zone Breakdown: 18 Trusted / 21 Caution / 8 At Risk
```

The page is a full standalone dark-themed demo — self-contained with all 24 projects hardcoded, no database queries needed. Mobile: sidebar collapses, detail panel becomes a bottom sheet.

