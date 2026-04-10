

## Fix: FAB Overlapping Send Button on Messages Page

### Problem
The `FloatingChatFAB` is rendered globally on every page (including `/messages`) at `fixed bottom-20 md:bottom-6 end-4 z-50`. On the messages page, this overlaps the send button in the chat input area.

### Solution
Hide the FAB on the `/messages` route entirely — the messages page already has its own chat UI, so showing a chat FAB there is redundant and causes overlap.

### Changes

**`src/components/FloatingChatFAB.tsx`**
- Import `useLocation` from `react-router-dom`
- Get the current pathname
- Return `null` early when pathname starts with `/messages` (same pattern used by `BottomNav` which already hides on `/messages`)

This is a 3-line change that cleanly prevents overlap on the messages page without affecting any other page.

