

# Copilot Agentic Onboarding: Preference Clouds + Personalized Dashboard

## Concept
Instead of opening with a chat box, the Copilot page detects first-time users (no preferences saved) and shows an interactive **preference cloud** — bubbles/chips the user taps to tell the agent about themselves. Once done, the page shifts to a **personalized briefing dashboard** with tailored insights. The chat stays accessible but is secondary, not the first thing they see.

## How It Works

**First visit (no preferences saved):**
1. User sees a greeting: "Let me learn about you so I can work for you"
2. Multi-step bubble clouds appear — user taps to select:
   - **Step 1 — Purpose**: "First home", "Investment", "Resale", "Vacation"
   - **Step 2 — Budget**: "Under 2M", "2-5M", "5-10M", "10M+"
   - **Step 3 — Locations**: "New Cairo", "Sheikh Zayed", "6th October", "North Coast", "New Capital", etc.
   - **Step 4 — Concerns**: "Developer trust", "Delivery delays", "Hidden fees", "Contract terms", "Resale value"
3. Preferences saved to a new `copilot_preferences` table
4. Agent auto-generates a first briefing based on selections (calls copilot-agent with context)

**Return visits (preferences exist):**
1. Skip clouds entirely — go straight to personalized dashboard
2. Dashboard shows: tailored insights cards (based on their budget/location/concerns), risk alerts, matched launches, then chat below
3. Cards like: "3 new launches in Sheikh Zayed under 5M", "Trust alert: Developer X rating dropped", "Top-rated in New Cairo this week"

## Changes

### 1. New DB Table: `copilot_preferences`
Stores the user's selections from the onboarding clouds.

```sql
CREATE TABLE public.copilot_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose text,
  budget_range text,
  preferred_locations text[] DEFAULT '{}',
  concerns text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.copilot_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON public.copilot_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 2. New Component: `CopilotOnboarding.tsx`
Multi-step preference cloud selector:
- 4 steps with animated bubble chips
- Each step is a category; user taps multiple chips (multi-select for locations/concerns, single for purpose/budget)
- Progress dots at bottom
- On completion: upserts into `copilot_preferences`, then triggers a personalized briefing call to copilot-agent
- Smooth transition animation to dashboard view

### 3. New Component: `CopilotBriefingDashboard.tsx`
Personalized insight cards shown to returning users:
- Fetches preferences from `copilot_preferences`
- Calls copilot-agent with a structured prompt: "Generate 3 personalized insights for a user interested in [purpose] with budget [budget] in [locations] concerned about [concerns]"
- Renders insights as cards with icons
- Shows "Edit preferences" button to re-enter the cloud flow
- Risk alerts and matched launches below
- Chat section at the bottom (collapsed by default, expandable)

### 4. Update `CopilotPage.tsx`
- On mount, check if `copilot_preferences` exists for user
- If no preferences: show `<CopilotOnboarding />` 
- If preferences exist: show `<CopilotBriefingDashboard />` with chat below
- For unauthenticated users: show a simplified version with generic insights + prompt to sign up

### 5. Update `copilot-agent` Edge Function
- Accept optional `preferences` context in the request body
- When preferences are provided, inject them into the system prompt so the agent's answers are personalized: "This user is looking for [purpose] with budget [budget] in [locations]. Their concerns are [concerns]."

## User Experience Flow

```text
First visit to /copilot
        │
        ├── Check copilot_preferences → empty
        │
        ▼
  Onboarding Clouds (4 steps)
  ┌─────────────────────────┐
  │  "What brings you here?" │
  │  ○ First home  ○ Invest  │
  │  ○ Resale    ○ Vacation  │
  └─────────────────────────┘
        │ (tap selections)
        ▼
  ┌─────────────────────────┐
  │  "What's your budget?"   │
  │  ○ Under 2M   ○ 2-5M    │
  │  ○ 5-10M      ○ 10M+    │
  └─────────────────────────┘
        │
        ▼
  ┌─────────────────────────┐
  │  "Where are you looking?"│
  │  ○ New Cairo  ○ Zayed    │
  │  ○ October   ○ Coast     │
  └─────────────────────────┘
        │
        ▼
  ┌─────────────────────────┐
  │  "What concerns you?"    │
  │  ○ Trust  ○ Delays       │
  │  ○ Fees   ○ Contracts    │
  └─────────────────────────┘
        │ Save to DB
        ▼
  Agent generates first briefing
  → Personalized dashboard appears

Return visit to /copilot
        │
        ├── Check copilot_preferences → exists
        │
        ▼
  Personalized Dashboard
  ┌──────────────────────────────┐
  │ "Good morning, Ahmed"         │
  │ ┌────┐ ┌────┐ ┌────┐        │
  │ │ 3   │ │ ⚠️ │ │ 📈 │        │
  │ │new  │ │risk│ │top │        │
  │ │in   │ │flag│ │rated│       │
  │ │Zayed│ │    │ │    │        │
  │ └────┘ └────┘ └────┘        │
  │                              │
  │ [Risk Alerts] [Launches]     │
  │ [Ask Agent ▼]                │
  └──────────────────────────────┘
```

## Files Summary
| File | Action |
|---|---|
| `supabase/migrations/...copilot_preferences.sql` | New table |
| `src/components/CopilotOnboarding.tsx` | New (preference clouds) |
| `src/components/CopilotBriefingDashboard.tsx` | New (personalized cards) |
| `src/pages/CopilotPage.tsx` | Edit (route between onboarding/dashboard) |
| `supabase/functions/copilot-agent/index.ts` | Edit (accept preferences context) |

