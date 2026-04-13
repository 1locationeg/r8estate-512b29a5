

## Plan: "Reviewer is King" — VIP Experience Overhaul

### Philosophy
Every touchpoint should answer: "Does this make a reluctant reviewer feel important, empowered, and rewarded?"

### Changes Organized by Reviewer Journey Stage

---

### Stage 1: LANDING — Make the reviewer feel called

**File: `src/pages/Index.tsx`**
- Add a secondary hero line targeting reviewers: "Had an experience? Your voice matters. Write a review." with a direct CTA button
- Add a "Reviewer Spotlight" strip below the hero showing the latest 3 reviewers with their name, avatar, badge, and review snippet — social proof that real people are actively reviewing

**File: `src/components/ReviewMotivatorFloat.tsx`**
- Replace generic "Share your experience" with rotating emotional hooks:
  - "Your review could save someone millions"
  - "47 people searched this developer today — help them decide"
  - "Earn your Trusted Reviewer badge"
- Add a pulsing coin animation showing potential points

---

### Stage 2: SIGNUP — Sell the reviewer identity

**File: `src/pages/Auth.tsx`**
- When arriving from a review CTA (query param `?intent=review`), show a "Join as Trusted Reviewer" header instead of generic signup
- Add 3 quick benefit bullets: "Earn coins & badges", "Get verified reviewer status", "Help 1000s make better decisions"
- Keep the same auth flow, just change the messaging wrapper

---

### Stage 3: WRITING — Remove every friction point

**File: `src/components/WriteReviewModal.tsx`**
- Phase 1: After star tap, show an encouraging micro-message based on rating:
  - 5 stars: "Great! Tell others what made it special ✨"
  - 1-2 stars: "We hear you. Share your story so others are warned 🛡️"
- Add a "Quick Review" mode toggle — just stars + 1 sentence, no phases needed (for people who want speed)
- Show a live impact counter: "Reviews like yours have helped 2,847 buyers this month"

**File: `src/components/ReviewRichEditor.tsx`**
- Add smart prompts/sentence starters that appear when the editor is empty:
  - "I worked with [developer] on..."
  - "The best part was..."
  - "I wish I had known..."

---

### Stage 4: POST-REVIEW — Make them feel like a VIP

**File: `src/components/ReviewSuccessOverlay.tsx`**
- Redesign into a "VIP Thank You" experience:
  - Show their new reviewer rank: "You're now a Level 2 Reviewer!"
  - Show impact preview: "Your review will appear on [Developer]'s profile"
  - Add share buttons: "Share your review on WhatsApp/Twitter"
  - Show next milestone: "Write 2 more reviews to unlock Pro Reviewer badge"

---

### Stage 5: ONGOING — Keep them coming back

**File: `src/pages/BuyerDashboard.tsx`**
- Add a "Your Impact" card at the top showing:
  - Total views on their reviews
  - "Helpful" votes received
  - Reviewer rank with progress bar
- Add "Review Requests" section: developers the user has interacted with but hasn't reviewed yet

**File: `src/components/CommunityPostCard.tsx`**
- When a community post mentions a developer or contains complaint-like language, show a subtle nudge: "Turn this into a verified review for 3x visibility"

---

### Stage 6: IDENTITY — Visible reviewer status everywhere

**New file: `src/components/ReviewerBadge.tsx`**
- A small badge component showing reviewer tier (New → Active → Pro → Elite) that appears:
  - Next to their name in community posts
  - On their profile/avatar
  - In the review card itself
- Tiers based on review count: 1 review = "New Reviewer", 3 = "Active", 5 = "Pro", 10+ = "Elite"

---

### Technical Summary

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add reviewer-targeted hero CTA + reviewer spotlight strip |
| `src/components/ReviewMotivatorFloat.tsx` | Emotional rotating hooks + coin animation |
| `src/pages/Auth.tsx` | Reviewer-intent signup messaging |
| `src/components/WriteReviewModal.tsx` | Encouraging micro-messages, quick review mode, impact counter |
| `src/components/ReviewRichEditor.tsx` | Smart sentence starter prompts |
| `src/components/ReviewSuccessOverlay.tsx` | VIP thank-you redesign with rank + impact + sharing |
| `src/pages/BuyerDashboard.tsx` | "Your Impact" card + review requests |
| `src/components/CommunityPostCard.tsx` | Community-to-review conversion nudge |
| `src/components/ReviewerBadge.tsx` (new) | Visible reviewer tier badge component |

### No database changes needed — all computed from existing `reviews` table counts and gamification system.

