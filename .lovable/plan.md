

## Enhance Developer Bridge Card: Better Matching, Autocomplete & Chat Button

### What We're Building

1. **Bridge card shows with or without @ mention** — currently matching logic works but the card is gated to verified buyers only. We'll keep verified-buyer gating but ensure plain text mentions (e.g. just "emaar" or "palm hills" without @) trigger the card reliably.

2. **Business name autocomplete in post composer** — when writing a post in `CommunityNewPost`, typing `@` followed by characters shows a dropdown of matching developers from the mock data list, letting the user pick one to insert.

3. **Message/Chat button on bridge card** — add a "Message Business" button next to the download report button, using the existing `useStartChat.startChatWithBusinessId` hook.

---

### Files to Change

#### 1. `src/components/DeveloperBridgeCard.tsx`
- The matching logic already handles plain text (no @). The current issue is likely that single common words like "emaar" fail the word-boundary check against multi-word names. Fix: also check if any single alias word appears as a standalone word in the normalized text (not just for single-word dev names).
- Add a **"Message Business"** button using `useStartChat.startChatWithBusinessId(matchedDev.id)`. Place it alongside the existing download button in a 2-column layout.
- Import `MessageCircle` from lucide-react and `useStartChat` hook.

#### 2. `src/components/CommunityNewPost.tsx` — Add @mention autocomplete
- Track cursor position in the textarea. On each keystroke, detect if the user is mid-`@mention` (find `@` before cursor, extract partial query).
- Filter `developers` array by partial match on name/id.
- Show a small absolute-positioned dropdown list of matching developers (logo + name).
- On selection, replace the `@partial` text with `@developer-name` and close the dropdown.
- Use a `useState` for suggestion list + selected index, keyboard nav (up/down/enter/escape).

#### 3. `src/components/CommunityPostDetail.tsx`
- No changes needed — bridge card is already rendered there.

---

### Technical Details

**Matching fix** — In `findMentionedDeveloper`, for each developer, after multi-word phrase check, add a check: for each alias in the set, test `new RegExp(\b${alias}\b, 'i')` against the normalized text. This catches "emaar" in "I visited emaar showroom" without needing @.

**Autocomplete component** — Create a small inline `DeveloperMentionSuggestions` component rendered inside the `CommunityNewPost` dialog, positioned relative to the textarea. It filters developers on the current @-query fragment and inserts the selected name.

**Chat button** — Uses existing `useStartChat` which looks up `business_profiles.user_id` by mock ID. If the business isn't claimed, it shows a toast. The button will be a secondary outline button with a `MessageCircle` icon.

