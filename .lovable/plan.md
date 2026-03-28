

## Fix Buyer & Business Verification Flows

### Problems Identified

1. **No admin panel for receipt/buyer verification (Tier 2)**: Buyers can upload receipts via `WriteReviewModal`, but there's no admin UI to review/approve/reject them. The `receipt_submissions` table exists with proper RLS but no admin component.

2. **Buyer verification is buried**: KYC (Tier 3) upload is hidden inside Account Details (`/buyer/settings`). There's no dedicated "Verification" section in the buyer sidebar. Identity verification (Tier 1) auto-submits silently when adding social links — no visibility or status tracking for the user.

3. **No buyer-facing verification status dashboard**: Buyers can't see their current verification status across all three tiers, pending requests, or what they need to do next.

4. **Business verification flow gaps**: Business upgrade requests work but the admin panel (`AdminBusinessUpgrades`) doesn't show the user's profile name/email — only a truncated UUID. Business claims (`AdminBusinessClaims`) similarly lack user context.

5. **No notification trigger for receipt verification**: The `notify_receipt_status_change` trigger function exists in DB but needs to confirm it's wired to the table.

---

### Plan

#### 1. New: Admin Receipt Verification Component (`src/components/AdminReceiptVerification.tsx`)
- Lists all `receipt_submissions` with filter tabs (pending/approved/rejected/all)
- Shows receipt image preview, submitter name/email (joined from `profiles`), developer name, submission date
- Approve/reject with admin notes
- On approval: update `receipt_submissions.status`, update the user's reviews to `verification_level = 'transaction'`
- Stats cards showing counts per status

#### 2. New: Buyer Verification Hub Page (`src/pages/BuyerDashboard.tsx` — add `BuyerVerification` component)
- Dedicated route `/buyer/verification` accessible from sidebar
- Shows all 3 tiers with clear status for each:
  - **Tier 1 (Identity)**: Shows social link status, link to add Facebook/LinkedIn in profile, pending/approved badge
  - **Tier 2 (Verified Buyer)**: Shows receipt submissions with status, ability to upload new receipt with developer selection
  - **Tier 3 (KYC)**: Move existing `KycUploadSection` here, show status
- Each tier shows a visual progress indicator (locked/pending/verified)
- Fetches `reviewer_verifications` and `receipt_submissions` for the current user

#### 3. Update: Admin Dashboard routing
- Add "Receipt Verification" nav item under "Reviews & Moderation" group
- Add route `/admin/receipt-verification` → `AdminReceiptVerification`

#### 4. Update: Buyer Dashboard sidebar
- Add "Verification" nav item with Shield icon, path `/buyer/verification`
- Add route for the new verification page

#### 5. Update: `AdminBusinessUpgrades` — Show user context
- Join `profiles` table to show full_name and email alongside each request instead of truncated UUID

#### 6. Update: `AdminBusinessClaims` — Show user context
- Join `profiles` table to show claimant's full_name and email

#### 7. Database: Ensure receipt notification trigger is attached
- Run migration to attach `notify_receipt_status_change` trigger to `receipt_submissions` table on UPDATE (if not already wired)

---

### Technical Details

**Receipt verification admin flow**: Query `receipt_submissions` joined with `profiles` on `user_id`. On approval, also check if user already has `identity` or `kyc` level — only upgrade to `transaction` if current level is `none` or `identity`.

**Buyer verification hub**: Single component that queries both `reviewer_verifications` (for Tier 1 + 3) and `receipt_submissions` (for Tier 2) filtered by `user_id = auth.uid()`. Displays status cards with actionable CTAs.

**Files changed**:
- **Create**: `src/components/AdminReceiptVerification.tsx`
- **Edit**: `src/pages/BuyerDashboard.tsx` (add `BuyerVerification` component, add sidebar nav item + route)
- **Edit**: `src/pages/AdminDashboard.tsx` (add nav item + route for receipt verification)
- **Edit**: `src/components/AdminBusinessUpgrades.tsx` (join profiles for user context)
- **Edit**: `src/components/AdminBusinessClaims.tsx` (join profiles for user context)
- **Migration**: Attach `notify_receipt_status_change` trigger to `receipt_submissions`

