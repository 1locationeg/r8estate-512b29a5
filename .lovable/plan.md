

# Full Arabic Translation Audit & Fix

## Problem
Multiple pages and components contain hardcoded English strings that are not wrapped in `t()` translation calls. When users switch to Arabic mode, these strings remain in English, breaking the bilingual experience.

## Scope of Untranslated Content

### 1. **Portfolio Page** (`src/pages/Portfolio.tsx`)
- Tab labels: "Saved", "Following", "Reviews", "Questions", "Watchlist", "Activity"
- Header: "My Activity"
- Empty states: "No saved items yet", "Not following anyone", "No reviews written", "No questions yet", "Watchlist is empty", "No activity yet" + all descriptions
- Action labels: "Browse Directory", "Explore Developers", "Write a Review"
- Buttons: "Unfollow"
- Text: "Following since ...", "Removed", "Item removed from saved", "Unfollowed", "Business unfollowed", "Developer"
- Date formatting uses `en-US` locale — should switch to `ar-EG` when Arabic

### 2. **Insights Page** (`src/pages/InsightsPage.tsx`)
- Header: "AI Insights"
- Role labels: "Admin", "Developer", "Buyer" + descriptions
- Trend labels: "↑ Rising", "↓ Declining", "— Stable", "⚠ Alert"
- Stats: "Total Reviews", "Avg Rating", "Businesses", "Active Users", "Viewed", "Saved", "Reports", "Votes", "Platform Stats"
- Tabs: "AI Insights", "Categories", "Trending"
- Section titles: "Category Performance", "Trending Companies", "Business Hierarchy"
- Labels: "Parent Developers", "Child Projects", "Total Profiles"
- Buttons: "Refresh", "Force Refresh", "Generate Insights", "Upgrade", "Learn More"
- Messages: "Cached · Refreshes in Xm", "Fresh insights", "Showing cached insights", "Failed to load insights", "Analyzing platform data with AI..."
- Promo: "Unlock Premium Insights", "Premium Insight", "Want your company here?"
- Empty: "No Insights Available", "No category data available yet", "No trending data available yet"
- Sub-labels: "total", "/mo", "/wk", "reviews", "insights", "of top volume"

### 3. **Deal Watch Page** (`src/pages/DealWatch.tsx`)
- Title: "Deal Watch", "Beta"
- Description: "The market's best offers..."
- Filter options: "All Types", "Payment Plans", "Discounts", "Early Access", "Exclusive Units"
- Sort options: "Top Rated", "Newest", "Most Reviewed"
- Buttons: "Compare Deals", "Exit Compare"
- Search: "Search deals..."
- Empty: "No deals yet", "Check back soon..."

### 4. **Launch Watch Page** (`src/pages/LaunchWatch.tsx`)
- Status filters: "Reservations Open", "Launching Soon", "Active", "Sold Out", "All Locations"
- Sort options: "R8 Score", "Price: Low to High", "Units Remaining", "Delivery Date", "Newest"
- Location options: "New Cairo", "Sheikh Zayed", "6th of October", etc.

### 5. **Leaderboard Page** (`src/pages/Leaderboard.tsx`)
- Title: "Community Leaderboard"
- Subtitle: "Top contributors making the community better for everyone"
- Period buttons: "This Week", "All Time"
- Tabs: "Total Points", "Posts", "Replies"
- Labels: "Your Rank", "pts", "posts", "replies", "weekly", "total", "(You)"
- Reset countdown: "Resets in X days"
- Empty: "No activity this week yet. Be the first!", "No contributors yet. Be the first!"
- Points legend: "How Points Work", "Community Post: 15 pts", "Reply: 10 pts", etc.

### 6. **Community Post Card** (`src/components/CommunityPostCard.tsx`)
- Menu items already use `t()` with fallbacks — need to add keys to `ar.json`

### 7. **Community New Post** (`src/components/CommunityNewPost.tsx`)
- "Enhance with AI", "Notify all users", "Send a push notification..." — need Arabic keys

### 8. **Featured Identity Spotlight** (`src/components/FeaturedIdentitySpotlight.tsx`)
- "Unfollow"/"Follow" tooltip not using `t()`

## Plan

### Step 1: Add all missing Arabic keys to `ar.json`
Add new translation sections:
- `portfolio.*` (~25 keys) — Portfolio page strings
- `insights.*` (~40 keys) — Insights page strings  
- `dealWatch.*` (~15 keys) — Deal Watch strings
- `launchWatch.*` (~15 keys) — Launch Watch strings
- `leaderboard.*` (~20 keys) — Leaderboard strings
- Additional keys under existing `community.*` section

All Arabic will follow the established "warm friend" Ammiya tone for buyer-facing copy, keeping strings under 15 words, scannable, and natural-sounding for Egyptian real estate buyers.

### Step 2: Add matching English keys to `en.json`
Mirror all new keys with their English equivalents.

### Step 3: Update `Portfolio.tsx`
- Add `useTranslation()`, wrap all hardcoded strings in `t()` calls
- Switch date locale based on `i18n.language`

### Step 4: Update `InsightsPage.tsx`
- Add `useTranslation()`, replace all hardcoded labels, tabs, role labels, trend labels, stats, buttons, empty states, and CTA text with `t()` calls

### Step 5: Update `DealWatch.tsx`
- Add `useTranslation()`, translate title, description, filter/sort options, search placeholder, buttons, empty states

### Step 6: Update `LaunchWatch.tsx`
- Add `useTranslation()`, translate status filters, sort options, location options

### Step 7: Update `Leaderboard.tsx`
- Wrap all remaining hardcoded strings (title, tabs, period buttons, points legend, empty states) in `t()` calls

### Step 8: Update `CommunityPostCard.tsx` and `CommunityNewPost.tsx`
- Ensure all fallback strings have matching Arabic keys in `ar.json`

### Step 9: Update `FeaturedIdentitySpotlight.tsx`
- Use `t()` for follow/unfollow tooltip

## Translation Style Guide (applied)
- Egyptian Ammiya for buyer-facing UI (informal, warm, direct)
- Fusha for legal/formal sections
- Max 15 words per string
- No "AI" prefix in public-facing text (use "ذكي" or omit)
- Verbs before nouns in Arabic

