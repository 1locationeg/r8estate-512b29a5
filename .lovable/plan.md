

## Enhance Journey Corridor — Bigger Stations, Color Vibes, Wayfinding

### Problems identified
1. Station dots and labels are too small on mobile (18px dots, 8px text)
2. All stations look the same — no color differentiation in the track
3. When user clicks a station and scrolls there, the context strip disappears after 4s and they lose orientation — no persistent "You are here" indicator

### Solution

#### 1. Bigger stations with station-colored vibes (same height)
- Increase station dots from `w-[18px] h-[18px]` → `w-[24px] h-[24px]` (mobile) and `md:w-[28px] md:h-[28px]`
- Increase label text from `text-[8px]` → `text-[10px]` mobile, `md:text-[11px]`
- Color each station label with its own station color (not just the active one)
- Color the station dot border/bg with its station color even when future (tinted), not generic gray
- Connecting lines between stations use gradient from left station color to right station color
- Active station gets a subtle colored glow shadow matching its color

#### 2. Persistent "You Are Here" indicator
Instead of the context strip disappearing after 4s, implement:
- **Always show** a thin colored underline/accent under the active station dot (using station color)
- Add a small pulsing dot or "📍" indicator on the active station that persists while scrolling
- The context strip stays visible as long as user is in that zone (not just 4s timeout) — remove the auto-dismiss timer when it's scroll-triggered
- When context strip shows, include a mini progress breadcrumb: "Step 2 of 4 · Choose → Next: Finance ›"

#### 3. Enhanced context strip
- Color the context strip background with the active station's color tint
- Show "what to do here" hint (from STATION_TIPS) as a one-liner inside the strip
- Keep the "Next" button prominent with the next station's color

### Files changed
- `src/components/JourneyCorridor.tsx` — all changes in this single file

### Technical notes
- Keep outer container height the same (`py-1.5 md:py-2`)
- Use existing `STATION_COLORS` array for per-station coloring
- Replace timeout-based context strip with scroll-position-based visibility (show strip when `activeZone > 0`)
- Add a pulsing animation on the active dot using inline `boxShadow` with station color

