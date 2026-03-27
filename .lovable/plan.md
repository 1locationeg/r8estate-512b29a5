

# No-Signup Review Submission Page

## Overview
Build a standalone frictionless review page at `/review/:token` that uses BJ Fogg's micro-commitment pattern to progressively reveal form fields, maximizing completion rates. No account required — uses Supabase anonymous auth for session tracking.

## Architecture

```text
/review/:token (optional token)
  ┌─────────────────────────────┐
  │  R8-Trust Integrity Seal    │
  │                             │
  │  ★ ★ ★ ★ ★  (Step 1)       │
  │                             │
  │  ┌─ Textarea ─────────┐    │  ← slides in after star click (Step 2)
  │  │ كلمة حق تفرق..     │    │
  │  └────────────────────┘    │
  │                             │
  │  🎥 Video Review Toggle    │  ← Step 3
  │  "Record 30s → Gold Badge" │
  │                             │
  │  [ Submit Review ]          │
  │                             │
  │  🏅 Claim Verified Badge   │  ← Step 4 (post-submit)
  └─────────────────────────────┘
```

## Implementation Steps

### 1. Database: Create `pending_reviews` table
New migration to create a `pending_reviews` table for token-based pre-filled reviews:
- `id` (uuid, PK)
- `token` (text, unique) — shareable link token
- `first_name` (text)
- `project_name` (text)
- `developer_id` (text)
- `developer_name` (text)
- `created_at`, `expires_at`
- `is_used` (boolean, default false)
- RLS: public SELECT by token, service-role INSERT

Also add a `device_fingerprint` column to `guest_reviews` for IP clustering detection.

### 2. Edge Function: `review-integrity-check`
New edge function that:
- Accepts review text
- Uses Lovable AI (Gemini Flash) to score for marketing clichés (0-100 suspicion score)
- Returns `{ suspicion_score, flags[], suggestion }`
- Called before final submission

### 3. New Page: `src/pages/FrictionlessReview.tsx`
Standalone page (no navbar/bottom nav) with:

**Step 1 — The Hook:**
- Large animated 5-star rating (RTL-optimized, fills right-to-left in Arabic)
- Pre-filled greeting if token exists: "Hi {firstName}, how was {projectName}?"
- Anonymous auth via `supabase.auth.signInAnonymously()` on page load

**Step 2 — Progressive Reveal:**
- On first star click, slide-down animation reveals textarea
- Placeholder: "كلمة حق تفرق.. رأيك أمانة" (Arabic) / "Your honest opinion matters..." (English)
- Character counter, emoji quick-insert bar

**Step 3 — Video Toggle:**
- Toggle switch: "Record a 30s video to earn a Gold Badge 🏅"
- On enable: MediaRecorder capture (30s max), upload to `review-attachments` bucket
- Social proof message below toggle

**Step 4 — Identity Link (post-submit):**
- After successful submission, show "Claim your Verified Buyer Badge" CTA
- Links to signup/login flow, claims the guest review via existing `r8_pending_claim_review` mechanism

**Visual:**
- R8-Trust Integrity watermark (semi-transparent logo in corner)
- Device metadata capture (user-agent, screen size, language, timezone) stored as JSON in guest review
- Minimal, mobile-first, full-screen card layout
- Smooth CSS transitions between steps

### 4. Route Registration
Add `/review/:token?` route to `App.tsx` (lazy-loaded, outside bottom nav/guest timer chrome).

### 5. Integrity Guard Integration
Before submission:
- Call `review-integrity-check` edge function
- If suspicion_score > 70: show warning, allow override
- If suspicion_score > 90: block submission with explanation
- Store fingerprint data alongside the guest review

## Files Changed
| File | Action |
|------|--------|
| `supabase/migrations/xxx_pending_reviews.sql` | New table + guest_reviews fingerprint column |
| `supabase/functions/review-integrity-check/index.ts` | New edge function |
| `src/pages/FrictionlessReview.tsx` | New page component |
| `src/App.tsx` | Add route |

## Technical Notes
- Anonymous auth is supported by Supabase — needs to be enabled via `cloud--configure_auth`
- Video recording uses native `MediaRecorder` API (already proven in `WriteReviewModal`)
- Reuses existing `guest_reviews` table for storage, adding device metadata
- No new npm dependencies required

