

## Fix: Admin "New Conversation" Message Sending

### Problem
When an admin clicks "New Conversation" and selects a user, `startConvWithUser` navigates away to `/messages` instead of staying on the admin messaging panel. The admin should be able to create a conversation and immediately send messages from within the admin panel using the inline reply.

### Changes

**File: `src/components/AdminMessaging.tsx`**

1. Change `startConvWithUser` to stay on the admin panel instead of navigating to `/messages`:
   - After creating the conversation via RPC, call `fetchConversations()` to refresh the list
   - Auto-select the new conversation by calling `fetchMessages(convId)` so the message viewer opens
   - Remove the `navigate('/messages', ...)` call

2. Add error logging to `sendAdminReply` for better debugging — log the actual error object to console so we can see what's failing.

3. Add error handling to the participant insert step (currently silently fails if the INSERT is rejected by RLS).

### Technical Detail
The `find_or_create_conversation` RPC (SECURITY DEFINER) already adds both users as participants, so the admin will be a participant. The existing "Participants can send messages" INSERT policy on `messages` + the "Admins can send messages" policy should both allow the insert. The inline reply (`sendAdminReply`) already handles this correctly — the fix is just keeping the admin on the right page.

