

## Redesign "Portfolio" as a Personal Hub

The user wants the "Portfolio" tab to function as a personal activity hub — like Trustpilot's "My Activity" or G2's profile dashboard — consolidating bookmarks, saved items, followed businesses, pending Q&A, written comments/posts, and watchlists into one unified page.

### Changes

**1. Rename and re-icon the bottom nav item** (`src/components/BottomNav.tsx`)
- Change label from "Portfolio" to "My Activity" (or keep "Portfolio" if preferred)
- Replace `Briefcase` icon with `Bookmark` icon (better represents saved/watchlist concept)

**2. Create a new unified Portfolio/Activity page** (`src/pages/Portfolio.tsx`)
A tabbed page with these sections:
- **Saved / Bookmarks** — developers, projects, units the user has saved/bookmarked
- **Following** — business accounts the user follows (get updates)
- **My Reviews** — reviews the user has written (pulled from `reviews` table)
- **My Questions** — questions asked, awaiting replies
- **Watchlist** — items being monitored for changes (price drops, new reviews, etc.)
- **Comments & Activity** — engagement history (comments, helpful votes, etc.)

Each tab shows a list with empty states. Initially, only "My Reviews" and "Saved" will have real data (from existing `reviews` table and mock saved projects). Other tabs will show placeholder UI ready for future backend wiring.

**3. Create a new database table** (`saved_items`)
- `id`, `user_id`, `item_id` (text), `item_type` (text: developer/project/unit/etc.), `item_name`, `item_image`, `created_at`
- RLS: users can CRUD their own rows, admins can read all
- This powers the Saved/Bookmarks and Watchlist tabs

**4. Create a new database table** (`followed_businesses`)
- `id`, `user_id`, `business_id` (text), `business_name`, `created_at`
- RLS: users can CRUD their own rows

**5. Add route** (`src/App.tsx`)
- Add `/portfolio` route pointing to the new Portfolio page
- Update BottomNav to navigate to `/portfolio` instead of role-based dashboard

**6. Update BottomNav navigation** (`src/components/BottomNav.tsx`)
- Portfolio button navigates to `/portfolio` (auth-gated — redirects to `/auth` if not logged in)
- Active state checks `location.pathname === "/portfolio"`

### UI Design
- Top: user avatar + "My Activity" header
- Horizontal scrollable tab bar: Saved | Following | Reviews | Questions | Watchlist | Activity
- Each tab renders a card list with item image, name, category badge, and timestamp
- Empty state: icon + "Nothing here yet" + CTA button

### Files to create/modify
- **New**: `src/pages/Portfolio.tsx`
- **Edit**: `src/components/BottomNav.tsx` (route + icon)
- **Edit**: `src/App.tsx` (add route)
- **New migration**: `saved_items` and `followed_businesses` tables

