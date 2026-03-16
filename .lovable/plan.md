

## Review → Social Post (Auto-Generate)

### What this feature does
When a business receives a review, they can click a button to auto-generate a polished social media post from that review using AI. The generated post is ready to copy/share on Instagram, Twitter/X, LinkedIn, etc. This turns positive reviews into marketing content effortlessly.

### Components

**1. New Edge Function: `review-to-social`**
- Accepts a review (rating, comment, author name, business name) and target platform (instagram, twitter, linkedin, general)
- Calls Lovable AI (Gemini Flash) with a prompt that transforms the review into a branded social post with emojis, hashtags, and a call-to-action
- Returns the generated post text, suggested hashtags, and optional image caption
- Uses existing `LOVABLE_API_KEY` (already configured)

**2. New Component: `ReviewToSocialModal`**
- Modal triggered from review cards in the Business Dashboard (`DevReviews` section)
- Shows the original review summary at the top
- Platform selector chips (Instagram, Twitter/X, LinkedIn, General)
- AI-generated post preview with copy-to-clipboard button
- "Regenerate" button for a fresh version
- Character count indicator (280 for Twitter, etc.)

**3. Business Dashboard Integration**
- Add a "Share as Post" button (with a `Share2` icon) next to each review in `DevReviews`
- Clicking opens `ReviewToSocialModal` pre-filled with that review's data
- Only visible to business account owners (already gated by dashboard auth)

### Technical flow

```text
[Review Card] → "Share as Post" button
       ↓
[ReviewToSocialModal] → user picks platform
       ↓
supabase.functions.invoke("review-to-social")
       ↓
AI generates branded post text
       ↓
User previews → copies to clipboard or regenerates
```

### Files to create/modify
- **Create** `supabase/functions/review-to-social/index.ts` — AI edge function
- **Create** `src/components/ReviewToSocialModal.tsx` — modal UI
- **Modify** `src/pages/DeveloperDashboard.tsx` — add "Share as Post" button to `DevReviews`
- **Modify** `supabase/config.toml` — add function config with `verify_jwt = false`

