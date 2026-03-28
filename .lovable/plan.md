

## Upgrade Business Dashboard — Buyer-Inspired Engagement Suite

### What's Missing

The Buyer dashboard has a rich engagement layer that the Business dashboard completely lacks. Here's the gap:

| Feature | Buyer | Business |
|---------|-------|----------|
| Points Breakdown Header | Yes | No |
| Welcome greeting + tier nudge | Yes | No |
| Community Post Box | Yes | No |
| Profile Completion checklist (with coin incentives) | Yes | No (only a progress bar in BusinessProfileHeader) |
| Tier Journey visual track | Yes | No |
| Daily Tasks Card | Yes | No |
| 7-Day Streak Tracker | Yes | No |
| Activity Cards Grid | Yes | No |
| Quick Actions with coin badges | Yes | No |
| Sidebar widgets (Referral, Saved Search) | Yes | No |

### Plan

Restructure `DevOverview` to mirror the Buyer dashboard layout, adapted with the **Forest Green** business theme (`business-border`, `business`, `business-foreground`).

### Changes to `src/pages/DeveloperDashboard.tsx` — DevOverview rewrite

**1. Add PointsBreakdownHeader** (top of page)
- Uses `useGamification()` data (already imported)
- Forest green gradient instead of buyer's primary/coin gradient

**2. Add Hero Row** (2-column grid like Buyer)
- **Left column**:
  - Welcome greeting with `Building2` verified badge (green) + "You're X pts away from [next tier]" motivator
  - Community Post Box (same pattern, green accent)
  - OnboardingWizard (move from current position)
- **Right column**:
  - Profile Completion checklist card with coin incentives per field (company_name, description, logo, location, phone, website, license)
  - Tier Journey visual track (using business gamification tiers, green theme)

**3. Keep BusinessProfileHeader** (after hero row)

**4. Keep Stats cards** (after profile header)

**5. Add DailyTasksCard** (new section after stats)
- Already a generic component, works for both portals

**6. Add StreakTrackerVisual** (after daily tasks)
- Pass business gamification streak data

**7. Add Business Activity Cards Grid** (after streak)
- Create business-specific activities: "Complete Profile", "Reply to Review", "Request Review", "Submit Deal", "Add Project", "Join Community"
- Reuse `ActivityCardsGrid` pattern but with business routes and green theme

**8. Restructure charts + reviews into 3-column grid** (like buyer's Quick Actions + Latest Reviews + Sidebar)
- Left (2 cols): Charts (reviews + views)
- Right (1 col): Latest Reviews + WhatsApp Review Request CTA

**9. Add ReferralWidget** at bottom (businesses can refer other businesses)

### New Component: `src/components/BusinessActivityCards.tsx`
- Business-specific activity grid (mirrors `ActivityCardsGrid` but with business actions/routes)
- 6 cards: Complete Profile (+10), Reply to Review (+15), Request Review (+10), Submit a Deal (+20), Add Project (+15), Post in Community (+10)
- Forest green color scheme, lock badges for tier-gated features

### Files to Edit

1. **`src/pages/DeveloperDashboard.tsx`** — Rewrite `DevOverview` with buyer-inspired layout
2. **New: `src/components/BusinessActivityCards.tsx`** — Business-specific activity grid
3. **`src/components/PointsBreakdownHeader.tsx`** — Add optional `variant="business"` prop for green theming
4. **`src/components/DailyTasksCard.tsx`** — Verify it works without buyer-specific assumptions (may need minor portal detection)
5. **`src/i18n/locales/en.json`** — Add `businessDashboard` namespace for welcome text, activity labels
6. **`src/i18n/locales/ar.json`** — Arabic translations

### No database changes needed

