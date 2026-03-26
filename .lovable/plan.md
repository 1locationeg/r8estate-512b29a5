

## Fix: Hidden Message Textbox on Mobile/PWA

The core issue is that on mobile, when a chat thread is active, the input box gets hidden behind the BottomNav (which is 48px + safe area) and/or pushed off-screen by virtual keyboard. The `pb-16` on the mobile container reserves space for BottomNav, but when inside a chat thread, the BottomNav should be hidden entirely so the input can use the full viewport.

### Root Cause
- Mobile chat container uses `h-[calc(100dvh)] pb-16` -- the `pb-16` steals 64px from the chat, pushing the input below the fold
- BottomNav is always visible even during active chat threads
- No scroll-to-bottom on textarea focus (keyboard pushes content up but input stays hidden)

### Changes

**1. Hide BottomNav when in active chat (Messages page)**
- `src/components/BottomNav.tsx`: Hide the BottomNav when route is `/messages` AND a chat thread is active. Simplest approach: hide BottomNav entirely on `/messages` route since the chat thread has its own back button.

**2. Fix mobile container in Messages.tsx**
- Remove the `pb-16` when an active conversation is open (no BottomNav visible)
- Keep `pb-16` only for the conversation list view

**3. Scroll-to-bottom on focus in ChatThread.tsx**
- Add `onFocus` handler to the Textarea that scrolls `bottomRef` into view
- Use `visualViewport` resize listener to adjust when virtual keyboard opens

**4. RTL-safe logical properties audit**
- Already using `start-0`, `end-0`, `ms-auto`, `border-s`, `ps-3` throughout -- these are correct
- Ensure the ArrowLeft icon gets `rtl:rotate-180` class

### File-by-file

**`src/components/BottomNav.tsx`**
- Add check: if `location.pathname === "/messages"`, return only the spacer div (or null) to hide the nav bar during messaging

**`src/pages/Messages.tsx`**
- Mobile container: change from `h-[calc(100dvh)] pb-16` to conditional classes
  - When `activeConv` is set: `h-[100dvh]` (no bottom padding, full height for chat)
  - When showing conversation list: keep `h-[calc(100dvh)] pb-16` for BottomNav space

**`src/components/ChatThread.tsx`**
- Add `onFocus` to Textarea that triggers `bottomRef.current?.scrollIntoView()`
- Add `useEffect` with `window.visualViewport?.addEventListener('resize', ...)` to scroll input into view when keyboard opens
- Add `rtl:rotate-180` to the ArrowLeft back button icon

