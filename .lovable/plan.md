

## Plan: Compact the Collective Buyer Protection Card

### What Changes

Shrink the card dramatically by replacing verbose risk sentences with **single bold keyword pills** that communicate benefits/risks at a glance, and tighten all spacing.

### New Layout (compact, single flow)

1. **Header row** — Shield icon + "Without R8ESTATE" label + animated `183M EGP` counter — all on ONE line
2. **Risk keywords row** — Three inline pills with ✗ icon + single bold word each:
   - ✗ **Scams** · ✗ **Delays** · ✗ **No Protection**
   - Arabic: ✗ **نصب** · ✗ **تأخير** · ✗ **بلا حماية**
   - Keywords styled `text-sm font-bold text-white` (bigger than current `text-xs`)
3. **Thin divider**
4. **"WITH R8ESTATE" row** — CheckCircle + label + avatars + `323+` count — all on ONE line
5. **CTA row** — Button + Share (unchanged)

### Key Differences from Current
- Remove 3 full-sentence risk bullets → replace with 3 single-word pills inline
- Remove the subtitle text under "183M EGP" (the number speaks for itself)
- Merge header + counter into one line
- Reduce gaps from `gap-4` → `gap-2`, padding from `py-5` → `py-3`
- Benefit keywords are `text-sm font-bold` (bigger than current `text-xs` sentences)
- Overall card height drops ~50%

### Files Modified
- `src/components/CollectiveBuyerProtection.tsx` — Compact layout, keyword pills, tighter spacing

### No database changes needed.

