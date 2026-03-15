

## Plan: Guest Reviews, Progressive Profiling, and Trust Signals

### What We're Building

Three interconnected improvements to reduce friction for first-time reviewers:

1. **Guest review flow** — Let unauthenticated users write and submit a review. Their review is stored as "pending" with a guest email/name. After submission, show a soft prompt to create an account (to track their review, earn badges, edit later).

2. **Progressive profiling on signup** — The account creation prompt after a guest review only asks for email + name (+ password). No buyer type, budget, interests upfront. Those fields get collected later in the buyer dashboard.

3. **Trust signals on auth/review pages** — Add reassuring micro-copy like "Your review is protected", "We never spam", "256-bit encrypted" near forms.

### Database Changes

**New table: `guest_reviews`** — Holds reviews from unauthenticated users until they optionally create an account.

```sql
CREATE TABLE public.guest_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_email text,
  guest_name text NOT NULL DEFAULT 'Guest',
  developer_id text NOT NULL,
  developer_name text,
  rating integer NOT NULL,
  title text,
  comment text NOT NULL,
  experience_type text,
  is_claimed boolean NOT NULL DEFAULT false,
  claimed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guest submission)
CREATE POLICY "Anyone can insert guest reviews"
  ON public.guest_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read (public reviews)
CREATE POLICY "Anyone can read guest reviews"
  ON public.guest_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage guest reviews"
  ON public.guest_reviews FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can claim their own
CREATE POLICY "Users can update claimed reviews"
  ON public.guest_reviews FOR UPDATE
  TO authenticated
  USING (claimed_by = auth.uid());
```

### Component Changes

#### `WriteReviewModal.tsx`
- Remove the hard gate that redirects to `/auth` when `!user`
- If guest: show a simplified form (rating + name + comment only — no attachments, no AI, no verification)
- On submit: insert into `guest_reviews` table instead of `reviews`
- After successful submit: show a "Create account to track your review" prompt inline (not a redirect) with email + name + password fields
- If they sign up: claim the guest review (copy to `reviews` table, mark `guest_reviews.is_claimed = true`)

#### `Auth.tsx`
- When navigated to with `?returnTo=review&guestReviewId=xxx`: show a minimal signup form (email + name + password only) with a message "Claim your review"
- Add trust signals section below the form

#### Trust Signals Component (new: `TrustSignals.tsx`)
- Reusable component showing 3-4 trust badges:
  - Shield icon: "Your review is protected"
  - Lock icon: "256-bit encrypted"
  - Mail icon: "We never spam"
  - Eye icon: "Anonymous option available"
- Used on Auth page and inside WriteReviewModal

#### `ItemDetailSection.tsx` / `HeroSearchBar.tsx`
- The review motivator and write-review buttons should work for guests too (no early redirect)

### Files to Create/Edit
- **Create** `src/components/TrustSignals.tsx` — Reusable trust badges
- **Edit** `src/components/WriteReviewModal.tsx` — Guest review flow + post-submit account prompt
- **Edit** `src/pages/Auth.tsx` — Add trust signals, support claim-review mode
- **Edit** `src/i18n/locales/en.json` — New keys for trust signals, guest review copy
- **Edit** `src/i18n/locales/ar.json` — Arabic translations
- **DB migration** — Create `guest_reviews` table

