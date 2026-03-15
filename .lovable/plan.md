

## Plan: Voice Search + AI-Enhanced Autocomplete in Search Bar

### What We're Building
1. **Mic icon inside the search bar** — uses browser Web Speech API for voice-to-text
2. **AI-powered autocomplete** — as the user types (debounced), call the existing `ai-chat` edge function to get smart suggestions beyond the static fuzzy search
3. **Enhanced spell correction** — AI suggests corrections inline in the dropdown

### Changes

#### 1. Add Voice Search to `HeroSearchBar.tsx`
- Add a `Mic` icon button between the search input and the Search icon (line ~153)
- Use the browser's `webkitSpeechRecognition` / `SpeechRecognition` API (no external dependency needed)
- State: `isListening` boolean — toggles mic icon style (animated pulse when active)
- On speech result, set the query text and trigger focus
- Support both English and Arabic recognition based on current i18n language
- Show a visual indicator (red pulsing dot or mic color change) when listening

#### 2. AI-Enhanced Autocomplete in `SearchSuggestions.tsx`
- Add a debounced call (500ms) to the `ai-chat` edge function when query length >= 3 characters
- Send a prompt like: "Suggest 3-5 autocomplete results for the Egyptian real estate search query: '{query}'. Return as JSON array of strings."
- Display AI suggestions in a new "AI Suggestions" section at the top of the dropdown with a Sparkles icon
- Merge with existing fuzzy search results (AI section appears above local results)
- Show a small loading spinner while AI suggestions load

#### 3. AI Spell Correction Enhancement
- When the existing `findSpellCorrection` returns null but query has 3+ chars, ask AI for correction via the same edge function
- Display AI-corrected suggestion in the existing spell correction banner

#### 4. Update Edge Function `ai-chat/index.ts`
- Add a `mode` parameter: `"chat"` (default) or `"autocomplete"`
- For `"autocomplete"` mode, use a focused system prompt and return non-streaming JSON with suggestions
- Use tool calling to get structured `{ suggestions: string[], correction?: string }` output

#### 5. Translation Keys
- Add `hero.voiceSearch`, `hero.listening`, `search.aiSuggestions` to both `en.json` and `ar.json`

### Files to Create/Edit
- `src/components/HeroSearchBar.tsx` — add mic button + voice recognition logic
- `src/components/SearchSuggestions.tsx` — add AI suggestions section
- `supabase/functions/ai-chat/index.ts` — add autocomplete mode
- `src/i18n/locales/en.json` — new keys
- `src/i18n/locales/ar.json` — new keys

