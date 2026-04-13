

## Plan: Mobile-Friendly, Context-Aware Review Experience

### The Goal
Keep all the rich data collection but make the experience feel effortless — especially on mobile. The Facebook image you shared shows the key principle: minimal visual weight, clear progression, optional depth.

### Changes

#### 1. Context-Aware Fields — `WriteReviewModal.tsx`
The "Unit Type" field makes no sense when reviewing a law firm, brokerage, or app. Replace the static field with a dynamic one based on `entityCategory`:

| entityCategory | Field Label | Placeholder | Options |
|---|---|---|---|
| developers | Unit Type | "e.g. Apartment, Villa" | Free text |
| projects | Unit Type | "e.g. Studio, Duplex" | Free text |
| brokers | Service Used | "e.g. Buy, Rent, Sell" | Chips |
| apps | Feature Used | "e.g. Search, Listings" | Chips |
| locations | Property Type | "e.g. Residential, Commercial" | Chips |
| *anything else* (law firms, services) | Service Type | "e.g. Contract Review, Consultation" | Free text |

Similarly, `EXPERIENCE_TYPES_KEYS` should adapt — a law firm reviewer isn't a "buyer" or "investor."

#### 2. Mobile-Optimized Phase 2 Layout
Phase 2 currently shows: Unit Type + Experience Type + Title (with AI) + Disclaimer + Review textarea + Emoji bar + Navigation. That's overwhelming on a 390px screen.

Restructure Phase 2 into a cleaner flow:
- **Top**: Context field (unit/service type) as tappable chips instead of a text input — one tap vs typing on mobile keyboard
- **Title**: Keep AI suggest button, but make title visually optional (lighter placeholder, smaller label)
- **Review textarea**: Make it the hero — larger, with the voice/AI buttons as floating icons inside the textarea (bottom-right), not a separate row above
- **Emoji bar**: Collapse into a single 😀 toggle button that expands the emoji row — saves vertical space
- **Disclaimer**: Move to a slim inline checkbox below textarea (already there, just tighten spacing)
- **Navigation**: Sticky bottom bar with "Done" and "Next" — always visible without scrolling

#### 3. Tappable Chips for Experience Type
Replace the `Select` dropdown (hard to use on mobile) with horizontal scrollable chips:
```text
[ 🏠 Buyer ] [ 🏢 Agent ] [ 💰 Investor ] [ 🔨 Construction ] [ 👨‍👩‍👧 Family ]
```
One tap instead of: tap dropdown → scroll → tap option → close dropdown.

For non-real-estate categories, show relevant chips:
- Brokers: `[ Buying ] [ Selling ] [ Renting ] [ Consulting ]`
- Services/Law: `[ Client ] [ Partner ] [ Vendor ]`

#### 4. Phase 3 — Star Taps Instead of Sliders
Sliders are notoriously hard on mobile (small drag target, imprecise). Replace each category slider with a row of 5 tappable stars — same data, much easier to use:
```text
Delivery Quality    ★★★★☆  (tap the 4th star)
Build Quality       ★★★☆☆  (tap the 3rd star)
```
This matches the Phase 1 interaction pattern so it feels familiar.

#### 5. Encouraging Micro-Copy
Add small motivational text at each phase transition:
- Phase 1→2: "Your rating is saved! Adding details earns you +15 community points 🎯"
- Phase 2→3: "Almost there! Category ratings help buyers compare 📊"
- Phase 3 done: "You're a top contributor! 🏆"

#### 6. Collapsible Optional Sections in Phase 3
On mobile, attachments/verification/anonymous toggle should be in a collapsible "More Options" accordion — visible but not intimidating. Desktop keeps them expanded.

### Files Touched
1. **Edit** — `src/components/WriteReviewModal.tsx` (context-aware fields, chips, star-tap Phase 3, mobile layout, collapsible sections, micro-copy)

### What stays the same
- Progressive save logic (unchanged)
- AI title suggestions + enhance + voice (unchanged, just repositioned)
- All data collected (same DB columns)
- Desktop layout (mostly unchanged, benefits from chips too)
- Content moderation flow
- Guest vs authenticated paths

