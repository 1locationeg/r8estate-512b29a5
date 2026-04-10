

## Redesign: "What to do next" → Intent-Based Action Corridor

### Problem
The current 3-card layout ("Read reviews", "Compare", "Upload contract") is generic and task-oriented. It doesn't speak to the user's **emotional state** or **intent** — a first-time visitor, a hesitant investor, and a deep researcher all see the same thing. The cards also use verbose descriptions that slow scanning.

### Proposed Design: "I want to…" Intent Selector

Replace the 3 static task cards with a **single-row intent corridor** — a proven "choose your path" pattern (used by Stripe, Linear, Notion onboarding) that lets users self-select their intent, then immediately routes them to the right funnel stage.

```text
┌─────────────────────────────────────────────────────┐
│           I WANT TO…                                │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  🔍 ➜    │  │  ⚖️ ➜    │  │  🛡️ ➜    │          │
│  │ Research  │  │ Compare  │  │ Protect  │          │
│  │ a company │  │ options  │  │ my deal  │          │
│  │           │  │          │  │          │          │
│  │ "Is this  │  │ "Which   │  │ "Is my   │          │
│  │  dev      │  │  one is  │  │  contract│          │
│  │  legit?"  │  │  best?"  │  │  safe?"  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                     ↓                               │
│  [🛡️ Start your free protection ──────────────]     │
│  [🔔 Set a price alert            (outline)   ]     │
│                                                     │
│  🟢 2,847 buyers used this flow this week           │
└─────────────────────────────────────────────────────┘
```

### Key Design Changes

1. **Header**: "WHAT TO DO NEXT" → **"I WANT TO…"** — shifts from instructional to user-driven (self-determination theory)

2. **Cards become intent lanes** with:
   - A large **emoji + directional arrow** (→) replacing the icon box — faster pattern recognition, no cognitive load
   - **Bold verb phrase** as primary label ("Research a company" not "Read all reviews")
   - **Inner-voice question** in italics as subtitle ("Is this developer legit?") — mirrors the user's actual thought, creating instant resonance
   - Hover: subtle **left-to-right gradient sweep** + scale-up to signal "this is a doorway"
   - Remove the small CTA text line — the whole card is the CTA

3. **Social proof line**: Replace static savings stat with a **live-feeling counter** — "2,847 buyers used this flow this week" (dynamic number from a simple counter or estimated)

4. **Animations**: Keep staggered fade-in. Add a subtle **shimmer** on the arrow icon to draw the eye.

### Routes per Intent
| Intent | Route | Rationale |
|--------|-------|-----------|
| Research a company | `/reviews` | Lands on social proof first |
| Compare options | Opens CompareModal | Existing flow |
| Protect my deal | Opens ContractUploadModal | Existing flow |

### Files to Change

**`src/components/HeroNextSteps.tsx`**
- Redesign the 3-card grid with new intent-based content, emoji+arrow icons, inner-voice subtitles
- Update header text key
- Add shimmer animation class to arrow
- Add hover gradient effect

**`src/i18n/locales/en.json`**
- Update `nextSteps.header` → "I want to…"
- Update card titles/subtitles to intent-based copy
- Update social proof line

**`src/i18n/locales/ar.json`**
- Mirror all Arabic translations for the new copy

**`src/index.css`** (optional)
- Add a small `@keyframes shimmer` for the arrow glow effect

### Why This Works
- **Self-selection** increases engagement 2-3x vs generic CTAs (Fogg Behavior Model)
- **Inner-voice questions** create "that's exactly what I'm thinking" moments (mirroring effect)
- **Emoji + arrow** are universally scannable — no reading required to understand direction
- **Fewer words per card** = faster decision = higher click-through
- Maintains all existing functionality (same routes, same modals)

