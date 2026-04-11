

## Plan: Upgrade Agent Teaser — Station Progress Bar + Bold Recommendations

### What changes

Two upgrades to the agent teaser in `HeroTrustShowcase.tsx`:

**1. Replace linear progress bar with a 3-station milestone tracker**

Instead of a plain `<Progress>` bar, render a horizontal track with 3 station dots connected by a line. As each processing step completes, the corresponding station dot fills with color (journey-research navy → trust-excellent green on completion). The 4 processing steps map to 3 stations: step 1 = station 1 lights, step 2-3 = station 2 lights, step 4 = station 3 lights (all done).

```text
  ●────────●────────●
  Scan    Analyze  Score
  (navy)  (navy)   (green=done)
```

Each station: a 10px circle, connected by a 2px line. Inactive = `border-muted-foreground/30`, active = `bg-journey-research`, completed = `bg-trust-excellent` with a mini checkmark inside. A small label below each dot.

**2. Replace short answers with bold, actionable recommendations**

Update `agentTeaserPairs` with longer, clear recommendation text styled prominently:

- Pair 1: `"⚠️ I recommend you wait — 3 red flags detected. Delivery delayed 18 months. Check Mountain View instead, 94% on-time."`
- Pair 2: `"✅ I recommend Mivida — tops New Cairo with 98% on-time delivery and 4.7★ average from 312 verified buyers."`
- Pair 3: `"📊 Emaar leads by 12% in finishing quality. But wait — a new launch is expected next month with better pricing."`

The result text renders at `text-sm md:text-base font-bold` with a colored left border (green for positive, amber for caution, red for warning) to make the recommendation visually dominant in the card.

### File Changes

**`src/components/HeroTrustShowcase.tsx`**

1. Update `agentTeaserPairs` (lines 106-110) with new longer recommendation texts and add a `type` field (`"warning" | "positive" | "insight"`) for color coding.

2. Replace the processing steps UI (lines 538-561) — remove `<Progress>` bar, replace with a 3-station milestone tracker:
   - 3 inline dots with connecting lines
   - Labels: "Scanning", "Analyzing", "Computing"
   - Color transitions as `teaserStep` advances
   - Keep the existing step list above with checkmarks (but reduce to 3 steps to match stations)

3. Update `agentProcessingSteps` (lines 112-117) — reduce to 3 items matching the station labels:
   - "Scanning 1,247 reviews..."
   - "Analyzing developer records..."  
   - "Computing trust score..."
   - Update step interval logic: `step * 33` instead of `step * 25`, threshold check for 3 steps

4. Update result phase UI (lines 564-571):
   - Recommendation text: `text-sm md:text-base font-bold leading-snug`
   - Add a colored left-border strip: `border-l-3` with color based on pair type
   - Pad the recommendation block: `pl-3 py-1`

5. Adjust processing `useEffect` (lines 276-293): change `step * 25` → `step * 33`, threshold from `agentProcessingSteps.length` (now 3).

