## Goal

Design and build the **Professional Trust Page** — a public, LinkedIn-style profile for individual real estate professionals (sales agents, brokers, lawyers, accountants, marketers, photographers, vloggers, journalists, consultants). The page is the GTM "trojan horse": professionals get prestige, visibility, and social proof; the platform earns trust and a path to onboard their employers.

This plan covers **only the public Trust Page** (route + components + design tokens + sample data). The boosted sign-up flow already routes via `?type=business&kind=professional`. Dashboard and review-collection flow are out of scope for this iteration (noted as follow-ups).

## Route & Entry

- New public route: `/pro/:slug` (e.g. `/pro/ahmed-hassan`)
- Linked from: future search results, professional's shareable link, referrals, and the orange "Real estate experts edition" banner CTA after signup ("View your Trust Page →").
- SEO: dynamic `<title>`, meta description, OG image (reuse `og-community` edge function pattern later).

## Page Structure (top → bottom)

```text
┌─────────────────────────────────────────────────────────┐
│ COVER BANNER (gradient, professionals-orange theme)     │
│   Avatar (lg) · Verified shield · Pro tier badge        │
│   Name · Headline (e.g. "Senior Off-Plan Sales · NCC")  │
│   Location · Years exp · Languages                      │
│   ⭐ 4.9 (87 reviews) · Trust Score gauge · Response    │
│   [Contact] [Share] [Save] [Refer] [Download vCard]     │
├─────────────────────────────────────────────────────────┤
│ STICKY SUB-NAV: About · Experience · Reviews ·          │
│   Skills · Portfolio · Certificates · Education · FAQ   │
├─────────────────────────────────────────────────────────┤
│ LEFT COLUMN (2/3)              │ RIGHT COLUMN (1/3)     │
│                                │                        │
│ • About / Bio                  │ • Trust Snapshot card  │
│ • Specialties chips            │   (rating breakdown,   │
│ • Experience timeline          │    deals closed,       │
│ • Reviews (stars + filters)    │    avg response, etc.) │
│ • Skills + Endorsements        │ • Verified Socials hub │
│ • Portfolio / Deals closed     │   (IG, YT, TikTok,     │
│ • Certificates & Licenses      │    LinkedIn, FB, X)    │
│ • Education                    │ • Affiliated Company   │
│ • Recognitions / Awards        │   (auto-link to biz    │
│ • FAQ ("Ask me anything")      │    profile if exists)  │
│                                │ • "Hire me" CTA        │
│                                │ • Referral / Share     │
└─────────────────────────────────────────────────────────┘
```

## Components to Create

In `src/components/professional/`:
- `ProTrustHero.tsx` — cover, avatar, headline, KPIs, action bar
- `ProSubNav.tsx` — sticky anchor nav
- `ProAboutSection.tsx`
- `ProExperienceTimeline.tsx`
- `ProReviewsSection.tsx` — reuses existing review card primitives, star summary, filters by deal type
- `ProSkillsEndorsements.tsx` — chips with endorsement counts + "+1" button
- `ProPortfolioGrid.tsx` — deals closed / projects worked on (links to developer profiles)
- `ProCertificatesSection.tsx` — RERA, NCC, brokerage license, etc.
- `ProEducationSection.tsx`
- `ProAwardsSection.tsx`
- `ProFAQSection.tsx`
- `ProTrustSnapshotCard.tsx` — right rail
- `ProSocialHub.tsx` — verified social accounts
- `ProAffiliationCard.tsx` — current company link
- `ProHireCTA.tsx` — "Hire me / Request a call"
- `ProReferralShareCard.tsx`

Page: `src/pages/ProfessionalProfile.tsx` consuming the above with sample/mock data.

## Design System

- Theme: orange `--professionals` token (already defined) as accent, navy primary, gold for ratings.
- Glassmorphism cover (consistent with project's "Luminous Trust" vibe).
- All colors via semantic tokens. Logical properties (`ms-`, `pe-`, `text-start`).
- Mobile: vertical stack, sticky sub-nav collapses to horizontal scroll, 44px touch targets, no horizontal overflow at 390px.
- Desktop: two-column at `lg:` breakpoint, max-width 1100px.

## Sample Data

For this iteration, use a hard-coded mock professional in `src/data/mockProfessionals.ts` (one rich example covering all sections) so the page renders end-to-end without DB changes. Database schema for professionals is **out of scope** — flagged below.

## Out of Scope (follow-up tickets)

1. **DB schema**: `professional_profiles` table (1:1 with auth.users, distinct from `business_profiles`), `pro_reviews`, `pro_endorsements`, `pro_certificates`, `pro_experiences` — separate plan.
2. **Professional Dashboard** — separate plan after trust page is approved.
3. **Review collection flow** for professionals (deal-tied, client-only).
4. **Search index** integration so pros appear in global search.
5. **OG image edge function** for `/pro/:slug`.
6. **Analytics**: page views, share clicks, hire-CTA clicks.

## Naming

Public terminology stays consistent with project memory: this is a **Professional Trust Page**, never a "profile" externally. The professional themselves is referred to as a "Real Estate Expert" in copy. Internal route `/pro/:slug` is fine.

## Acceptance Criteria

- Visiting `/pro/ahmed-hassan` renders the full mock page on mobile (390px) and desktop (1100px) with no horizontal scroll.
- Sticky sub-nav scrolls to each section.
- All colors use semantic tokens; orange `--professionals` is the accent.
- Share button copies the canonical URL; Save/Refer wired to existing hooks where available (no-op toast otherwise).
- Bilingual-ready: every string lives in `src/i18n/locales/en.json` + `ar.json` under `professional.trustPage.*`.

## Confirm Before Building

Two quick choices that will shape the build:

1. **Scope of this iteration**: build the full page with all sections against mock data (recommended), or ship a leaner v1 (Hero + About + Reviews + Trust Snapshot + Hire CTA) and add the rest in v2?
2. **Real data wiring**: stay fully mock for this PR, or also add a `professional_profiles` table now so the page reads from the DB on day one?
