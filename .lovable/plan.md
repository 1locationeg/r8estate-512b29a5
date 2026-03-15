

## Plan: Frictionless Auth — Simplify Sign In / Sign Up

### Problem
The current auth page has too many steps and choices upfront: account type toggle, email form with multiple fields, mode switching. This creates friction for new users.

### Approach: "Google-first, one-tap" pattern
Follow the pattern used by Uber, Airbnb, and modern apps — make the primary action a single button tap, defer complexity to later.

### Design

**New simplified Auth page layout:**

```text
┌─────────────────────────────┐
│        R8ESTATE logo        │
│                             │
│   "Continue to R8ESTATE"    │
│   "Sign in or create your   │
│    account in one tap"      │
│                             │
│  ┌───────────────────────┐  │
│  │ 🔵 Continue with Google│  │  ← Primary CTA (large)
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🍎 Continue with Apple │  │  ← Secondary CTA
│  └───────────────────────┘  │
│                             │
│  ──── or use email ──────   │
│                             │
│  ┌───────────────────────┐  │
│  │ ✉  Continue with Email │  │  ← Expands email form
│  └───────────────────────┘  │
│                             │
│  "Are you a developer?"     │
│  "Register your business →" │  ← Small text link
│                             │
│  Terms of Service · Privacy │
└─────────────────────────────┘
```

### Key Simplifications

1. **Remove the account type toggle from the default view** — most users are buyers. Business registration becomes a small text link at the bottom that navigates to `/auth?type=business`.

2. **Remove sign-in vs sign-up toggle** — Google/Apple handle both automatically. For email, show a single "Continue with Email" button that expands an inline form. The form auto-detects if the email exists (attempt sign-in first, if "Invalid credentials" show password field; if new user, show signup fields). Actually, to keep it simple: expand to show email + password, with a small "New here? Create account" toggle only within the expanded section.

3. **Add Apple Sign-In** — supported by Lovable Cloud, adds a second one-tap option.

4. **Email form starts collapsed** — only expands when user clicks "Continue with Email", reducing visual clutter.

5. **Business flow preserved** — clicking "Register your business" shows the full form with company name field, but this is a secondary path.

### Changes

#### `src/pages/Auth.tsx` — Full rewrite of the UI
- Default view: logo + 3 buttons (Google, Apple, Email) + business link
- Email button expands inline form (email + password, with sign-in/sign-up toggle inside)
- Business mode (via `?type=business` or link click): shows account type prominently + company name field
- Keep all existing logic (role sync, redirects, validation) but reorganize the UI

#### `src/contexts/AuthContext.tsx` — Add `signInWithApple` method
- Use `lovable.auth.signInWithOAuth('apple', ...)` similar to Google implementation

#### `src/i18n/locales/en.json` + `ar.json` — New keys
- `auth.continueGoogle`, `auth.continueApple`, `auth.continueEmail`, `auth.orUseEmail`, `auth.registerBusiness`, `auth.areYouDeveloper`

### Files to Edit
- `src/pages/Auth.tsx` — Redesign UI
- `src/contexts/AuthContext.tsx` — Add Apple sign-in
- `src/i18n/locales/en.json` — New translation keys
- `src/i18n/locales/ar.json` — New translation keys

