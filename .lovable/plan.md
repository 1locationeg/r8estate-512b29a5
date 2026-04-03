

# Smart Links — Trackable Link Manager for Admin Dashboard

## What This Is

A complete **link management and tracking system** that lets you create shareable R8ESTATE links, control how they appear on social media (title, description, image), and see full analytics on every click: who clicked, when, from where, what device, and referrer source.

## How It Works

1. **Admin creates a "Smart Link"** at `/admin/smart-links` — sets a slug (e.g. `r8estate.lovable.app/go/spring-promo`), destination URL, and SEO metadata (OG title, description, image).
2. **Visitor clicks the link** → hits a redirect route (`/go/:slug`) which logs the click (timestamp, referrer, device/browser via user-agent, country if available) into a `link_clicks` table, then redirects to the destination.
3. **Admin views analytics** — click count, device breakdown (mobile/desktop), referrer sources, time-series chart, per-link stats.

## Database Changes

### New table: `smart_links`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | Short path segment |
| destination_url | text | Where the link redirects to |
| og_title | text | Social preview title |
| og_description | text | Social preview description |
| og_image | text | Social preview image URL |
| is_active | boolean | Toggle on/off |
| created_by | uuid | Admin who created it |
| created_at | timestamptz | |

RLS: Admins can CRUD; anon can SELECT active links (needed for redirect).

### New table: `link_clicks`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| link_id | uuid FK → smart_links | |
| clicked_at | timestamptz | |
| referrer_url | text | `document.referrer` / `Referer` header |
| user_agent | text | Raw UA string |
| device_type | text | Parsed: mobile/desktop/tablet |
| browser | text | Parsed from UA |
| ip_country | text | Optional, from headers |

RLS: Admins can SELECT; anon can INSERT (the redirect page inserts).

## Frontend Changes

### 1. New redirect route: `/go/:slug`
- Added to `App.tsx` routes
- Lightweight component: fetches the `smart_link` by slug, inserts a click row, then does `window.location.href = destination`
- Parses `navigator.userAgent` to extract device type and browser before inserting

### 2. New component: `AdminSmartLinks.tsx`
Located at `/admin/smart-links` in the sidebar under **Content** group.

**Two views:**

**A) Links List**
- Table showing all smart links: slug, destination, click count, status toggle, edit/delete
- "Create Link" button opens a form

**B) Link Detail / Analytics** (click a row to expand or navigate)
- Total clicks, unique referrers
- Line chart: clicks over time (last 30 days)
- Pie/bar chart: device breakdown (mobile vs desktop vs tablet)
- Top referrers list
- Recent clicks table (time, referrer, device, browser)
- Editable SEO fields (OG title, description, image) with live preview card

### 3. Admin Dashboard integration
- Add sidebar item: `{ icon: <Link className="w-4 h-4" />, label: 'Smart Links', path: '/admin/smart-links' }` under Content group
- Add route: `<Route path="smart-links" element={<AdminSmartLinks />} />`

## File Summary

| Action | File |
|---|---|
| Migration | Create `smart_links` + `link_clicks` tables with RLS |
| New | `src/components/AdminSmartLinks.tsx` — admin UI |
| New | `src/components/SmartLinkRedirect.tsx` — `/go/:slug` handler |
| Edit | `src/App.tsx` — add `/go/:slug` route |
| Edit | `src/pages/AdminDashboard.tsx` — add sidebar + route |

