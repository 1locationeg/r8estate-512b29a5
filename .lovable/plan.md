

# R8ESTATE — Founder-Grade Rebuild Documentation Pack v2

An upgraded, deeply-researched documentation bundle that goes beyond a code dump. Written as if I were the founding architect handing the entire vision — strategy, research, design system, data model, and implementation playbook — to a new programmer on day one.

## What changes vs. the v1 pack

| Dimension | v1 (Clone-Grade) | v2 (Founder-Grade) — this plan |
|---|---|---|
| Voice | Spec extracted from code | Architect's playbook with rationale for every decision |
| Competitor depth | List of 8 platforms | Deep teardown: Trustpilot, G2, Clutch, Judge.me, RateMyAgent, BirdEye, Capterra, GoodFirms, Gartner — feature matrix, monetization, moats, what we steal/avoid |
| Market research | Egypt market size paragraph | 15-page market chapter: Egypt off-plan TAM/SAM/SOM, RERA context, 1,500 developers landscape, trust deficit data, buyer psychology (Prospect Theory loss-framing) |
| Design system | Token table | Full design language doc: "Silent Luxury" rationale, color psychology per audience, glassmorphism math, motion principles, accessibility (WCAG 2.2 AA), RTL deep-dive |
| Data model | 57 tables listed | Every table with: purpose, columns, RLS, indexes, ERD diagrams per domain (8 domains), realtime channels, storage buckets |
| Edge functions | Purpose only | Full I/O contract, AI prompt, model choice rationale, cost/call, failure modes, retry strategy |
| Trust score | Formula mention | 3-page methodology with worked examples + how it compares to Trustpilot's TrustScore + G2's algorithm |
| Gamification | Points map | Full economy: 5 tiers, 17 actions, streak math, decay rules, anti-abuse, comparison to Reddit karma + Stack Overflow rep |
| GTM | Pricing tiers | Full launch playbook: 0→1K users (Launch Pulse), 1K→10K (referral economics), 10K→100K (B2B SaaS motion), unit economics, CAC/LTV model |
| Investor section | 1 page | 6-page pitch annex: problem/solution/market/moat/traction proxy/ask, valuation comps (Trustpilot $1.2B IPO, BirdEye $1B), term-sheet-ready data room outline |
| Rebuild playbook | Bootstrap order | 12-week sprint plan with weekly milestones, definition-of-done per feature, QA checklist, launch criteria |

## Deliverable bundle (one ZIP)

`/mnt/documents/r8estate-founder-pack-v2.zip` containing:

### 1. `01_R8ESTATE_Master_Spec_v2.pdf` (~140 pages, navy/gold branded, indexed)

**Chapter 1 — Vision & Origin Story** (4 pages)
- The "5M EGP anxiety" moment — why this exists
- MVP → MLP → MLP-with-moat thesis
- Brand promise: "TRUST PLATFORM" — what it means operationally

**Chapter 2 — Market Intelligence** (15 pages)
- Egypt off-plan: $1.58T (2025) → $2.0T (2029), 6.91% CAGR
- 1,500+ developers, RERA regulatory landscape, delayed-delivery epidemic
- 4 segments: New Cairo, North Coast, Sheikh Zayed, New Capital, Sokhna — buyer profiles per segment
- Buyer psychology: Prospect Theory loss-framing, decision anxiety stages, trust signals that convert
- Why now: post-2022 EGP devaluation, off-plan boom, social media review fatigue

**Chapter 3 — Competitive Teardown** (12 pages)
- Per-platform deep dive (Trustpilot, G2, Clutch, Judge.me, RateMyAgent, BirdEye, Capterra, GoodFirms, Gartner): business model, verification mechanism, monetization, what we copy, what we improve, what we reject
- Feature matrix: 40 features × 9 competitors
- R8ESTATE positioning map (axes: trust depth × industry specificity)
- Defensible moats: Verified Contract, Arabic Ammiya tone, Journey Arc UX, Egyptian developer database

