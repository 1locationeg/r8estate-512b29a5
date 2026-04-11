

## Plan: Improve Agent Teaser Readability & Progress Bar

### Changes in `src/components/HeroTrustShowcase.tsx`

**1. Shorten text — less words, bigger impact**

Update `agentTeaserPairs` answers to be shorter (1 line max):
- Pair 1: `"⚠️ Wait — 3 red flags. Delivery delayed 18 months."`
- Pair 2: `"✅ Mivida wins — 98% on-time, 4.7★ from 312 buyers."`
- Pair 3: `"📊 Emaar leads quality by 12%. New launch next month."`

Shorten processing steps:
- `"Scanning reviews..."` / `"Analyzing records..."` / `"Computing score..."`

**2. Increase font sizes for mobile readability**

- Question text: `text-sm` → `text-base`
- Result answer: `text-sm md:text-base` → `text-base md:text-lg`
- Processing step labels: `text-[11px]` → `text-xs`
- Station labels: `text-[9px]` → `text-[11px]`

**3. Slow down timing — give users time to read**

- Typing speed: `25ms` → `40ms` per character
- Processing step interval: `750ms` → `1200ms`
- Result hold time: `2500ms` → `4000ms`
- Post-processing delay before result: `400ms` → `600ms`

**4. Bold, colorful milestone tracker**

- Station dots: `w-[10px] h-[10px]` → `w-4 h-4`
- Connecting line: `h-[2px]` → `h-[3px]`
- Each station gets a distinct color when active:
  - Station 1 (Scan): `bg-blue-500`
  - Station 2 (Analyze): `bg-amber-500`
  - Station 3 (Score): `bg-trust-excellent` (green)
- Active fill line transitions through matching gradient colors
- Done checkmarks inside dots: `w-2 h-2` → `w-3 h-3`

