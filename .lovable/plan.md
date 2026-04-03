

# Redesign Footer — Full Navigation + Newsletter + Admin-Managed Social Links

## What This Is

Replace the current minimal footer with a full-featured footer matching the reference design: dark background, newsletter subscription, organized link columns (Company, Legal, Support), social media icons, copyright bar, and admin control for social links and footer content.

## Layout (Reference Image)

```text
┌──────────────────────────────────────────────────────────────────┐
│  [Reviews Carousel - keep existing]                              │
├──────────────────────────────────────────────────────────────────┤
│  Subscribe to Our Newsletter     │  Company    │ Legal    │ Support│
│  description text                │  Our Story  │ Privacy  │ Help   │
│  [email input] [Subscribe btn]   │  Join Team  │ Terms    │ Service │
│                                  │  Contact Us │ Cookies  │ FAQ     │
│  Follow Us:                      │  Press Room │ Copyright│ Report  │
│  [fb][x][in][yt][ig][tt][etc]    │             │          │         │
├──────────────────────────────────────────────────────────────────┤
│  © 2026 R8ESTATE - All rights reserved.          [Sitemap]       │
└──────────────────────────────────────────────────────────────────┘
```

## Features

1. **Newsletter subscription** — email input stored in a new `newsletter_subscribers` DB table
2. **Link columns** — Company, Legal, Support with links to actual pages (some will be placeholder pages)
3. **Social media icons** — loaded from `platform_settings` (key: `footer_social_links`), admin-editable
4. **Admin panel** — new "Footer Settings" section in admin dashboard to manage social links (platform, URL pairs)
5. **Copyright bar** — kept with BrandLogo and Sitemap link

## Pages Needed for Footer Links

Most links need simple static pages. Create these as minimal placeholder pages:
- `/about` — Our Story
- `/careers` — Join Our Team
- `/contact` — Contact Us
- `/press` — Press Room
- `/privacy` — Privacy Policy
- `/terms` — Terms of Use
- `/cookies-policy` — Cookies Policy
- `/copyright` — Copyright Policy
- `/help` — Help Center
- `/customer-service` — Customer Service
- `/faq` — Frequently Asked Questions
- `/report` — Report a Problem

## Database Changes

1. **New table: `newsletter_subscribers`** — `id`, `email` (unique), `subscribed_at`, `is_active`
2. **platform_settings row** for `footer_social_links` — JSON array of `{ platform, url, enabled }` objects

## Admin Panel Addition

Add "Footer" section under Settings in admin sidebar → new `AdminFooterSettings` component:
- Manage social links (add/remove/edit platform + URL)
- Social platforms supported: Facebook, X/Twitter, LinkedIn, YouTube, Instagram, TikTok, Threads, Pinterest
- Toggle each link on/off

## File Changes

| Action | File | Details |
|---|---|---|
| Migration | DB | Create `newsletter_subscribers` table with RLS |
| Rewrite | `src/components/Footer.tsx` | Full redesign with newsletter, columns, social icons |
| New | `src/components/AdminFooterSettings.tsx` | Admin UI for social links |
| New | `src/pages/StaticPage.tsx` | Reusable static page shell for About/Privacy/Terms/etc. |
| Edit | `src/App.tsx` | Add routes for all new static pages |
| Edit | `src/pages/AdminDashboard.tsx` | Add Footer Settings nav item + route |

## Technical Notes

- Social icons use lucide-react icons where available, custom SVG for X/TikTok/Threads
- Newsletter subscribe does a simple insert into `newsletter_subscribers` with duplicate email handling
- Footer background uses dark navy (`bg-slate-900 text-white`) to match reference
- All footer links use `<Link to="...">` for SPA navigation
- Static pages use a shared `StaticPage` component with title + placeholder content

