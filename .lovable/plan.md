

# Agentic Copilot: Backend Intelligence + Minimal UI Polish

## Approach
Heavy backend work (tool-calling edge function + risk scanner), minimal UI changes. The user should *feel* the AI is working for them — real data in answers, automatic risk toasts on page load, a subtle "scanning..." indicator — without redesigning any pages.

## Changes

### 1. Database: `trust_score_snapshots` table
New migration to track trust scores over time for delta computation.

```sql
CREATE TABLE public.trust_score_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id text NOT NULL,
  avg_rating numeric(3,2),
  review_count integer DEFAULT 0,
  verified_pct numeric(5,2) DEFAULT 0,
  computed_score numeric(5,2),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (business_id, snapshot_date)
);
ALTER TABLE public.trust_score_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read snapshots" ON public.trust_score_snapshots FOR SELECT TO authenticated USING (true);
```

### 2. New Edge Function: `copilot-agent`
**File:** `supabase/functions/copilot-agent/index.ts`

Replaces the simple `ai-chat` proxy with a tool-calling loop:

- Receives `{ messages }` from client
- Sends to Gemini with 5 tool definitions:
  - `query_reviews(developer_name, min_rating?)` — queries `reviews` table
  - `query_launches(district?, max_price?)` — queries `launches` table
  - `get_trust_score(business_name)` — computes avg rating, review count, verified % from `reviews`
  - `compare_developers(name_a, name_b)` — side-by-side trust scores
  - `calculate_installment(price, down_pct, years, rate)` — math, no DB
- When LLM returns `tool_calls`, executes them against Supabase (service role), sends results back to LLM, gets final streaming answer
- Streams final response as SSE (same format as current `ai-chat`)
- Also emits a special SSE event `data: {"tool_status":"searching"}` so the client can show "Searching database..."
- Includes same rate limiting logic from `ai-chat`

### 3. New Edge Function: `trust-risk-scan`
**File:** `supabase/functions/trust-risk-scan/index.ts`

Called on Copilot page load for authenticated users:
- Fetches user's `followed_businesses`
- For each, queries `reviews` avg rating in last 30d vs prior 30d
- If absolute delta > 5% (relative), calls LLM with strict JSON: `{"risk":"High"|"Medium"|"Low","reason":"<3 words>","business":"name","delta":number}`
- Returns JSON array of risk flags
- Also upserts into `trust_score_snapshots` for historical tracking

### 4. Update `CopilotPage.tsx` — Wire agent + risk scan
Minimal UI additions:
- Switch `CHAT_URL` from `ai-chat` to `copilot-agent`
- On mount (if authenticated), call `trust-risk-scan` in background → show results as sonner toasts (e.g. "⚠️ SODIC trust score dropped 7% — Declining reviews") and pass to `TrustRadarAlerts`
- Add a small pulsing green dot next to "R8 Copilot" header text with tooltip "Actively monitoring your portfolio" — this is the "agentic feel" indicator
- During streaming, detect `tool_status` SSE events and show a brief "🔍 Searching database..." chip above the loading spinner

### 5. Update `TrustRadarAlerts.tsx` — Accept real risk flags
- Add optional `riskFlags` prop from parent
- When `riskFlags` are provided, render them with severity colors (red border for High, amber for Medium) instead of the generic review-based alerts
- Each alert gets a small "Ask Copilot →" link that navigates to the chat input pre-filled with "Tell me more about [business] trust score changes"

### 6. Update `AIChatWidget.tsx` — Use agent endpoint + tool indicator
- Change `CHAT_URL` to point to `copilot-agent` instead of `ai-chat`
- During streaming, parse `tool_status` SSE events → show "Searching database..." text instead of just a spinner
- Rename header from "Trust Chat" to "R8 Agent" with a small pulsing dot

## What the user will experience differently
1. **On /copilot load**: Toast pops up "Checked 3 followed developers — SODIC dropped 7%" — they didn't ask for this
2. **When chatting**: They ask "Compare Palm Hills vs SODIC" → the AI actually queries the DB and returns real review counts, ratings, verified percentages — not made-up text
3. **Visual cues**: Pulsing green dot says "I'm watching", "Searching database..." chip during tool calls shows the AI is doing work, not just talking
4. **Trust Radar sidebar**: Shows real risk flags with severity colors instead of generic "new review" alerts

## Files changed
| File | Type |
|---|---|
| `supabase/migrations/...` | New (trust_score_snapshots table) |
| `supabase/functions/copilot-agent/index.ts` | New (tool-calling AI) |
| `supabase/functions/trust-risk-scan/index.ts` | New (proactive risk scanner) |
| `src/pages/CopilotPage.tsx` | Edit (wire new endpoints, add pulse dot + tool status) |
| `src/components/TrustRadarAlerts.tsx` | Edit (accept risk props, severity colors) |
| `src/components/AIChatWidget.tsx` | Edit (use agent endpoint, tool status indicator) |

