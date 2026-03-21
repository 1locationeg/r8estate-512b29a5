

# Contract Check Card — Cycling Status Display

## What Changes
Replace the flip-card approach with a **cycling indicator** like the Market Pulse Widget. The card shows one contract term at a time, fading between them every 3 seconds, each color-coded:

- 🟢 **Green** term: "Payment Plan" — text and dot in green
- 🔴 **Red** term: "Penalty Clause" — text and dot in red  
- 🟡 **Yellow** term: "Handover Date" — text and dot in amber/yellow

Each term cycles with a fade transition, showing a colored dot + colored text + the `FileSearch` icon tinted to match. Small dot indicators at the bottom show which term is active (like the Market Pulse Widget).

## Technical Plan

### File: `src/components/ContractCheckCard.tsx` — full rewrite

Remove the 3D flip logic entirely. Replace with:

1. Define an array of contract terms, each with: `label`, `status` (ok/risk/warning), and corresponding color classes (green/red/amber)
2. `activeIdx` state cycling every 3s with a 300ms fade transition (same pattern as MarketPulseWidget)
3. Layout: top has the `FileSearch` icon + "Contract Health" label, middle shows the current term with its colored dot and colored text, bottom has dot indicators + "Upload yours →" CTA
4. Border color shifts to match the current term's status color

### File: `src/i18n/locales/en.json` + `ar.json`
- Add `hero.contractTermWarn` key: "Handover Date" / "تاريخ التسليم" (for yellow/warning status)
- Existing keys reused for green and red terms