**Chapter 4 — Personas, JTBD, Value Proposition** (8 pages)
- Reviewer (Ahmed) + Company Rep (Sara) full canvases — emotions, expectations, gains
- 4 secondary personas: B2B service provider, real estate professional, investor, buyer
- JTBD statements per persona with "when / I want to / so I can" structure
- Value Proposition Canvas per persona
- Empathy maps with Arabic-language verbatims

**Chapter 5 — Product Architecture** (10 pages)
- Information architecture: 35 routes mapped to Journey Arc (Research → Choose → Finance → Protect)
- Site map (visual diagram)
- Per-route table: path, purpose, audience (B2C/B2B/Pro/Service), auth gate, role gate, station, key components
- Dual-mode homepage logic (Buyer vs Industry)
- Side journey rail navigation principles

**Chapter 6 — Page-by-Page Specification** (28 pages)
- Every page (Index, Auth, EntityPage, Reviews, Community, Leaderboard, BuyerDashboard, DeveloperDashboard, AdminDashboard, Categories, DealWatch, LaunchWatch, CopilotPage, R8Match, FrictionlessReview, NFCRedirect, EmbedWidget, ReviewerProgram, Rewards, Insights, Portfolio, R8MapDemo, Sitemap, etc.)
- For each: hero zone, layout zones, data hooks, modals, mobile vs desktop, RTL behavior, empty/loading/error states, ASCII wireframes
- Critical interactions called out (Progressive-Save review, Guest 3-min timer, High-Stakes CTA)

**Chapter 7 — Component Catalog** (10 pages)
- 80+ components grouped by domain: Hero, Trust, Review, Community, Admin, Widgets, Journey, Copilot/Agent
- Per component: props, state, dependencies, when to mount, design rationale

**Chapter 8 — Data Model & Backend** (14 pages)
- All 57 tables with full column tables, RLS summary, indexes
- 8 enums (app_role, deal_status, deal_type, launch_status, launch_type, launch_buyer_type, community_post_category, admin_permission_level, nfc_destination_type, nfc_approval_status)
- 38 RPC functions with signatures + purpose
- ERD diagrams per domain (Auth/Roles, Reviews & Trust, Community, Deals & Launches, NFC, Notifications, Gamification, Messaging)
- Storage buckets (avatars, review-attachments, business-assets) with policies
- Realtime channels (messages, notifications, community)

**Chapter 9 — Edge Functions** (8 pages)
- All 17 edge functions (ai-chat, copilot-agent, verify-contract, review-analysis, review-integrity-check, review-to-social, trust-insights, trust-risk-scan, sitemap-xml, og-community, data-manifest, platform-insights, follow-review-reminder, weekly-leaderboard-reset, admin-list-users, community-ai-assist, review-ai-assist)
- Per function: HTTP contract (request/response JSON), AI model + rationale, full system prompt, cost per call, rate limits, failure modes, observability hooks

**Chapter 10 — Trust Score Methodology** (5 pages)
- 70/30 weighted formula (logged reviews vs platform signals) with worked example
- Category pillar weights, recency decay, sample-size confidence interval
- 5-step star gradient color logic
- Authenticity Score (0–100) for verified contracts — bounding-box redaction model
- Snapshot tracking for trust-change alerts
- Comparison: Trustpilot's TrustScore vs G2's algorithm vs ours

**Chapter 11 — Gamification & Retention Economy** (7 pages)
- POINTS_PER_ACTION map (17 actions)
- 5 buyer tiers: New → Bronze → Silver → Gold → Elite (entry thresholds, perks per tier)
- Streak math + decay rules + anti-abuse
- Daily tasks engine
- Referral system: Insight Credits mutual-benefit economics
- 6-month retention nudge logic
- High-Stakes Review CTA (3-view threshold) — Prospect Theory rationale
- Comparison: Reddit karma, Stack Overflow rep, Duolingo streaks — what we borrow

