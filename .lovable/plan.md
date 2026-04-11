

## Plan: Add subtle AI agent hint below CTAs

Add a small, understated text link right after the two CTA buttons (line ~267) that says something like "or ask our AI agent →" which opens the TrustInsightsModal (already used in HeroSearchBar).

### Changes

**`src/pages/Index.tsx`**
- After the closing `</div>` of the Hero Power CTAs (line 267), add a subtle text button:
  - Styled as `text-[10px] text-muted-foreground` with a sparkle icon (`Sparkles` from lucide-react, ~10px)
  - Text: "or ask R8 Agent →" (with i18n keys for EN/AR)
  - On click: opens the TrustInsightsModal (reuse the existing `showInsights` state already in HeroSearchBar, or add a local state + modal instance here)
  - Entrance animation matching the CTAs but slightly delayed (`fadeInUp 0.6s ease-out 0.5s both`)
- Import `Sparkles` from lucide-react and `TrustInsightsModal` (if not already imported at page level)
- Add local state `const [showAgentHint, setShowAgentHint] = useState(false)` for the modal

**`src/i18n/locales/en.json`**
- Add `"hero.askAgent": "or ask R8 Agent"`

**`src/i18n/locales/ar.json`**
- Add `"hero.askAgent": "أو اسأل وكيل R8"`

### Result
A non-intrusive, secondary text link beneath the two main CTAs — no third button, no visual weight, just a gentle discovery path to the AI agent.

