

## Analysis: Repositioning the CTAs for Maximum Engagement

### Current State
The three CTA cards from the image ("Read all reviews", "Compare with another", "Upload your contract") plus "Protect your purchase now" and "Set a price alert" currently live deep in the page — after the hero, journey sections, and multiple widgets. A first-time visitor sees the Trust Gauge and review card but then must scroll significantly before encountering actionable next steps.

### The Problem
- **Decision fatigue**: After the impressive gauge animation, users have no immediate "what now?" prompt.
- **Lost momentum**: The psychological peak (seeing the trust score) has no funnel exit right next to it.
- **Cognitive overload**: CTAs buried below multiple sections compete with too much content.

### Psychological Strategy
1. **Peak-End Rule** — Place CTAs at the emotional peak (right after the gauge/review card animation completes) so users associate the "wow" moment with action.
2. **Paradox of Choice Mitigation** — Show exactly 3 clear paths (Read Reviews → Compare → Check Contract), each with a single-line benefit. No more, no fewer.
3. **Progressive Disclosure** — The gauge proves credibility, the CTAs channel that trust into action. The "Protect your purchase" button serves as a loss-aversion anchor below.
4. **Zeigarnik Effect** — Use directional arrows (→→) to signal an incomplete journey the user wants to finish.

### Plan

#### 1. Create a new `HeroNextSteps` component
A compact, 3-column card strip rendered **directly below the `HeroTrustShowcase`** (inside the hero card, before TractionStats). This is the single highest-attention position on the page.

**Design:**
- Header: "What to do next" (translated) — small, muted, centered
- 3 cards in a row (stacked on mobile):
  - **Read all reviews** — green checkmark icon, subtitle "Real owners · verified purchases · project-specific", CTA "Browse reviews →→"
  - **Compare with another** — amber plus icon, subtitle "Stack side-by-side with trust scores + AI analysis", CTA "Add to compare →→"  
  - **Upload your contract** — orange list icon, subtitle "AI checks for hidden clauses and payment traps", CTA "Check contract →→"
- Below cards: Full-width primary CTA button "Protect your purchase now" + secondary outline "Set a price alert"
- Bottom micro-copy: "● Verified buyers who checked this developer before signing saved an average of EGP 620K in hidden fees." (social proof / loss aversion)

**Interactions:**
- "Browse reviews" → navigates to `/reviews`
- "Add to compare" → opens `CompareModal`
- "Check contract" → opens `ContractUploadModal`
- "Protect your purchase" → navigates to `/auth` (if not logged in) or `/buyer`
- "Set a price alert" → navigates to `/deal-watch`

#### 2. Position in `Index.tsx`
Insert `<HeroNextSteps />` inside the hero block, right after the `<HeroTrustShowcase />` div and before `<TractionStats />`. This ensures it's visible within the first 1-2 scrolls on mobile.

```text
Hero Card
├── Tagline
├── Search Bar
├── HeroTrustShowcase (Gauge + Review Card)
├── ★ HeroNextSteps (NEW — 3 CTA cards + protect button) ★
├── TractionStats
└── MiniJourneyArc
```

#### 3. Translations
Add keys in both `en.json` and `ar.json` for all labels, subtitles, and CTAs.

#### 4. Animation
- Cards fade-in with stagger (100ms each) using IntersectionObserver
- "Protect" button has a subtle pulse animation on first appearance
- Social proof line types in character-by-character for attention

### Files to Create/Edit
| File | Action |
|------|--------|
| `src/components/HeroNextSteps.tsx` | **Create** — new component |
| `src/pages/Index.tsx` | **Edit** — insert component after HeroTrustShowcase |
| `src/i18n/locales/en.json` | **Edit** — add translation keys |
| `src/i18n/locales/ar.json` | **Edit** — add Arabic translation keys |

