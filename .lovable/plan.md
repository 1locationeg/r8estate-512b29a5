

## Real-Time Messaging System with Online Presence

### Overview
Build a full chat system allowing buyers and businesses to message each other in real time, with online/offline presence indicators and a privacy toggle to hide online status.

### Database Changes (4 new tables + 1 migration)

**1. `conversations` table**
- `id` (uuid, PK), `created_at`, `updated_at`
- Tracks each conversation thread

**2. `conversation_participants` table**
- `id` (uuid, PK), `conversation_id` (FK → conversations), `user_id` (uuid), `joined_at`, `last_read_at`
- Links users to conversations; `last_read_at` tracks unread state
- Unique constraint on `(conversation_id, user_id)`

**3. `messages` table**
- `id` (uuid, PK), `conversation_id` (FK → conversations), `sender_id` (uuid), `content` (text), `created_at`, `is_read` (boolean, default false)
- Enable Supabase Realtime on this table for live message delivery

**4. `user_presence` table**
- `id` (uuid, PK), `user_id` (uuid, unique), `is_online` (boolean, default false), `last_seen` (timestamptz), `hide_online_status` (boolean, default false), `updated_at`
- When `hide_online_status = true`, other users see them as offline regardless

**RLS policies:**
- Conversations/messages: participants can read/insert; authenticated users can create conversations
- Presence: anyone authenticated can read (but the app logic respects `hide_online_status`); users can only update their own row

**Realtime:** Enable on `messages` and `user_presence` tables.

### File Changes

**New files:**

1. **`src/pages/Messages.tsx`** — Main messages page with two-panel layout:
   - Left: conversation list with search, each showing last message preview, unread badge, and online dot
   - Right: active chat thread with message bubbles, input, and header showing recipient name + online status
   - Mobile: single-panel with back navigation

2. **`src/components/ConversationList.tsx`** — Scrollable list of conversations with:
   - Avatar, name, last message preview, timestamp, unread count badge
   - Green dot for online users (respecting `hide_online_status`)

3. **`src/components/ChatThread.tsx`** — Message thread view:
   - Header: recipient name, online/offline/last seen indicator
   - Message bubbles (sender right-aligned, recipient left-aligned)
   - Auto-scroll to bottom on new messages
   - Text input + send button

4. **`src/components/ChatPresenceToggle.tsx`** — Small toggle in chat settings or user profile:
   - Switch labeled "Show online status" 
   - Updates `user_presence.hide_online_status`

5. **`src/hooks/useMessages.ts`** — Hook for:
   - Fetching conversations list with last message + unread count
   - Fetching messages for a conversation
   - Sending messages
   - Realtime subscription for new messages

6. **`src/hooks/usePresence.ts`** — Hook for:
   - Updating own presence (online/offline) on mount/unmount and visibility change
   - Reading other users' presence
   - Managing the hide toggle

**Modified files:**

7. **`src/App.tsx`** — Add `/messages` route (lazy-loaded)

8. **`src/components/DashboardSidebar.tsx`** — Add "Messages" nav item with unread badge

9. **`src/components/BottomNav.tsx`** — Add messages icon with unread indicator

10. **`src/components/Navbar.tsx`** — Add message icon in top nav with unread count

### Presence Logic
- On app load (AuthProvider or a top-level component), set `is_online = true` and update `last_seen`
- On `visibilitychange` (tab hidden → set offline; tab visible → set online)
- On `beforeunload` → set offline
- Heartbeat: update `last_seen` every 60s while online
- When querying another user's status: if `hide_online_status = true`, always show "offline" regardless of actual status

### Privacy Toggle UX
- Located in buyer/business dashboard settings and also accessible from the chat header
- Simple switch: "Others can see when I'm online"
- Default: ON (visible)

### Message Flow
1. User clicks "Message" on a business profile or developer card → creates/finds conversation → opens chat
2. Messages delivered in real time via Supabase Realtime postgres_changes
3. Unread count shown on nav icons and conversation list

