## Goal

Re-shape the entire Write-a-Review flow to feel like Facebook's app-store review: every screen is calm, every screen has a **visible progress bar**, every screen has a **Submit / Save & Close** that persists what the user typed (so nothing is ever lost), and the user is gently motivated to keep going to deeper steps.

Two reference screens:
- Image 1 → the **frictionless entry** (stars + optional title/review on one card).
- Image 2 → the **deep review** (current Phase 2 layout: unit type, experience type, title, rich editor) — only shown when the user opts in.

## The 4-step journey

```text
STEP 1 / 4 ────────────                Rate
  Brand row · Tap to Rate · ★★★★★
  ┌──────────────────────────┐
  │ Title    Optional        │
  │ Review   Optional        │
  └──────────────────────────┘
  Reviewing as: {nickname}
  [ Submit ]      ← saves + closes
  [ Add more details → ]   (motivator)

STEP 2 / 4 ────────────────             Your Review (deep)
  ★★★☆☆ 3/5  ·  Change                  +25 pts when complete
  Unit type · Experience type · Title · Rich editor · Voice/AI/Emoji
  [ Save & Close ]    [ Next → ]

STEP 3 / 4 ────────────────────         Category Ratings
  Mini star rows per category (Build, Location…)
  [ Save & Close ]    [ Next → ]

STEP 4 / 4 ────────────────────────     Proof & Polish
  Photos · Documents · Secure contract · Verification · Anonymous toggle
  [ Save & Close ]    [ Submit Review ]
```

A thin progress bar `value={(step/4)*100}` sits at the top of **every** step. Label format: `Step X of 4 · {StepName}`.

## Core principles

1. **Always saving.** Every "Save & Close" / "Submit" button calls the right `savePhaseN()` for whatever fields are filled, then closes the modal. The DB row is updated with the highest `completion_level` reached (`rating_only` → `with_comment` → `full`) plus whatever optional fields are populated. No data is ever discarded.
2. **Progress always visible.** The header progress bar is shown on Step 1 too (today it's hidden), so the user sees "I'm 25% in" the moment they tap a star.
3. **Motivation, not pressure.** After Step 1's stars, a soft chip "✨ Add more details — earns +25 pts and helps buyers more" appears next to Submit. Same after Step 2 ("You're halfway there"), Step 3 ("One more — add proof for a verified badge").
4. **Sentiment-aware micro-copy** on every step (re-uses existing `getRatingEncouragement`).

## Step-by-step changes

### Step 1 — new "Single-Screen Rate" (replaces today's Phase 1)

Matches reference image 1:
- Brand row: rounded-square logo (existing developer fields) + name + 1-line tagline.
- "Tap to Rate:" label + 5 large stars (auto-saves `rating_only` on tap, as today).
- Single soft-grey card with stacked rows: **Title — Optional**, **Review — Optional** (multi-line).
- Footer: "Reviewing as: {nickname}" (guests can edit inline).
- Buttons: **Submit** (primary, fires `savePhase2` if any text was typed, else just closes) + **Add more details →** (ghost, advances to Step 2).
- Progress bar: shown, at 25%.

### Step 2 — "Deep Review" (matches reference image 2)

Today's Phase 2 layout, kept almost as-is. Only changes:
- Header label becomes "Step 2 of 4 · Your Review" (today says "Step 2 of 3").
- Bottom bar buttons relabeled:
  - Left: ghost **Back**.
  - Right group: ghost **Save & Close** (calls `savePhase2` then closes — no data lost) + primary **Next →** (calls `savePhase2` + advances to Step 3).
- Add a tiny motivator chip above the action bar: "Halfway there — sub-ratings next help buyers compare 📊".

### Step 3 — Category ratings (carved out of today's Phase 3 top half)

- Mini star rows for category metrics (`MiniStarRow` component, already exists).
- Bottom bar: **Back** · **Save & Close** · **Next →**.
- Progress bar at 75%.
- Motivator chip: "Almost done — add proof on the next step for a verified badge 🛡️".

### Step 4 — Proof & polish (carved out of today's Phase 3 bottom half)

- Photos / Documents / SecureContractUpload / Verification upload / Anonymous toggle.
- AI moderation warnings render here (last gate before final submit).
- Bottom bar: **Back** · **Save & Close** · primary **Submit Review** (calls `savePhase3` with `completion_level: full`, fires confetti for first review, toast, closes).
- Motivator chip: "You're a top contributor 🏆 — verified reviewers get 3× visibility".

### Header (shared across all steps)

- Title: "Write a Review {for {Developer}}" (existing).
- Sub-line: "Step X of 4 · {StepName}" + Progress bar (always visible, never hidden).
- Star summary `★★★ 3/5 · Change` row visible from Step 2 onward (existing).
- Top-right close (X) → if any unsaved changes on current step, auto-call the relevant `savePhaseN()` before closing. So even closing the modal never loses data.

## Save-on-exit guarantee

Wire `onOpenChange(false)` (and the X button) to a single `safeClose()` helper:

```text
safeClose():
  if step === 1 && (title || content)       → savePhase2()
  else if step === 2 && hasContent          → savePhase2()
  else if step === 3 && anyCategoryRating   → savePhase3() (partial)
  else if step === 4                        → savePhase3() (full)
  finally → onOpenChange(false)
```

This makes every screen behave like the user pressed "Save & Close" implicitly. No dialog, no confirmation — just silent save + close.

## Technical Implementation

- **`src/components/WriteReviewModal.tsx`** (single file, biggest change):
  - Rename internal state `phase` (1–3) → `step` (1–4). Add a `PHASE_LABELS` array of length 4.
  - Split current `renderPhase3` into `renderStep3` (category ratings only) and `renderStep4` (attachments + verification + anonymous + moderation + final submit).
  - Rewrite `renderStep1` to the new single-screen card (stars + Title input + Review textarea + Submit + "Add more details").
  - Keep `renderStep2` (was `renderPhase2`) almost unchanged, just relabel buttons and add motivator chip.
  - Add `safeClose()` helper; wire it to Dialog's `onOpenChange` and the explicit "Save & Close" buttons.
  - Always render the progress bar (remove the `phase === 1` hide condition); update `value={(step / 4) * 100}`.
  - Update the slide container: 4 panels instead of 3, `translateX(-${(step - 1) * 100}%)`.
  - Add a small `MotivatorChip` inline component (no new file) used at the bottom of steps 1–3.
- **`src/i18n/locales/en.json` & `ar.json`**: new keys
  - `form.tapToRate`, `form.reviewingAs`, `form.submit`, `form.saveAndClose`, `form.addMoreDetails`,
  - `form.motivator.step1`, `form.motivator.step2`, `form.motivator.step3`, `form.motivator.step4`,
  - `form.stepName.rate`, `form.stepName.yourReview`, `form.stepName.categories`, `form.stepName.proof`.
- **`mem://features/review-system`**: bump from 3-phase to 4-step Progressive-Save with always-visible progress and save-on-exit.

## Out of scope

- DB schema, edge functions, AI moderation, gamification rules, RTL/i18n infra — all unchanged.
- WhatsApp share, post-submit thanks screen, confetti behavior — kept as-is and reused.
