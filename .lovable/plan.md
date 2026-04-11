

## Plan: Embed Search Bar + Storytelling Agent Card in Research Station

### What we're building

Replace the plain `HeroSearchBar` in the Research expanded section with a richer, storytelling-driven experience that matches the Research navy theme. The search bar stays but gets wrapped in a branded context card with:

1. **A storytelling header** — rotating micro-stories (real buyer outcomes) that cycle every 5s, styled in navy
2. **The existing HeroSearchBar** — embedded as-is (already has AI agent, compare, voice search)
3. **A value proposition strip** — 3 small stat/benefit pills ("Saved EGP 1.2M", "47 verified reviews", "3 risks flagged") that rotate with the stories
4. **A social proof footer** — "2,847 buyers used R8 Agent this week" + a "Share your experience" micro-CTA

### Visual Design

- Outer wrapper: `bg-gradient-to-br from-journey-research/8 to-transparent border border-journey-research/15 rounded-2xl` with subtle navy glassmorphism
- Story text: `text-[11px] italic text-foreground/80` with fade transition between stories
- Value pills: small rounded badges in navy tones
- Social proof: `text-[10px] text-muted-foreground` centered

### File Changes

**`src/components/JourneyScrollSections.tsx`**
- In the `research` expanded content block (lines 141-158), wrap the existing `HeroSearchBar` in a new storytelling container:
  - Add `storyIndex` state with `useEffect` cycling every 5s through 3 stories
  - Before the search bar: rotating story snippet with fade animation
  - After the search bar + stats: value pills that correspond to the active story
  - Below everything: social proof line + share CTA
- All text uses i18n keys for EN/AR

**`src/i18n/locales/en.json`** — Add keys under `journeyScroll.research`:
- `agentStory1`: "Ahmed searched 'SODIC reviews' — R8 Agent flagged hidden complaints → Saved EGP 1.5M"
- `agentStory2`: "Sara asked 'Is Mountain View reliable?' — 47 verified reviews pulled in seconds"
- `agentStory3`: "Omar compared 3 developers — Agent revealed one had 40% delayed projects"
- `agentValue1`: "Saved EGP 1.5M"
- `agentValue2`: "47 verified reviews"
- `agentValue3`: "3 risks flagged"
- `agentProof`: "2,847 buyers used R8 Agent this week"
- `agentShare`: "Tell a friend about R8"

**`src/i18n/locales/ar.json`** — Arabic equivalents for all above keys

### Result

The search bar feels native to the Research station — same navy palette, same trust language. Users see real outcomes before they even type, making the tools feel indispensable. The storytelling creates emotional connection and word-of-mouth motivation.

