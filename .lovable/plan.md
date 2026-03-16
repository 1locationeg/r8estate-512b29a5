

# Community Hub — Implementation Plan

## Overview

Build a full community feature into R8ESTATE where users can create posts, ask questions, reply, upvote, and engage — integrated naturally into the existing app structure. The community will live as a dedicated page (`/community`) accessible from the bottom nav and dashboards.

## UI Placement Strategy

1. **Bottom Navigation**: Replace "My Hub" (Portfolio) with "Community" — this is the highest-visibility spot on mobile and positions community as a core pillar alongside Reviews, Categories, and Insights.
2. **Home Page**: Add a "Community Highlights" section below Smart Recommendations showing trending posts/questions to drive discovery.
3. **Dashboard Sidebar**: Add "Community" nav item in both Buyer and Developer dashboards for quick access.
4. **Review Cards**: Add a "Discuss this" link on review cards that deep-links to a community thread about that developer.

## Database Schema

New tables via migration:

- **`community_posts`** — `id`, `user_id`, `title`, `body`, `category` (enum: `discussion`, `question`, `tip`, `experience`, `poll`), `developer_id` (nullable, for developer-specific threads), `upvotes`, `reply_count`, `is_pinned`, `created_at`, `updated_at`
- **`community_replies`** — `id`, `post_id` (FK), `user_id`, `body`, `parent_reply_id` (nullable, for nested replies), `upvotes`, `created_at`
- **`community_votes`** — `id`, `user_id`, `post_id` (nullable), `reply_id` (nullable), `vote_type` (up/down), unique constraint on user+post/reply
- **`community_post_category`** enum type: `discussion`, `question`, `tip`, `experience`, `poll`

RLS policies: authenticated users can read all, insert own, update own. Votes unique per user per item.

Enable realtime on `community_posts` and `community_replies`.

## Components to Build

### 1. Community Page (`src/pages/Community.tsx`)
- **Header**: "Community" title with post count + "New Post" button
- **Category filter tabs**: All | Questions | Tips | Experiences | Discussions | Polls
- **Sort options**: Trending (upvotes + recency), Newest, Most Discussed
- **Post feed**: Cards showing author avatar, title, body preview (2 lines), category badge, upvote count, reply count, time ago
- **Search bar** for filtering posts

### 2. Community Post Card (`src/components/CommunityPostCard.tsx`)
- Compact card: avatar, author name + tier badge, category chip, title, truncated body, upvote button (with count), reply count, timestamp
- Click navigates to post detail

### 3. Community Post Detail (`src/components/CommunityPostDetail.tsx`)
- Full post with author info, body, upvote/downvote, reply thread
- Threaded replies (1 level of nesting) with author info, upvotes
- Reply composer at bottom with textarea + submit

### 4. New Post Modal (`src/components/CommunityNewPost.tsx`)
- Modal/sheet with: title input, body textarea, category selector (chips), optional developer tag (searchable dropdown), submit button
- AI-assisted: "Enhance with AI" button to improve post clarity (reuse `review-ai-assist` pattern)

### 5. Community Highlights (`src/components/CommunityHighlights.tsx`)
- Horizontal scrollable section for the home page showing 3-4 trending posts as mini-cards
- "Join the conversation" CTA linking to `/community`

### 6. Bottom Nav Update
- Replace Portfolio/My Hub with Community icon (`Users` from lucide) in `BottomNav.tsx`

## UX Design Principles

- **Professional, not social-media**: Clean cards with minimal noise — no emoji reactions, no stories. Think Stack Overflow meets Trustpilot community.
- **Trust-forward**: Show verified badges, reviewer tier (Gold/Silver/Bronze), and review count next to author names.
- **Low-friction posting**: New post modal pre-selects "Question" category and has placeholder text like "What do you want to know about a developer?"
- **Motivation hooks**: Show "Be the first to answer" on unanswered questions. Integrate with existing gamification (earn points for posts/replies).
- **Content density**: Tight spacing per brand guidelines — post cards show max info in minimal space.

## Routing

- Add `/community` route in `App.tsx` (lazy-loaded)
- Add `/community/:postId` for post detail view (handled within Community page via internal state or nested route)

## Files to Create
- `src/pages/Community.tsx` — main page with feed, filters, detail view
- `src/components/CommunityPostCard.tsx` — post card component
- `src/components/CommunityPostDetail.tsx` — full post + reply thread
- `src/components/CommunityNewPost.tsx` — new post modal
- `src/components/CommunityHighlights.tsx` — home page highlights section

## Files to Edit
- `src/App.tsx` — add `/community` and `/community/:postId` routes
- `src/components/BottomNav.tsx` — add Community tab (replace or add alongside existing)
- `src/pages/Index.tsx` — add CommunityHighlights section
- `src/pages/BuyerDashboard.tsx` — add Community nav item in sidebar
- `src/pages/DeveloperDashboard.tsx` — add Community nav item in sidebar
- Database migration — create tables + RLS + realtime

