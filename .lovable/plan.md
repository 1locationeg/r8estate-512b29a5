

## Messaging Entry Points — Contact Buttons Everywhere

### Overview
Add "Message" / "Contact" buttons across three key surfaces so buyers, businesses, and admins can initiate conversations naturally from wherever they are.

### Changes

**1. Entity/Business Profile Page — "Contact" button**

File: `src/components/ItemDetailSection.tsx`

- Add a "Message" button in the action buttons row (line ~596-629), next to "Ask Community"
- On click: if not authenticated, redirect to `/auth`; if authenticated, call `startConversation(entityOwnerId)` from `useMessages` hook, then navigate to `/messages` with the conversation active
- For entities that map to a `business_profiles` record, look up the `user_id` of that business to message them
- For mock/unclaimed entities, show a toast: "This business hasn't been claimed yet"

**2. Admin Dashboard — "Message User/Business" action**

File: `src/components/AdminMessaging.tsx`

- Add a "New Conversation" button at the top of the admin messaging panel
- Shows a simple user search (by name/email from `profiles` table)
- Admin selects a user → calls `find_or_create_conversation` RPC → navigates to `/messages`
- Also add a "Message" quick-action button on each conversation row in the admin view (opens the conversation in the main `/messages` page)

**3. Admin Dashboard — Inline "Send as Admin" in conversations**

File: `src/components/AdminMessaging.tsx`

- Add an RLS policy so admins can INSERT messages into any conversation
- Add a text input + send button in the admin message viewer so admins can reply directly from the admin panel without navigating away

**4. Database — Admin message insertion policy**

New migration:
```sql
-- Allow admins to insert messages into any conversation
CREATE POLICY "Admins can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to participate in any conversation  
CREATE POLICY "Admins can join conversations"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

**5. Developer Detail Cards — "Message" button**

Files: `src/components/DeveloperDetailCard.tsx`, `src/components/DeveloperDetailModal.tsx`

- Add a "Message" icon button alongside existing action buttons
- Same flow: find business `user_id` → `find_or_create_conversation` → navigate to `/messages`

**6. Shared utility hook**

File: `src/hooks/useStartChat.ts` (new)

- A small reusable hook: `useStartChat()` returns `startChat(otherUserId: string)`
- Handles auth check, calls `find_or_create_conversation` RPC, navigates to `/messages` with conversation ID in state
- Used by ItemDetailSection, DeveloperDetailCard, DeveloperDetailModal, and AdminMessaging

**7. Messages page — Accept incoming navigation state**

File: `src/pages/Messages.tsx`

- Read `location.state.conversationId` on mount
- If present, auto-select that conversation so the chat opens immediately

### Technical Details

- The `find_or_create_conversation` RPC already exists and handles deduplication
- Entity-to-user mapping: query `business_profiles` where entity mock ID matches, get `user_id`
- For mock entities without a claimed business profile, the message button shows but displays a toast explaining the business isn't on the platform yet
- Admin messaging uses existing admin RLS SELECT policies; new INSERT policies needed for admins to send messages and join conversations

