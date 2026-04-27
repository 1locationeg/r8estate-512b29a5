
# R8ESTATE Founder-Grade Rebuild Spec — Single Markdown + SQL + JSON Bundle

A consolidated, dense, single-markdown documentation pass that supersedes the previous multi-file packs. Output is one ~80-page markdown file plus the executable SQL schema and machine-readable JSON, packaged into one ZIP.

## Final deliverable

`/mnt/documents/r8estate-rebuild-pack.zip` containing exactly 3 files:

1. **`r8estate-rebuild-spec.md`** — single markdown file, ~80 pages of dense content, 18 sections matching your outline exactly
2. **`r8estate-schema.sql`** — full executable SQL dump (tables + enums + RLS + RPCs + indexes + storage buckets + realtime publications)
3. **`r8estate-specs.json`** — machine-readable single JSON (routes, tables, components, edge functions, brand tokens, gamification rules, trust score formula)

Plus a one-line `README.md` inside the zip pointing to the markdown as the entry point.

## Markdown structure (18 sections, matching your request 1:1)

1. **Product Vision & History** — what R8ESTATE is, problem solved, vision evolution, 10-product ecosystem (R8 Map / Meter / Pulse / Check / Shield / Track / Voice / Intel / Certified / Keys), live vs. coming-soon, competitor study (Trustpilot, G2, RateMyAgent, BirdEye, Bayut, Property Finder, TrustAgent — what we copied/rejected per platform)
2. **Complete Tech Stack** — every library + version + purpose, frontend stack, Supabase backend, Lovable AI Gateway (Gemini 2.5 Flash + GPT-5 menu), pgvector for RAG, deployment (Lovable Cloud + meter.r8estate.com), all env vars
3. **Complete Database Schema** — every table with columns/types/nullable/defaults/FKs, all 10 enums, all RLS policies per table, indexes, all 38 RPCs with signatures, 6 storage buckets + policies, realtime channels, `has_role()` SECURITY DEFINER pattern, `parent_id` / `is_reviewable` hierarchy
4. **All Edge Functions** — all 17 functions (ai-chat, copilot-agent, verify-contract, review-analysis, review-integrity-check, review-to-social, trust-insights, trust-risk-scan, sitemap-xml, og-community, data-manifest, platform-insights, follow-review-reminder, weekly-leaderboard-reset, admin-list-users, community-ai-assist, review-ai-assist) — HTTP contract, AI model, prompt summary, rate limits, failure behavior, CRON vs user-triggered classification
5. **Complete Route Map** — every route from `routeRegistry.ts` + `App.tsx` with path, component, auth, role, audience, purpose
6. **Page-by-Page Specification** — every route documented (sections, data sources, components, auth gates, mobile vs desktop, RTL, empty/loading/error). Full detail for: Index, EntityPage, CopilotPage, BuyerDashboard, BusinessDashboard, AdminDashboard, Community, ReviewerProgram, NFCRedirect
7. **Component Catalog** — 80+ components with file path, props, render purpose, mount conditions, dependencies, design rationale. Full detail for HeroTrustShowcase, JourneyCorridor, WriteReviewModal (5 phases), ReviewCard (dynamic star colors), HighStakesReviewBanner (5 trigger conditions), EmbedWidget (5 widget types), ReviewerBadge (tier system)
8. **Trust Score Methodology** — 70/30 formula (logged reviews vs platform signals), pillar weights (Delivery 30 / Quality 25 / Communication 25 / After-Sales 20), recency decay, sample confidence damping, Authenticity Score (0–100), 5-step star color logic, worked example
9. **Gamification System** — 5 reviewer tiers + thresholds, 17 coin actions with exact amounts, anti-abuse + velocity limits, streak math + decay, daily missions engine, referral Insight Credits, High-Stakes Banner (Prospect Theory rationale + 5 triggers)
10. **Brand & Design System** — colors (#ed1b40 / #0a3d62 / #fac417 / #2d6a4f), typography (Montserrat + Noto Sans Arabic / Cairo / Tajawal), dynamic star colors via `ratingColors.ts`, glassmorphism specs, RTL with Tailwind logical properties only (ms/me/ps/pe — never ml/mr/pl/pr), Ammiya tone examples, mobile 390px + 44px touch, WCAG 2.2 AA, B2B sub-brand
11. **i18n Architecture** — `en.json` + `ar.json`, key namespaces, language switcher (localStorage), RTL `dir='rtl'`, bilingual copy examples
12. **AI Agent Architecture** — RAG pipeline (embedding → pgvector → Gemini → streaming), Sovereign Real Estate Advisor system prompt philosophy, tool-calling pattern in copilot-agent, cost guardrails per function, PII handling (never leaves edge)
13. **Security Architecture** — `has_role()` SECURITY DEFINER pattern, `public_*` views with `security_invoker = true`, contract canvas-side redaction, 3-layer moderation (regex → AI integrity → admin queue), rate limits inventory, auth (email/password + Google OAuth), the recent hardening migration (business_profiles email/phone column REVOKE + `get_business_contact` RPC + presence visibility + validate_deal_rating_stars search_path)
14. **NFC & Smart Links System** — full NFC tag lifecycle, `nfc_tags` + `nfc_tag_taps` schemas, `/nfc/:tagCode` routing logic, smart shortlinks (`/go/:code`), interstitial UX for custom URLs
15. **SEO Architecture** — SPA + crawler problem, current client-side state, recommended prerender/SSR migration path, sitemap-xml + og-community + data-manifest functions, JSON-LD schemas (Organization, Review, Dataset)
16. **GTM & Business Model** — B2C freemium → Pro tiers, B2B SaaS tiers, WhatsApp as primary distribution channel (why), Launch Pulse + Registration Slot Counter, referral economics, Egypt market context (1,500+ developers, RERA, off-plan psychology)
17. **Evolution Log** — chronological key decisions: initial concept → MVP → MLP positioning, features added/removed/redesigned with reasoning, architecture decisions (Lovable Cloud, pgvector, Journey Arc), things tried and reverted, current known issues + incomplete features (e.g. private review-attachments bucket, realtime channel auth, prerender)
18. **12-Week Rebuild Sprint Plan** — week-by-week milestones, definition-of-done per sprint, critical path dependencies, QA checklist (mobile / RTL / RLS / perf / a11y), Go/No-Go launch criteria

## Generation workflow

1. Live-DB introspection via `psql` to dump exact schema, RLS, RPCs, enums (so the SQL file is reproducible-fresh, not stale)
2. Read all 35 page files + 17 edge function `index.ts` + key components + `routeRegistry.ts` + `tailwind.config.ts` + `src/index.css` + `i18n/locales/*.json` in parallel for accuracy
3. Mine the 80+ memory files for design rationale, gamification rules, brand decisions
4. Write the markdown directly with Python (no PDF/DOCX rendering — markdown only per your spec) — heredoc into a single file, structured by the 18 sections above
5. Generate `r8estate-schema.sql` from psql dump + manual policy/RPC snippets
6. Generate `r8estate-specs.json` programmatically from the introspection data
7. Zip all 3 files + a 5-line README into `r8estate-rebuild-pack.zip`
8. Verify zip integrity, file count, and total size; report download path

## Constraints honored

- Pure read + document operation — zero changes to `src/`, zero schema changes, zero functionality changes
- Single markdown output (no PDF, no DOCX) — matches your "single downloadable file at /mnt/documents/r8estate-rebuild-spec.md" instruction
- Final 3-file ZIP at the exact path you requested
- Sensitive values (project ref, anon key) marked `REPLACE-ME` in env-var sections
- Lovable Cloud terminology in user-facing copy; Supabase technical names retained where engineers need them (schema, RPC names) per your "senior engineer audience" framing
- Memory rules respected: Categories / Developers / Projects naming, Tailwind logical properties, mobile 390px safety
