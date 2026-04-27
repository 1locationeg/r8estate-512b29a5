## Goal

Reduce friction in `WriteReviewModal` further to match the Facebook-app-store reference: each screen does ONE job with a strong motivator nudging the user deeper.

## Step 1 — Rating only (zero distraction)

Keep:
- Brand row (developer name + "Share your experience")
- "Tap to Rate" stars (auto-saves rating-only on tap)
- Encouragement micro-copy under stars after a tap
- **Submit** button (rating-only) — primary action
- Motivating CTA that doubles as the path to Step 2: a single tappable card titled e.g. "✨ Add a few details — earn +25 pts and help thousands of buyers" that calls `setPhase(2)` (replaces the current "Add more details" ghost button + separate MotivatorChip with one combined motivator card)

Remove:
- "Reviewing as: <name>" line (and guest name input on this step — moved to Step 2 only when needed, or kept implicit)
- The standalone "Add more details" ghost button (folded into the motivator card)

Result: visually only stars + Submit + a motivating "go deeper" card.

## Step 2 — Title + Review only (with AI tools + motivator)

Keep:
- Motivating hero banner at top ("Your story helps thousands of buyers… +50 pts and a verified badge")
- **Title** input (with AI suggestion pill button)
- **Review** rich editor
- Action toolbar under editor: **Voice** + **AI Enhance** only
- Bottom nav: Back / Save & Close / Next
- Sticky bottom bar

Remove from Step 2:
- Unit type field (chips/input)
- Experience type chips
- Disclaimer checkbox (move to Step 4 / Submit step where final submission happens)
- Emoji button + emoji bar
- Bottom MotivatorChip (the hero banner already motivates)

The Unit type, Experience type, and Disclaimer move to Step 3 (category ratings) or Step 4 (proof & polish) so they don't clutter the writing screen. Disclaimer must still gate the FINAL submit — verify it's enforced on Step 4's submit.

## Files to edit

- `src/components/WriteReviewModal.tsx`
  - Rewrite `renderPhase1`: strip "Reviewing as" and the separate "Add more details" button; replace bottom motivator + ghost link with one tappable motivator card → `setPhase(2)`
  - Rewrite `renderPhase2`: remove Unit type, Experience type, Disclaimer, Emoji UI; keep banner, Title, ReviewRichEditor, Voice + AI Enhance only
  - Move Unit type + Experience type rendering into `renderPhase3` (above the category stars) so the data is still captured
  - Move `DisclaimerCheckbox` into `renderPhase4` above the final Submit button; ensure the Step 2 → Step 3 "Next" no longer requires `disclaimerAgreed` (only the final Submit does)
- `src/i18n/locales/en.json` and `ar.json`
  - Add/adjust keys: `form.motivator.goDeeperCard.title`, `form.motivator.goDeeperCard.subtitle` (Egyptian Ammiya for AR)

## Out of scope

- Step 3 and Step 4 visual structure (only receive the moved fields)
- Draft resume overlay (unchanged)
- Database lifecycle (unchanged)
