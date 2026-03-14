

# Floating "Write a Review" Motivator on Detail Views

## What We're Building

A small, animated floating prompt that appears when users view developer or item details, encouraging them to write a review. It shows the points and badge they can earn, and links directly to the review modal.

## Design

- **Component**: `ReviewMotivatorFloat` — a compact floating card (bottom-right of the detail section, not screen-fixed) that slides in after a 3-second delay
- **Content**: PenLine icon, "Share your experience!" text, points reward preview (e.g., "+25 pts"), next badge hint (e.g., "Earn 'First Review' badge"), and a CTA button that opens the WriteReviewModal
- **Dismissible**: X button to close; stays hidden for that session via local state
- **Conditional**: Only shows if user is logged in and hasn't dismissed it; hides if the review modal is already open
- **Gamification integration**: Uses `useBuyerGamification()` to show relevant unlockable badge (first_review or review_pro) and points

## Files to Create/Edit

1. **Create `src/components/ReviewMotivatorFloat.tsx`**
   - Accepts `onWriteReview: () => void` prop
   - 3s delay entrance animation (translate-y + opacity via Tailwind)
   - Shows points for next review badge, current tier progress
   - Dismiss button sets local state

2. **Edit `src/components/ItemDetailSection.tsx`**
   - Import and render `<ReviewMotivatorFloat>` near the bottom of the detail section
   - Wire `onWriteReview` to open the existing `WriteReviewModal`

3. **Edit `src/components/DeveloperDetailCard.tsx`**
   - Same integration as ItemDetailSection

4. **Edit `src/components/DeveloperDetailModal.tsx`**
   - Same integration for the modal detail view

## Visual Approach

- Small card (~280px wide) with glass/blur background, subtle border, rounded corners
- Positioned as `sticky bottom-4 right-4` or absolutely within the detail container
- Gentle pulse animation on the points badge to draw attention
- Mobile-responsive: full-width at bottom on small screens

