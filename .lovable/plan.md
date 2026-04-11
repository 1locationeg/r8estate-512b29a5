

## Plan: Compact Result Badge with Rating Stars & Reviewer Avatars

### What changes

Replace the long text result in the agent teaser with a compact, Trustpilot-inspired result badge — a pill/card that shows the verdict as a short label, star rating, and stacked reviewer avatars with count. Visitors instantly scan the result without reading paragraphs.

### Result UI (replaces lines 602-614)

Each `agentTeaserPair` gets additional data: `rating` (number), `reviewerCount` (number), and a short `verdict` label (e.g., "Not Recommended", "Top Pick", "Wait for Launch").

**Layout of result badge:**

```text
┌──────────────────────────────────────────────┐
│  ⚠️  Not Recommended                        │
│  ★★★★★  4.8  ·  👤👤👤👤 +253 reviewers      │
│  "Backed by 253 verified buyer reviews"      │
└──────────────────────────────────────────────┘
```

- **Line 1**: Verdict label — bold, colored (red/green/amber by type), large font
- **Line 2**: 5 green filled stars (like attached image), rating number, then 4-5 overlapping circular avatars + "+N" count
- **Line 3**: Small social proof text like "Recommended by 312 buyers" or "253 reviews flagged concerns"

### Detailed Changes in `src/components/HeroTrustShowcase.tsx`

**1. Update `agentTeaserPairs` (lines 106-110)** — add fields:

```typescript
const agentTeaserPairs = [
  { question: "Is Ora Developers safe?", verdict: "Not Recommended", rating: 2.1, reviewerCount: 253, type: "warning" },
  { question: "Best compounds in New Cairo?", verdict: "Top Pick — Mivida", rating: 4.8, reviewerCount: 312, type: "positive" },
  { question: "Mountain View vs Emaar?", verdict: "Wait for Launch", rating: 4.2, reviewerCount: 187, type: "insight" },
];
```

Remove the long `answer` field entirely.

**2. Replace result phase UI (lines 602-614)** with:

- A rounded card/pill with colored background tint (light red/green/amber by type)
- Verdict text: `text-base md:text-lg font-bold`
- Star row: 5 star icons filled with brand green (`#00b67a` like Trustpilot), rating number beside them
- Avatar stack: 4-5 small circles (using `generateAvatar` initials or colored circles) overlapping with `-ml-2`, then `+{count}` text
- Social proof line: small muted text "Recommended by X buyers" / "X reviews flagged risks"

**3. Keep the pulsing CTA button** below the badge unchanged.

**No other files change.** Single file edit to `HeroTrustShowcase.tsx`.

### Technical Details

- Stars rendered as 5 `Star` icons from lucide-react, filled with `fill-[#00b67a] text-[#00b67a]` to match the uploaded Trustpilot-style green
- Avatar stack uses hardcoded color array for variety, rendered as `w-6 h-6 rounded-full` divs with initials
- The verdict badge container uses `rounded-xl px-4 py-3` with type-based bg: `bg-red-500/10`, `bg-emerald-500/10`, `bg-amber-500/10`

