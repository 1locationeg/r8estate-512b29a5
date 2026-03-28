

## Step Timeline — "What Do I Actually Do Here?"

### Position

**After the Quick Actions Grid, before the Featured Identity Spotlight** (after line 377, before line 399 in Index.tsx). This is the best spot because:

- User has already seen trust proof (Trust Strip), understood the process (How We Work), browsed categories, and seen action cards
- At this point they're thinking "okay but what do I *actually do* on this platform?" — the Step Timeline answers that in under 10 seconds
- Placing it before Featured Spotlight and Smart Recommendations means users who were about to drop off get re-engaged right before the content feed
- It acts as an **activation bridge**: process understanding → concrete user actions → content exploration

### What We're Building

A `StepTimeline` component — a vertical (mobile) / horizontal (desktop) animated timeline showing 4 concrete user actions with scroll-triggered reveal animations.

### Design Language (AI Vibes)

- Scroll-triggered staggered fade-in using Intersection Observer — each step animates in as user scrolls
- Vertical timeline on mobile with a glowing animated line, horizontal on desktop
- Each step: numbered circle (with pulse on active), icon, title, one-line description
- Subtle gradient glow on the timeline connector line (`bg-gradient-to-b from-primary/40 via-primary to-primary/40`)
- AI shimmer header pill (consistent with HowWeWork)
- Steps: **Search** → **Compare** → **Review** → **Decide** (concrete actions, not abstract concepts)

### Steps Content

1. **Search** — "Find developers, projects, or services by name, category, or location"
2. **Compare** — "Stack companies side-by-side with trust scores and real reviews"
3. **Review** — "Share your experience and help the community make better decisions"
4. **Decide** — "Choose with confidence, backed by verified data and AI insights"

### Files

#### 1. New: `src/components/StepTimeline.tsx`
- Uses `IntersectionObserver` to trigger staggered animations per step
- Vertical layout on mobile (timeline line on the left), horizontal on desktop
- Each step gets `opacity-0 translate-y-4` → `opacity-100 translate-y-0` with staggered delays
- Numbered circles with `bg-primary text-primary-foreground` and a subtle ring pulse
- Icons: `ScanSearch`, `GitCompare`, `MessageSquarePlus`, `BadgeCheck`
- AI shimmer headline: "Here's how you get started"
- RTL support via `useTranslation()` + `dir`

#### 2. Edit: `src/i18n/locales/en.json` — Add `stepTimeline` namespace
```json
"stepTimeline": {
  "headline": "Here's how you get started",
  "subtitle": "Four steps to confident decisions",
  "step1Title": "Search",
  "step1Desc": "Find developers, projects, or services by name, category, or location.",
  "step2Title": "Compare",
  "step2Desc": "Stack companies side-by-side with trust scores and real reviews.",
  "step3Title": "Review",
  "step3Desc": "Share your experience and help the community decide better.",
  "step4Title": "Decide",
  "step4Desc": "Choose with confidence, backed by verified data and AI insights."
}
```

#### 3. Edit: `src/i18n/locales/ar.json` — Arabic `stepTimeline` namespace

#### 4. Edit: `src/pages/Index.tsx`
- Import `StepTimeline`
- Render `<StepTimeline />` inside `w-full max-w-[1100px]` wrapper after the Quick Actions Grid (line ~377), before Featured Identity Spotlight

### Component Structure

```text
Desktop:
┌──────────────────────────────────────────────────┐
│  ✨ Here's how you get started                   │
│     Four steps to confident decisions            │
├──────────────────────────────────────────────────┤
│  ①──────────②──────────③──────────④              │
│  Search    Compare    Review     Decide          │
│  desc      desc       desc       desc            │
└──────────────────────────────────────────────────┘

Mobile (vertical):
┌────────────────────┐
│  ✨ Get started     │
├────────────────────┤
│  ① Search          │
│  │  desc           │
│  ② Compare         │
│  │  desc           │
│  ③ Review          │
│  │  desc           │
│  ④ Decide          │
│     desc           │
└────────────────────┘
```

Each step fades in with a 150ms stagger as the section enters the viewport.

### No database changes needed

