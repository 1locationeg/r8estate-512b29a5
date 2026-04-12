

## Plan: Redesign Copy to "Cost of NOT Joining" Framework

### What Changes

Restructure the component into a **two-part narrative** — "WITHOUT R8ESTATE" (fear/risk) → "WITH R8ESTATE" (safety/proof) — to make visitors feel the real cost of inaction.

### New Layout (top to bottom)

1. **Section header**: `"Without R8ESTATE — the real risk"` in bold white with a red accent
2. **Big animated number**: `183M EGP` in large red/amber text with subtitle `"at risk across Egyptian off-plan buyers right now"`
3. **Three static risk bullets** (always visible, not rotating — all 3 hit harder together):
   - ✗ Average Egyptian buyer risks EGP 1.2M on an unverified developer
   - ✗ 1 in 4 off-plan buyers faces delivery delays of 1+ years
   - ✗ No legal protection when signing without reading verified reviews
4. **Divider line** (subtle white/10 border)
5. **"WITH R8ESTATE"** section in green/gold accent:
   - Avatars + `"323+ buyers already protected their money this month"`
6. **CTA row**: "Protect My Purchase" button + Share icon

### Key Copy Changes
- Replace "Don't buy blind" hook with the fear-framing "Without R8ESTATE" header
- Change animated counter from `847M` to `183M` (risk amount, not protected)
- Change `1 in 3` → `1 in 4` per user's copy
- Show all 3 risks simultaneously (remove rotating logic) — stacked vertically with red ✗ marks
- Add the positive flip: "WITH R8ESTATE" + `323+` protected count
- Arabic translations for all new copy

### Visual Treatment
- Risk section: red `X` icons, white text, urgent feel
- "WITH R8ESTATE" text in gold/green to contrast the red danger above
- Keep dark navy gradient background, dot texture, radial glow
- Slightly more padding to accommodate the two-section layout

### Files Modified
- `src/components/CollectiveBuyerProtection.tsx` — Full copy rewrite, remove rotating risk logic, add two-section layout with static risk bullets + positive flip

### No database changes needed.