**Chapter 12 — Brand & Design System** (10 pages)
- "Luminous Trust" / "Silent Luxury" identity rationale
- Full HSL token table (primary, secondary, journey stations, audience identity)
- Audience Color Identity: Buyers Navy, Business Forest, Services Teal, Pros Amber
- Journey Station palette: Research/Choose/Finance/Protect
- Typography: Montserrat scale, Arabic font stack, line-height ratios
- Glassmorphism specs (blur radius, opacity, border)
- Motion principles + keyframes catalog
- Mobile 390px safety rules with measurement guide
- RTL strategy: Tailwind logical properties only, mirroring rules, Ammiya vs Fusha tone guide
- Accessibility: WCAG 2.2 AA targets, contrast pairs, focus states, reduced-motion variants

**Chapter 13 — Security, Privacy, Compliance** (5 pages)
- RLS pattern (separate user_roles + has_role SECURITY DEFINER)
- public_* views with security_invoker = true
- Rate limits inventory (5 contract uploads/day, advisor unlock attempts, etc.)
- Content moderation 3-layer guard (regex → AI integrity → admin queue)
- GDPR consent gate, cookie tracking
- Contract redaction privacy guarantee (canvas-side, never persists raw)
- Egypt PDPL alignment, RERA disclaimer text

**Chapter 14 — AI & Agent Architecture** (5 pages)
- Lovable AI Gateway model menu + when to use which (Gemini 2.5 Flash for cost, GPT-5 for nuance)
- Tool-calling pattern for verify-contract + copilot-agent
- AI safety: PII never leaves edge, structured outputs only, fail-closed defaults
- Cost guardrails per function
- R8 Agent UX: pulse states, thinking indicators, nudge cards

**Chapter 15 — GTM, Monetization, Business Model** (10 pages)
- Business Model Canvas (full 9 blocks)
- Subscription tiers (Free / Pro / Enterprise) with feature matrix
- B2C funnel: guest preview → frictionless review → claim → buyer dashboard
- B2B funnel: claim business → upgrade → analytics → widgets
- Launch Pulse strategy: Registration Slot Counter (4-tier urgency)
- Referral economics: Insight Credits, viral coefficient target
- Unit economics: estimated CAC, LTV, payback period
- 12-week launch playbook with weekly milestones
- KPI tree: NPS, MAU, verified review %, trust report unlocks, B2B MRR

**Chapter 16 — Investor Annex** (6 pages)
- Problem / Solution / Market / Moat / Traction proxies
- Valuation comparables: Trustpilot ($1.2B IPO 2021), BirdEye ($1B), G2 ($1.1B)
- Cap table template, use of funds, 18-month roadmap
- Data-room outline (legal, financial, product, team)
- Term-sheet-ready summary

**Chapter 17 — 12-Week Rebuild Playbook** (8 pages)
- Sprint plan: weeks 1–2 (foundations), 3–4 (auth+profiles), 5–6 (reviews+trust), 7–8 (community+gamification), 9–10 (admin+widgets), 11–12 (AI agent + launch hardening)
- Definition-of-done per feature
- QA checklist (mobile 390px, RTL, a11y, RLS, performance)
- Launch criteria & go/no-go gates

**Appendices** (5 pages)
- A: Tech stack (React 18, Vite 5, Tailwind 3, TS 5, Supabase, Lovable AI Gateway)
- B: NPM dependencies with purpose per package
- C: Environment variables
- D: Folder structure & naming conventions
- E: i18n key namespace map (en + ar Ammiya)
- F: Glossary (Categories, Developers, Projects, Journey Stations, Trust Meter, Authenticity Score)

### 2. `02_R8ESTATE_Master_Spec_v2.docx`
Editable Word twin of the PDF. Same chapters, same diagrams, programmer can annotate/check off.

### 3. `03_schema.sql`
Single executable file: all enums, all 57 tables with constraints, all RLS policies, all 38 RPC functions, all triggers, storage bucket definitions, realtime publications. Drop-in to a fresh Supabase project.

