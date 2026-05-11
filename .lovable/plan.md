## Goal
When users arrive from "RE Professionals" card (`/auth?type=business&kind=professional`), keep the big **"Business Account"** title but add a clear sub-line — in an **orange/amber accent** (using the existing `--professionals` token), not green — that signals this is for individuals, not companies.

## Changes

### 1. `src/components/AudienceSegmentCards.tsx`
- Update professionals CTA: `"/auth?type=business"` → `"/auth?type=business&kind=professional"`

### 2. `src/pages/Auth.tsx`
- Add `const isProfessionalMode = isBusinessMode && searchParams.get('kind') === 'professional'`
- Import `HardHat` icon
- In the green "Business Account" banner section:
  - When `isProfessionalMode`:
    - Swap `Building2` → `HardHat`
    - Swap green tokens (`--business-border`, `bg-green-*`) → orange `--professionals` token
    - Title: **"Business Account"** (unchanged, big)
    - Sub-line below in smaller italic text: *"✦ Professional edition — built for individual brokers, agents & consultants, not companies"*
  - Otherwise: render existing green company variant unchanged
- Update headline copy slightly when professional: e.g. "Join as a Real Estate Professional" instead of generic business headline (keeps the same "Business" label in the banner, but personalizes hero copy)
- Persist `kind` when toggling between buyer/business mode links so it isn't lost on re-render
- Optionally store `localStorage.setItem('oauth_account_kind', 'professional')` before Google OAuth so the flavor survives the redirect (no DB write — purely cosmetic)

### 3. i18n strings
Add to `src/i18n/locales/en.json` and `ar.json`:
- `auth.business.professional.subtag` — "Professional edition — built for individuals, not companies"
- `auth.business.professional.headline` — "Join as a Real Estate Professional"

## Out of scope
- No DB schema changes — account type stays `'business'`
- No new dashboard variant
- No `kind` column on `business_profiles`
- "Professional" is presentation-only via URL param

## Visual result
```text
┌─────────────────────────────────────┐
│  [HardHat icon — orange]            │
│  Business Account                   │
│  ✦ Professional edition —           │
│    built for individuals,           │
│    not companies                    │
└─────────────────────────────────────┘
```
Orange accent (`hsl(var(--professionals))`) clearly differentiates from the green company-business banner without losing the prestigious "Business Account" label.