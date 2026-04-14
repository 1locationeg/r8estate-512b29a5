

## Plan: Interactive & Status-Aware Journey Tips

### What changes

1. **Track completed actions per zone** — Extend `useCorridorEngagement` to also store which specific actions the user has performed (e.g. `{ 1: ["search", "suggestion_click"], 2: ["entity_view"] }`). This will be persisted in localStorage alongside the existing engagement data.

2. **Map each tip to an action and a route** — Convert `STATION_TIPS` from simple strings to objects with `{ label, action, route }`:
   - Zone 1: "Search for a developer or project" → `/` (focus search), "Click a suggestion" → `/`, "Try AI assistant" → `/` (open AI chat)
   - Zone 2: "View a company profile" → `/reviews`, "Open the comparison tool" → `/reviews` (compare), "Check a spotlight card" → `/`
   - Zone 3: "Explore a deal or launch" → `/deals`, "View pricing plans" → `/`, "Read 'How We Work'" → `/`
   - Zone 4: "Visit the community" → `/community`, "Submit feedback" → `/community`, "Write a review" → `/reviews`

3. **Green bullet for completed tips** — Change each tip bullet from a static grey dot to a green checkmark when the mapped action has been performed, or keep the grey dot when pending.

4. **Make tips clickable** — Wrap each tip in a `<button>` that navigates to the relevant route (using `react-router-dom`'s `useNavigate`) and closes the breakdown popover.

### Technical details

**File: `src/hooks/useCorridorEngagement.ts`**
- Add a `completedActions` state: `Record<number, string[]>` tracking which actions have fired per zone.
- On `trackEngagement`, append the action to the zone's list (deduplicated).
- Persist to localStorage alongside zone scores; merge on DB load.
- Return `completedActions` from the hook.

**File: `src/components/JourneyCorridor.tsx`**
- Import `useNavigate`.
- Replace `STATION_TIPS` with `STATION_TIP_ITEMS: Record<number, { label: string; action: string; route: string }[]>`.
- In the tip rendering section (lines 248-256), for each tip:
  - Check if `completedActions[zone]?.includes(tip.action)` → green dot + strikethrough or green check.
  - Wrap in a clickable `<button>` that calls `navigate(tip.route)` and `setShowBreakdown(false)`.

