

# Transform "Legal Advisory" Card into Interactive Contract Checker

## The Idea
Replace the static "Legal Advisory" card with an interactive "Contract Check" card that has a flip animation. The front shows a compelling CTA ("Upload Your Contract"), and the back shows a sample contract health preview with red/green indicators — creating curiosity and engagement without requiring the user to actually upload yet.

## How It Works

### Front of card (default view):
- Icon: `FileSearch` (contract scanning vibe)
- Title: "Check Your Contract" / "راجع عقدك"
- Subtitle: "Spot risky clauses instantly" / "اكتشف البنود الخطرة فورًا"
- Subtle pulse animation on the icon to draw attention

### Back of card (flips on hover/tap):
- A mini "contract health" preview showing 3 sample terms:
  - `✓ Payment Plan` — green dot
  - `⚠ Penalty Clause` — red dot  
  - `✓ Handover Date` — green dot
- Small CTA: "Upload yours →"
- This teaser makes users curious to try the real feature

### On click:
- Opens a modal or navigates to a dedicated contract checker page (future feature)
- For now, shows a toast/modal saying "Coming Soon — Upload your contract to get a full AI review"

## Technical Plan

### 1. Create `src/components/ContractCheckCard.tsx` (new file)
- CSS 3D flip card using `perspective`, `rotateY(180deg)`, `backface-visibility: hidden`
- Front: icon + title + subtitle (matches quickAction card style)
- Back: 3 sample term rows with green/red dots + "Upload yours" CTA
- Auto-flips every 6s OR flips on hover/tap
- On click: triggers the `handleQuickAction('legal')` callback

### 2. Update `src/pages/Index.tsx` (lines 146-149)
- Remove `legal` from `quickActions` array
- In the grid (lines 471-490), render `<ContractCheckCard />` as the 3rd card slot instead of the generic quickAction button

### 3. Update `src/i18n/locales/en.json`
- Change `qaLegal` → "Check Your Contract"
- Change `qaLegalDesc` → "Spot risky clauses instantly"
- Add `hero.contractFront`, `hero.contractBack` keys for flip card content
- Add sample term labels: `hero.contractTermOk1`, `hero.contractTermRisk`, `hero.contractTermOk2`

### 4. Update `src/i18n/locales/ar.json`
- Same keys in Arabic: "راجع عقدك", "اكتشف البنود الخطرة فورًا"
- Arabic sample terms

### Result
A card that visually stands out from the other quick actions via its flip animation, showing a teaser of red/green contract health indicators. This creates immediate curiosity ("what does MY contract look like?") and drives engagement deeper into the platform.

