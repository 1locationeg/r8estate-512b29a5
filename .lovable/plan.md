

# "EGYPT'S REAL ESTATE REVIEW PLATFORM" — Descriptor Placement Plan

## What & Why

The uploaded image shows a platform descriptor: **"EGYPT'S REAL ESTATE REVIEW PLATFORM"**. This solves the core UX problem — visitors currently see "R8ESTATE" and a trust gauge but may not immediately grasp *what* the platform does or *where* it operates. This descriptor anchors both the geography (Egypt) and function (review platform) in one line.

## Recommended Position, Style & Effects

**Position**: Directly above the HeroTrustShowcase gauge, inside the hero card — the first text element a visitor reads before interacting with the gauge. This is the "above the fold, below the header" sweet spot.

**Typography**:
- Font: Montserrat (existing brand font) in **all caps** with wide letter-spacing (~0.2em) matching the uploaded image's spaced-out style
- Weight: **600 (semibold)** — prominent but not competing with the gauge score
- Size: `text-[10px] sm:text-xs md:text-sm` — compact, label-like, reads as a category descriptor rather than a headline
- Color: `text-muted-foreground/70` — subtle, muted blueish-gray that doesn't overpower the trust gauge focal point but remains legible

**Effect/Animation**:
- Subtle **fade-in + slight upward slide** on page load (200ms delay, 600ms duration) so it appears just before the gauge animates, establishing context first
- No continuous animation — it should feel stable and authoritative like a masthead label

## Technical Changes

**File: `src/pages/Index.tsx`** (lines ~282-284)
- Add the descriptor `<p>` tag right before `<HeroTrustShowcase />` inside the hero card's `relative text-center` div:

```tsx
<div className="relative text-center">
  {/* Platform descriptor */}
  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground/70 font-semibold tracking-[0.2em] uppercase mb-2 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
    EGYPT'S REAL ESTATE REVIEW PLATFORM
  </p>
  
  {/* Interactive Trust Showcase */}
  <HeroTrustShowcase />
```

**File: `src/index.css`** — Add the `fadeInUp` keyframe:

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Arabic support**: Add an `ar` translation key (e.g., `hero.platformDescriptor`) so it reads the equivalent in Arabic when the locale switches. Value: `"منصة مصر لتقييم العقارات"`

**Files: `src/i18n/locales/en.json` & `src/i18n/locales/ar.json`** — Add the translation key under `hero`.

Total: ~4 small edits across 4 files. No structural changes.

