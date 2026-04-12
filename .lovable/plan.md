

## Plan: Redesign Collective Buyer Protection — Storytelling + Shareable

### Current State
Two-column layout with a stats panel (left) and a risk list (right). It's informational but reads like a data card — not a story. No share action, no emotional hook, no CTA.

### New Design — Single-Column "Story Strip"

Replace the 2-column grid with a compact, single-column narrative strip that tells a micro-story and drives action:

**Structure (top to bottom):**

1. **One-liner hook** — Bold, emotional headline that creates urgency
   - EN: `"Don't buy blind. 847M EGP already protected."`
   - AR: `"ما تشتريش وانت أعمى. 847 مليون جنيه محميين بالفعل."`
   - The `847M` counter animates on scroll (keep existing `useCountUp`)

2. **Social proof row** — Avatars + buyer count (simplified, inline)
   - Same avatar stack + `"1,247+ buyers joined"` / `"1,247+ مشتري انضموا"`

3. **Single risk line** — One rotating risk fact (cycles every 4s) instead of a static list of 3
   - Fades between risks with a subtle transition
   - More scannable, less wall-of-text

4. **Action row** — Two buttons side by side:
   - **"Protect My Purchase"** (primary CTA → navigates to `/reviews`)
   - **Share button** using existing `ShareMenu` component with a compelling share text like `"847M EGP protected by real buyers on R8ESTATE"`

### Visual Treatment
- Keep the dark navy gradient background (brand signature)
- Remove the right-side risk panel box — integrate the single risk as inline text
- Tighter padding (`px-5 py-4`) — feels like a banner, not a section
- Add a subtle pulse animation on the shield icon to draw attention
- Keep dot texture and radial glow (brand consistency)

### What Makes It More Shareable
- The share button with pre-written viral copy
- The hook headline is screenshot-worthy
- Compact design looks good when shared as a screenshot

### Files Modified
- `src/components/CollectiveBuyerProtection.tsx` — Full redesign: single-column layout, rotating risk, share CTA, pulse animation

### No database changes needed.

