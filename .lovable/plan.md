

# SEO + AIO Optimization for R8ESTATE Meter

A pragmatic plan that respects what already exists (Vite/React stack — **not Next.js**), focuses on high-impact SEO/AIO gaps, and skips work that's already done. Out of ~15 requested items, ~6 are already built. We'll focus on the **9 that genuinely move the needle** for ranking + LLM discoverability.

## Reality check vs your prompt

| Your request | Status | Notes |
|---|---|---|
| Trust Meter radial gauge | ✅ Already built | `HeroTrustGauge`, `TrustScore`, `TrustGaugeMini` |
| 5-pillar Factor Breakdown | ✅ Already built | `TrustCategoryBar` on `EntityPage` |
| VS comparison engine | ✅ Already built | `CompareModal` (5-way compare) |
| Embed widget for backlinks | ✅ Already built | `/embed/widget/:token` + `BusinessWidgets` |
| Sitemap.xml | ⚠️ Partial | UI generates downloadable XML — not served as static `/sitemap.xml` |
| robots.txt | ⚠️ Exists but bare | No sitemap reference, no AI crawler rules |
| Next.js | ❌ Won't change | Stack is Vite + React Router; no SSR. Will use prerender-friendly meta + JSON-LD instead |
| JSON-LD per entity | ❌ Missing | **Build it** |
| Programmatic SEO titles | ❌ Missing | **Build it** |
| Data manifest for LLMs | ❌ Missing | **Build it** |
| Natural-language vector search | ❌ Missing | Big scope — defer (would need pgvector + embedding pipeline) |

## What we'll build (9 items)

### 1. Per-entity dynamic `<head>` (Programmatic SEO)
New `EntityMeta.tsx` component injected into `EntityPage.tsx`. Sets:
- `<title>` — `"{Developer Name} Trust Score {score} & Reviews 2026 | R8ESTATE Meter"`
- `<meta name="description">` — auto-generated from category + rating + review count + location
- Canonical URL — `https://meter.r8estate.com/entity/{id}`
- OpenGraph + Twitter cards (per-entity image, title, description)
- `hreflang` for `en` and `ar`

### 2. JSON-LD structured data per entity
Inject 3 schema types into entity pages:
- **`Organization`** (developer name, logo, location, sameAs links)
- **`AggregateRating`** (score, count, bestRating: 5)
- **`Review`** array (top 5 verified reviews with author, rating, body, datePublished)
- **`SoftwareApplication`** schema on the homepage (R8ESTATE Meter as a tool)

### 3. Static `/sitemap.xml` served from server
Edge function `sitemap-xml` returning live XML with `Content-Type: text/xml`, regenerated on request from DB + static index. URL: `https://meter.r8estate.com/sitemap.xml`. Includes `<lastmod>` per entity.

### 4. Beefed-up `robots.txt`
- Reference sitemap location
- Explicit allow for `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `OAI-SearchBot`
- Block crawl traps (`/admin/*`, `/buyer/*`, `/business/*`, `/messages`)

### 5. AIO data manifest at `/data-manifest.json`
Edge function returning a structured JSON document LLMs can ingest:
```json
{
  "@type": "DataManifest",
  "platform": "R8ESTATE Meter",
  "methodology": { "trustScore": "...", "pillars": [...] },
  "entities": { "developers_count": N, "reviews_count": N },
  "endpoints": { "sitemap": "...", "feed": "..." }
}
```
Plus a human-readable `/about-trust-meter` page documenting the Alpha Report methodology — gives LLMs a citable URL.

### 6. Semantic HTML5 upgrade on `EntityPage`
Wrap sections in `<article>`, `<section aria-label="trust-score">`, `<aside>` for related entities. Add `itemscope itemtype="..."` microdata as a fallback for crawlers that miss JSON-LD.

### 7. "Alpha Report" lead-gen CTA
New `AlphaReportModal` component on every entity page below the trust gauge:
- "Download Full Alpha Report" button
- Opens modal collecting email + phone (gated lead)
- Stores in new `alpha_report_leads` table
- Triggers existing PDF generator (`generateTrustReport.ts`) and emails it

### 8. "Last updated" urgency signal
Show `Last updated: {today}` near every trust score, pulling `updated_at` from `business_profiles`. Builds AI/SEO freshness signal.

### 9. Core Web Vitals quick wins
- Add `loading="lazy"` to all entity card images
- `<link rel="preload">` for hero font + LCP image in `index.html`
- Defer `TrackingManager` scripts until after first interaction
- Add `font-display: swap` to Google Fonts URL

## Database changes
- New `alpha_report_leads` table: `id`, `email`, `phone`, `entity_id`, `created_at`, RLS (insert open, select admin-only)
- Add `last_seo_indexed_at` timestamp on `business_profiles` (optional, for sitemap `lastmod`)

## Files

**Create**
- `src/components/EntityMeta.tsx` — per-entity head injector
- `src/components/EntityJsonLd.tsx` — JSON-LD script injector
- `src/components/AlphaReportModal.tsx` — lead-gen modal
- `src/pages/AboutTrustMeter.tsx` — methodology page (route `/about-trust-meter`)
- `supabase/functions/sitemap-xml/index.ts` — serves live sitemap
- `supabase/functions/data-manifest/index.ts` — serves AIO manifest
- Migration: `alpha_report_leads` table

**Edit**
- `src/pages/EntityPage.tsx` — wrap in semantic HTML, mount EntityMeta + JsonLd + AlphaReportModal
- `public/robots.txt` — sitemap ref + AI crawler rules
- `index.html` — preload hints, font-display
- `src/App.tsx` — register `/about-trust-meter` route
- `src/data/routeRegistry.ts` — add new route

## Out of scope (intentionally deferred)
- **Vector/semantic search** — needs pgvector setup + embedding pipeline + UI changes. Worth a separate dedicated pass.
- **Migrating to Next.js** — would require rewriting the entire app. The injection-based approach above gives ~80% of the SEO benefit (Google + Bingbot + most LLM crawlers now execute JS).
- **Per-project pages** — your routes already use `/entity/:id` for both developers and projects; same SEO treatment applies.

