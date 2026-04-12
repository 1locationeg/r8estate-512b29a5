

## Plan: Enrich Live Feed Sources and Bold/Color Key Words

### What Changes

**1. Add launch events** to the feed data fetch
- Query `launches` table for recent active launches (status `reservations_open` or `upcoming`)
- Create feed items like "New launch: **Mountain View iCity** — **120** units available" with keyword `LAUNCH` and a Rocket icon

**2. Add more diverse fallback events** covering all 4 source types (reviews, deals, launches, community) so the feed always feels multi-source even without DB data

**3. Color-code the keyword badge per event type**
- `LIVE` (buyer_check) — emerald green background
- `REVIEW` — gold/amber background  
- `HOT DEAL` — red/brand-red background
- `LAUNCH` — cyan/blue background
- `TRENDING` (community) — purple background

**4. Highlight numbers and entity names in the feed text**
- Instead of rendering `displayText` as a plain string, parse it to wrap:
  - **Numbers** (e.g. "47", "4.2/5") in `font-bold text-white` (stand out from the `text-white/90` body)
  - **Entity names** (stored in `entityName`) in `font-bold text-amber-300` (gold highlight)
- This makes the ticker scannable — eyes catch the numbers and names instantly

### Files Modified
- `src/components/LiveMarketPulse.tsx` — Add launch fetch, keyword color map, rich text rendering with highlighted segments

### No database changes needed.

