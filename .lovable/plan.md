

# Dashboard UI Enhancement — Inspired by HTML Reference

## Summary
Redesign the Buyer Dashboard overview and apply the same elevated aesthetic to the Business Dashboard. The HTML reference introduces a more polished, information-dense layout with a navy-themed sidebar, structured two-column content area, community post box, tier journey card, enhanced stat cards with delta indicators, testimonials row, and a refined invite/referral card.

## Key Design Changes (from HTML reference)

### 1. Sidebar Redesign — Dark Navy Theme
**Files: `src/components/DashboardSidebar.tsx`**

- Change sidebar background from `bg-card` to a dark navy theme (`bg-[#0B1D2E]`) with white/translucent text
- Nav items: translucent white text, active state uses emerald highlight with a left/start border accent
- Profile card: avatar with online indicator dot, tier progress bar inline in sidebar
- Nav section headers: uppercase, translucent, small tracking
- Leaderboard mini: already exists but restyle with navy theme colors
- Sign out button: translucent styling
- **RTL**: `border-s` for active indicator (already logical), Sheet side already direction-aware

### 2. Dashboard Header — Streamlined Topbar
**File: `src/components/DashboardHeader.tsx`**

- Replace BrandLogo + title with a breadcrumb trail (Home icon > Portal > Page)
- Move points counter, notification bell, and "Upgrade to Business" button to the right side
- Remove the duplicate hamburger/more-menu button — keep only one mobile trigger
- Cleaner, thinner header (h-[54px])

### 3. Buyer Overview — Hero Row with Post Box + Tier Panel
**File: `src/pages/BuyerDashboard.tsx` (BuyerOverview component)**

Restructure the overview into the HTML reference's layout:

**Hero Row** (2-column: `grid-cols-[1fr_310px]` on desktop, stacked on mobile):
- **Left column**: 
  - Verified buyer eyebrow badge
  - Greeting with tier nudge subtitle ("You're 6 pts away from Explorer")
  - Community post box (avatar + input + category pills + action bar) — links to community page on interaction
- **Right column**:
  - Profile completion card (checklist with point rewards per item)
  - Tier journey card (dark navy, visual track with dots: Visitor → Newcomer → Explorer → Pro, points display, unlock hint)

**Stats Row**: 4-column grid with delta indicators ("+3 this week", "1 draft pending", "3 new matches") — currently just static numbers

**Upsell Banner**: Already exists but restyle to match reference (gold-light bg, icon, text, CTA button)

**Main Two-Column** (below stats):
- **Left**: Quick Actions (card grid with icon + badge), Saved Projects (list rows with thumbnail, badges, price), Testimonials strip (3 cards)
- **Right**: Latest Reviews (card list with verified badge, stars, helpful/share actions), Search Alerts (empty state or list), Invite Friends (dark navy card with stats grid, copy link, share button)

### 4. Stat Cards Enhancement
Add trend/delta indicators to each stat card:
- "Developers Viewed: 24" → "+3 this week" (green up arrow)
- "Reviews Written: 3" → "1 draft pending" (amber)
- "Saved Projects: 12" → "3 new matches" (green)
- "Reports Unlocked: 8" → "2 this month" (muted)

### 5. Business Dashboard — Same Aesthetic
**File: `src/pages/DeveloperDashboard.tsx`**

Apply the same sidebar dark navy theme and header breadcrumb pattern. The Business dashboard uses `companyInfo` in sidebar (company initial + name) which already works — just restyle with navy colors. The content area patterns (stat cards, charts) already match the reference's structure closely.

### 6. RTL / Mobile / PWA Compliance
- All new elements use logical properties (`ps-*`, `me-*`, `text-start`, `rounded-s-*`)
- Post box, tier track, stat deltas all use `text-start`/`text-end`
- Mobile: Hero row stacks to single column, post box full-width, tier card full-width
- Navy sidebar text remains direction-neutral (centered avatar, logical padding)
- Tier track dots use `flex` which auto-mirrors in RTL

## Technical Details

### Files to Create
- None (all changes are to existing files)

### Files to Modify
| File | Change |
|------|--------|
| `src/components/DashboardSidebar.tsx` | Navy theme, active border-start accent, translucent text |
| `src/components/DashboardHeader.tsx` | Breadcrumb-style, thinner, remove duplicate menu button |
| `src/pages/BuyerDashboard.tsx` | Restructure BuyerOverview: hero row, post box, tier card, stat deltas, testimonials, enhanced saved projects list |
| `src/pages/DeveloperDashboard.tsx` | Apply same sidebar/header aesthetic, add stat deltas |
| `src/components/MiniLeaderboard.tsx` | Restyle for navy sidebar background |
| `src/components/CoinCounter.tsx` | Restyle expanded variant for navy sidebar |

### Responsive Breakpoints
- Desktop (`md+`): 2-column hero row, 4-column stats, 2-column main content
- Mobile (`<md`): Everything stacks, post box simplified, tier card full-width

### Estimated Scope
~6 files modified, primary work in BuyerDashboard.tsx (~300 lines of new/restructured JSX) and DashboardSidebar.tsx (~80 lines of class changes).

