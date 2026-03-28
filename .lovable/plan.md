

## "How We Work" — 3-Column Story Arc Section

### Position

**After the Trust Strip, before Category Links** (between lines 321 and 324 in Index.tsx). This is the ideal spot because:
- User has just seen trust signals (verified reviews, real buyers, real experts) — they're primed to ask "but how?"
- Placing it before category browsing answers that question and builds confidence before exploration
- It acts as a narrative bridge: trust proof → process explanation → action

### What We're Building

A `HowWeWork` component with three cards in a **Collect → Analyse → Decide** story arc. Each card has:
- A numbered step indicator with a connecting line between them
- An icon with subtle animated glow
- Title + short description
- **On hover**: dark inversion (bg flips to primary, text to white) with a scale-up — tactile delight
- A motivational headline above: "Your journey from doubt to confidence" with a subtle AI shimmer effect
- Bilingual AR/EN support

### Design Language (AI Vibes)

- Cards: `bg-card border border-border` default → `bg-primary text-primary-foreground` on hover
- Connecting dotted line between steps (horizontal desktop, vertical mobile)
- Icons: `Search` (Collect), `BrainCircuit` (Analyse), `BadgeCheck` (Decide)
- Headline uses `backdrop-blur` pill with gradient text
- Subtle `animate-pulse-glow` on the AI/Analyse card icon
- Step numbers in small monospace font with `text-accent`

### Files

#### 1. New: `src/components/HowWeWork.tsx`
- 3-column grid (responsive: stack on mobile)
- Hover state via Tailwind `group-hover:` classes for dark inversion + scale
- Dotted connector line via pseudo-elements or a flex separator
- Uses `useTranslation()` for all text
- Motivational header with AI shimmer animation

#### 2. Edit: `src/i18n/locales/en.json` — Add `howWeWork` namespace
```json
"howWeWork": {
  "headline": "Your journey from doubt to confidence",
  "subtitle": "Powered by community intelligence",
  "step1Title": "Collect",
  "step1Desc": "Real buyers share verified experiences — no fake reviews, no paid opinions.",
  "step2Title": "Analyse",
  "step2Desc": "AI processes thousands of data points to build trust scores you can rely on.",
  "step3Title": "Decide",
  "step3Desc": "Make confident real estate decisions backed by transparent, community-driven insights."
}
```

#### 3. Edit: `src/i18n/locales/ar.json` — Arabic `howWeWork` namespace

#### 4. Edit: `src/pages/Index.tsx`
- Import `HowWeWork`
- Render `<HowWeWork />` inside `w-full max-w-[1100px]` wrapper after Trust Strip, before Category Links

### Component Structure

```text
┌──────────────────────────────────────────────────┐
│  ✨ Your journey from doubt to confidence        │
│     Powered by community intelligence            │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────┐ ·····> ┌──────┐ ·····> ┌──────┐       │
│  │  01  │        │  02  │        │  03  │       │
│  │  🔍  │        │  🧠  │        │  ✅  │       │
│  │Collect│       │Analyse│       │Decide │       │
│  │ desc  │        │ desc  │        │ desc  │       │
│  └──────┘        └──────┘        └──────┘       │
│                                                  │
│  [ hover any card → dark inversion + scale ]     │
└──────────────────────────────────────────────────┘
```

### No database changes needed

