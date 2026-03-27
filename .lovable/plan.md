

# Redesign WriteReviewModal Post-Submission Signup

## Problem
The WriteReviewModal's guest signup prompt (lines 520-593) still shows the old design with Full Name + Email + Password fields all at once. It needs to match the clean, motivating design from the uploaded image and the FrictionlessReview page.

## Design (Matching the Image)
The post-submission signup card will show:
1. **R8ESTATE logo** at top (using BrandLogo component)
2. **"Create an account"** heading with "Already have an account? **Log In**" link
3. **Google** and **Apple** social login buttons (full-width, outlined)
4. **"or continue with"** divider
5. **Email input** with mail icon — single field initially
6. **"Continue" button** — validates email, then reveals password field
7. **"Are you a business? Register your business →"** link
8. **Trust signals** at bottom: Protected, Encrypted, No spam, Anonymous (4 icons in a row)
9. **Skip for now** as subtle link

## Changes

### File: `src/components/WriteReviewModal.tsx`
- Add `lovable` import from `@/integrations/lovable`
- Add `signupStep` state (`"options" | "email" | "password"`) for progressive reveal
- Replace the entire `showAccountPrompt && isGuest` block (lines 520-593) with new design:
  - BrandLogo at top
  - Google/Apple social buttons using `lovable.auth.signInWithOAuth`
  - Divider "or continue with"
  - Email-only input → on Continue → password input slides in
  - Trust signal icons row at bottom
  - Skip for now link
- Add `handleSocialSignup` functions for Google/Apple that set `r8_pending_claim_review` before redirecting

