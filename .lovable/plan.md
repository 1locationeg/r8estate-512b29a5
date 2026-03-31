

# HeroCategoryItems — Clickable Journey Path Redesign

## What Changes

Redesign the horizontal step indicator to match the reference image style: numbered badges (1-2-3-4), bold station-colored labels, benefit subtitles under each station name, "— You are here" indicator on active/clicked station, and arrow connectors between circles. Make it feel like a clickable path that motivates users to start their journey.

## Layout (inspired by reference image)

```text
┌──────────────────────────────────────────────────────┐
│        Your path to a safe home                      │
│                                                      │
│   ①          >      ②          >     ③       >   ④   │
│  (🔍)              (🏠)            (💰)         (🛡)  │
│ Research          Choose          Finance       Protect│
│ — You are here   Pick verified   Fund safely   Land   │
│                                                secure │
└──────────────────────────────────────────────────────┘
```

## Key Design Elements

1. **Numbered badges** — Small colored badge (1, 2, 3, 4) positioned top-right of each circle icon, using the station's journey color as background with white text. Bold numbering creates the "path" feeling.

2. **Bold station-colored labels** — Each station name uses its journey color as `font-bold`: Research = Navy, Choose = Gold, Finance = Teal, Protect = Emerald. This trains users to recognize these colors site-wide.

3. **Benefit subtitle** — Small muted text below each station name (e.g., "— You are here", "Pick verified", "Fund safely", "Land secure"). Pulled from i18n.

4. **"You are here" indicator** — When a station is active (clicked/expanded), show "— You are here" in the station's color below the label, plus a subtle ring pulse animation on the circle. First station (Research) starts with this by default hint.

5. **Arrow connectors** — ChevronRight `>` icons between stations (muted gray), matching the reference image exactly.

6. **Clickable feel** — `cursor-pointer`, hover scale (`group-hover:scale-110`), and a subtle bounce on click to signal interactivity.

7. **Circle styling** — Larger circles with colored ring matching reference. Active state gets a thicker ring + glow shadow. Inactive circles use a lighter tint.

## Files to Modify

1. **`src/components/HeroCategoryItems.tsx`** — Restyle the step indicator section (lines 337-386). Add numbered badges, benefit subtitles, "You are here" text, bolder colors on labels.

2. **`src/i18n/locales/en.json`** — Add `shortBenefit` keys: `"research.shortBenefit": "— You are here"`, `"choose.shortBenefit": "Pick verified"`, `"finance.shortBenefit": "Fund safely"`, `"protect.shortBenefit": "Land secure"`. Add `"resumeAt": "Resume at {{step}} →"`.

3. **`src/i18n/locales/ar.json`** — Arabic equivalents for the new keys.

## Technical Details

- Number badge: `absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center` with `bg-journey-{step}`
- Station label: `font-bold text-journey-{step}` (always colored, not just when active)
- Benefit text: `text-[9px] text-muted-foreground` below label, switches to `text-journey-{step}` "— You are here" when active
- Circle size stays `w-11 h-11` on mobile
- Active circle: thicker ring (`ring-2`) + pulse glow animation
- Default state: Research shows a subtle "Start here" hint to motivate first click

