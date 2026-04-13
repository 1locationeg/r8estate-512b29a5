

## Plan: Progressive-Save Review Flow (Facebook Pattern)

### The Problem
Currently, if a user taps 5 stars but quits before finishing all 3 phases and hitting submit, the platform captures **nothing**. No rating, no insight, no signal. The review only saves at the very end.

### The Solution — Save on Every Step
Inspired by the Facebook App Store pattern you shared: tap a star → data is saved immediately → "Thanks! Want to write more?" → user can stop or continue. Every step enriches the same record.

```text
Current flow:
  Stars → Comment → Categories → [Submit] → saved
  ↑ quit anywhere before submit = nothing captured

New flow:
  Stars → [auto-save partial] → "Thanks!" screen
    ├── "Done" → close (rating captured!)
    └── "Write a Review" → Comment → [auto-save] → Categories → [auto-save] → "Done"
         Every field change updates the same DB row
```

### Database Changes

**Migration: Make `comment` nullable + add `completion_level`**

On both `reviews` and `guest_reviews` tables:
- `ALTER COLUMN comment DROP NOT NULL` — allow rating-only records
- `ADD COLUMN completion_level text NOT NULL DEFAULT 'rating_only'` — tracks how far the user got: `'rating_only'`, `'with_comment'`, `'full'`

This lets the platform distinguish between "quick star tap" vs "detailed review" for display and insights.

### UI Flow Changes — `WriteReviewModal.tsx`

**Phase 1 (Stars):** When user taps a star:
- Immediately insert a new row (rating + developer_id only, comment = null, completion_level = 'rating_only')
- Store the returned `id` in state
- Show a Facebook-style "Thanks for your feedback" card with the filled stars, two buttons:
  - **"Write a Review"** (primary) → advance to phase 2
  - **"Done"** (secondary/ghost) → close modal, partial review already saved

**Phase 2 (Comment/Title):** When user types and moves to phase 3 (or pauses for 2s via debounce):
- Update the existing row with comment + title + experience_type
- Set completion_level = 'with_comment'
- Remove the "Submit" gate — data is already persisting

**Phase 3 (Categories + Details):** When user adjusts sliders or adds attachments:
- Update the existing row with category_ratings, attachments, etc.
- Set completion_level = 'full'
- Final "Done" button runs content moderation check, then closes with success overlay

**Key behavior changes:**
- No more "Submit" button that gates everything — replaced by "Done" at each stage
- Disclaimer checkbox moves to phase 2 (before comment is saved)
- Content moderation runs when leaving phase 2 (before persisting comment text)
- Guest flow works the same — partial guest_reviews saved on star tap

### What the Platform Gains

Even from users who only tap a star and leave:
- Rating distribution data per developer (valuable for trust scores)
- Engagement signal for interest tracking
- Volume metric for popularity
- Partial reviews can be shown as "X users rated this" alongside full reviews

### Files Touched
1. **Migration** — Make `comment` nullable, add `completion_level` to `reviews` and `guest_reviews`
2. **Edit** — `src/components/WriteReviewModal.tsx` (progressive save logic, "Thanks" interstitial, auto-save on each phase)
3. **Edit** — `src/hooks/useReviews.ts` (handle null comments in display)
4. **Edit** — `src/pages/Reviews.tsx` (show rating-only reviews differently, e.g., "★★★★★ — no comment")
5. **Edit** — `src/components/ReviewCard.tsx` (handle missing comment gracefully)

