

## Compare Engine — Landing Page Showcase Section

### Position

**After the Step Timeline, before the Featured Identity Spotlight** (after line 403, before line 405 in Index.tsx). This is the optimal spot because:
- User just learned "how to get started" (Step Timeline) — now they see the Compare tool in action as a concrete payoff
- It sits right before content recommendations, acting as a conversion hook before users browse
- Visually breaks up the flow with a rich, interactive-feeling preview

### What We're Building

A new `CompareEngineShowcase` component — a static but visually rich preview of the comparison tool with animated bar charts, gold/rust color coding, and a gated CTA.

### Design

```text
┌──────────────────────────────────────────────────┐
│  ✨ Compare before you commit                    │
│     AI-powered side-by-side analysis             │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐  vs  ┌─────────────┐           │
│  │ Developer A  │      │ Developer B  │           │
│  │ ████████ 4.2 │      │ █████░░ 3.1  │           │
│  │ ██████░ 78%  │      │ ████░░░ 52%  │           │
│  │ ███████ 85%  │      │ █████░░ 61%  │           │
│  └─────────────┘      └─────────────┘           │
│                                                  │
│  [ 🔓 Export Full Report — Pro ]  [ Compare Now ] │
│                                                  │
│  Powered by community intelligence               │
└──────────────────────────────────────────────────┘
```

- **Bar charts**: Scroll-triggered width animation (0% → target%) with staggered delays
- **Color coding**: Gold (`text-accent` / `bg-accent`) for scores ≥ 3.5, Rust (`text-red-500` / `bg-red-400`) for < 3.5
- **Metrics shown**: Trust Score, Delivery Quality, Value for Money (3 rows)
- **Monetisation hook**: "Export Full Report" button styled with a lock icon + "Pro" badge — clicking navigates to `/auth` or shows upgrade prompt
- **"Compare Now" CTA**: Opens the existing `CompareModal` or navigates to categories
- **AI shimmer headline** consistent with HowWeWork and StepTimeline

### Files

#### 1. New: `src/components/CompareEngineShowcase.tsx`
- Static mock data for two fictional developers (no DB call)
- `IntersectionObserver` triggers bar width animations on scroll
- 3 metric rows with animated colored bars + score labels
- Two CTAs: "Export Full Report" (gated, lock icon + Pro badge) and "Compare Now"
- RTL/LTR via `useTranslation()`

#### 2. Edit: `src/i18n/locales/en.json` — Add `compareEngine` namespace
```json
"compareEngine": {
  "headline": "Compare before you commit",
  "subtitle": "AI-powered side-by-side analysis",
  "trustScore": "Trust Score",
  "deliveryQuality": "Delivery Quality",
  "valueForMoney": "Value for Money",
  "exportReport": "Export Full Report",
  "proBadge": "Pro",
  "compareNow": "Compare Now",
  "poweredBy": "Powered by community intelligence"
}
```

#### 3. Edit: `src/i18n/locales/ar.json` — Arabic `compareEngine` namespace

#### 4. Edit: `src/pages/Index.tsx`
- Import `CompareEngineShowcase`
- Render after StepTimeline (line 403), before Featured Identity Spotlight

### No database changes needed