### 4. `04_specs.json`
Machine-readable single JSON:
```text
{
  meta: { project, version, generated_at },
  routes: [...35],
  tables: [...57 with columns + rls + indexes],
  enums: [...10],
  rpcs: [...38 with signatures],
  edge_functions: [...17 with I/O contract + model + cost],
  components: [...80+ with props],
  i18n_namespaces: { en: [...], ar: [...] },
  brand_tokens: { colors, typography, spacing, radii, shadows, animations },
  gamification: { points_per_action, tiers, streaks, missions },
  trust_score: { formula, weights, decay, examples },
  storage_buckets: [...],
  realtime_channels: [...],
  rate_limits: [...]
}
```

### 5. `05_ERD_diagrams/` (folder, 8 PNG files)
Per-domain entity-relationship diagrams: Auth/Roles, Reviews+Trust, Community, Deals+Launches, NFC, Notifications, Gamification, Messaging.

### 6. `06_Wireframes/` (folder, 12 ASCII + PNG hybrid wireframes)
Key screens: Index (mobile + desktop), EntityPage, BuyerDashboard, DeveloperDashboard, AdminDashboard, FrictionlessReview, Community feed, Copilot, Reviews list, NFC redirect, Auth.

### 7. `07_Competitor_Matrix.xlsx`
40 features × 9 competitors with checkmarks + notes + R8ESTATE position column.

### 8. `08_Brand_Tokens.json`
Standalone design-tokens file in W3C Design Tokens format — drop into any tooling (Figma, Style Dictionary).

### 9. `README.md`
Quick start: prerequisites, bootstrap order (psql → seed → deploy edge functions → bun install → env → dev), where to start reading (Ch 5 + Ch 8 + Ch 12 first), 12-week sprint kick-off pointer.

## How it's generated (technical workflow)

1. **Database introspection** via `psql` (already-confirmed access): pull live columns/types for all 57 tables, all RLS policies, all RPC signatures, all enums → emit `schema.sql` and feed JSON
2. **Code introspection** via `code--view`: read all 35 page files + 17 edge function `index.ts` + key components + `tailwind.config.ts` + `src/index.css` + i18n locales
3. **Memory mining** via `code--view mem://`: read all 80+ memory files for design rationale, gamification rules, brand decisions, journey logic — these become the "why" behind every spec
4. **Competitor research** via `websearch`: validated facts on Trustpilot, G2, BirdEye, Clutch, Judge.me, RateMyAgent, Capterra, GoodFirms, Gartner (business model, verification, pricing, last-known valuation)
5. **PDF generation** via Python + `reportlab`: navy/gold cover, branded chapter dividers, syntax-highlighted code blocks, indexed TOC, page numbers, footer
6. **DOCX generation** via `docx-js` (per skill): same content, editable
7. **ERD diagrams** via Python + `graphviz`: per-domain visual relationships, exported as PNG
8. **Spreadsheet** via Python + `openpyxl`: competitor matrix
9. **Visual QA**: convert PDF first/middle/last pages + each ERD to PNG, inspect for layout breaks, fix-and-rerun loop
10. **Final ZIP** assembly + checksum + size report

Estimated output: ~140-page PDF, ~25 MB ZIP, 2-pass QA before delivery.

## Constraints honored

- Pure documentation extraction — zero code changes to the project
- Sensitive values (anon key, project ref) marked REPLACE-ME in env section
- All competitor claims web-verified, sourced inline
- "Lovable Cloud" terminology used throughout (never "Supabase" in user-facing copy per project rules)
- Naming stability: Categories / Developers / Projects (per memory)

## Out of scope (deliberate)

- Live screenshots of every page (would need browser automation; ASCII + PNG wireframes substitute)
- Pixel-exact Figma file (this is a written spec + tokens JSON — designer can build Figma from tokens)
- Migration runbook from current production data (this is a *rebuild* spec, not a *migration*)
- Video walkthrough (separate request if you want)

