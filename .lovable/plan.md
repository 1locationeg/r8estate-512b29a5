

## Reviewer Verification System — Social Profile-Based

You're right — Google accounts are private and invisible. Facebook and LinkedIn profiles are **public assets** that other users can actually visit, see friends/connections, and judge authenticity. This is much stronger social proof.

### Approach: "Link & Display" Social Verification

Instead of complex OAuth integrations (Facebook requires weeks of Meta app review), we use a **profile-link verification** model:

1. **Users paste their Facebook or LinkedIn profile URL** in their profile settings
2. **Admins verify** the linked profile is real and matches the user
3. **Verified social badges** appear on all their reviews — clickable, linking to the actual profile
4. **Transaction verification** (Tier 2) stays via receipt uploads (already partially built)

This is minimal, effective, and instant to ship — no new API keys, no Meta/LinkedIn app review process.

### Two Verification Tiers

| Tier | Badge | How |
|------|-------|-----|
| **Identity Verified** | Blue Facebook/LinkedIn icon | User links social profile → Admin approves |
| **Verified Buyer** | Green shield | User uploads receipt/contract → Admin approves |

### Database Changes

**Add to `profiles` table:**
- `facebook_url text` — user's Facebook profile link
- `linkedin_url text` — user's LinkedIn profile link  
- `identity_verified boolean default false` — admin-approved flag
- `identity_provider text` — 'facebook', 'linkedin', or null

**New table `reviewer_verifications`:**
- Tracks verification requests (social profile links + document uploads)
- Status workflow: pending → approved/rejected
- Admin notes and audit trail

### Code Changes

**1. Profile Settings — Social Link Fields**
- `BuyerProfile` section in `BuyerDashboard.tsx`: Add Facebook URL and LinkedIn URL input fields
- Validation: must match `facebook.com/` or `linkedin.com/in/` patterns
- "Submit for Verification" button that creates a `reviewer_verifications` row

**2. ReviewCard — Verification Badges**  
- New `ReviewVerificationBadge.tsx` component
- Shows clickable Facebook/LinkedIn icon that opens the user's actual profile in new tab
- Green "Verified Buyer" badge for transaction-verified reviews
- Renders on `ReviewCard.tsx` next to the author name

**3. WriteReviewModal — Verification Prompt**
- If user has no social profile linked: show a subtle nudge "Link your Facebook/LinkedIn to get a verified badge"
- If verified: show verification badge on the review form preview

**4. Admin Verification Panel**
- New `AdminReviewerVerification.tsx` component
- Lists pending verification requests with clickable links to the user's social profiles
- Admin can visit the profile, verify it's real, then approve/reject
- On approval: sets `identity_verified = true` on the profile
- Added as a new route in `AdminDashboard.tsx`

**5. `handle_new_user` trigger update**
- Detect Google/Apple OAuth provider and store in `identity_provider` (informational only, not verified tier)

### Files to Create/Edit

| File | Action |
|------|--------|
| SQL migration | Add columns to `profiles`, create `reviewer_verifications` table with RLS |
| `src/components/ReviewVerificationBadge.tsx` | **Create** — tiered badge with clickable social links |
| `src/components/AdminReviewerVerification.tsx` | **Create** — admin approval panel |
| `src/components/ReviewCard.tsx` | **Edit** — add verification badges |
| `src/components/WriteReviewModal.tsx` | **Edit** — add verification nudge |
| `src/pages/BuyerDashboard.tsx` | **Edit** — add social link fields to profile settings |
| `src/pages/AdminDashboard.tsx` | **Edit** — add verification route/tab |
| `src/contexts/AuthContext.tsx` | **Edit** — include new profile fields |

