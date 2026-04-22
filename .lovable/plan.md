

# High-Stakes Review CTA — Loss-Framed Banner on Developer Profile

A psychologically-charged banner that appears on developer profile pages after a user has viewed the same profile 3+ times without leaving a review. Uses Prospect Theory loss framing to convert lurkers into reviewers.

## Trigger logic

A user sees the banner on `/entity/:id` when **all** of these are true:
1. User is **authenticated** (anonymous viewers won't see it — no review action available)
2. View count for **this specific developer** ≥ 3
3. User has **not** left a review for this developer
4. User hasn't dismissed the banner for this developer in the last 7 days
5. Profile is `is_reviewable = true` (skip parent profiles that block reviews)

View counts already track via `useTrackInterest()` (`type: "click"`) which writes to `user_interests` table. We'll add a per-developer view counter to that same table or read existing `strength` value (which already increments on each view, capped at 10).

## What we'll build

### 1. View tracking enhancement
The existing `useTrackInterest` hook already increments `strength` on each click. We'll add a **dedicated view counter** by querying `user_interests` for `(user_id, entity_id, type='click')` and reading the row count or strength value. No new table — reuse existing infra.

### 2. New component: `HighStakesReviewBanner.tsx`
- Renders inside `EntityPage` between the trust score section and the reviews section
- **Visual style**: Deep orange-to-gold gradient (`from-[#ed1b40]/10 via-[#fac417]/10 to-[#ed1b40]/10`), thick orange-left border (`border-l-4 border-[#ed1b40]`), subtle pulsing glow shadow
- **Icon**: `AlertTriangle` (Lucide) in deep orange, with subtle pulse animation
- **Headline** (bold, navy): *"Your insight is the only thing standing between an investor and a bad decision."*
- **Body** (muted, slightly smaller): *"Every hour you delay, someone else risks their capital. Stop the risk — post your review."*
- **CTA Button**: Gold-on-navy, prominent: **"Prevent a Bad Investment Now"** → opens existing `WriteReviewModal`
- **Dismiss (X)** in top-right: stores `dismissed_at` in localStorage scoped to `(user_id, developer_id)` with 7-day TTL
- **Trust micro-copy** below button: *"⏱ 60 seconds · 🛡 Verified anonymously · ✨ +25 coins"*
- Mobile-safe (390px), 44px touch targets, RTL-aware (`ms-`/`pe-`), bilingual (EN/AR)

### 3. New hook: `useReviewUrgencyTrigger.ts`
- Encapsulates all 5 trigger conditions
- Returns `{ shouldShow: boolean, viewCount: number, dismiss: () => void }`
- Reads view count from `user_interests`
- Checks `reviews` table for existing user review on this developer
- Reads `useReviewability()` for `is_reviewable` flag
- Reads localStorage for dismissal state

### 4. Arabic translations
Add to `i18n/locales/en.json` and `ar.json` under `review.urgency.*`:
- `headline`, `body`, `cta`, `microcopy`, `dismissed` toast text
- Arabic uses Ammiya tone per memory (warm-friend approach to buyers)

### 5. Engagement tracking
Fire two corridor events (per `corridorEvents.ts` pattern):
- `corridor:engage` with `{ zone: 2, action: "urgency_banner_shown" }` on first render
- `corridor:engage` with `{ zone: 2, action: "urgency_banner_clicked" }` on CTA click

Used for analytics — measures conversion lift of the loss-framed CTA.

## Files

**Create**
- `src/components/HighStakesReviewBanner.tsx`
- `src/hooks/useReviewUrgencyTrigger.ts`

**Edit**
- `src/pages/EntityPage.tsx` — mount `<HighStakesReviewBanner developerId={id} developerName={name} />` between trust score block and reviews list, wired to existing `WriteReviewModal` open state
- `src/i18n/locales/en.json` — add `review.urgency.*` keys
- `src/i18n/locales/ar.json` — add `review.urgency.*` keys (Ammiya)

## Out of scope
- Cross-device view counts (using `user_interests` already syncs across devices for logged-in users — guests excluded by design)
- A/B testing copy variants (can layer on later via simple variant flag)
- Email/push reminders for the same urgency (this is on-page only)
- Adjusting threshold from 3 views (will be a constant `VIEW_THRESHOLD = 3` — easy to tune later)

