

## Plan: Make "Reviews are the KEYS" the Hero Attention Grabber

### Concept
Split the tagline into two distinct visual layers:
1. **"Real Estate Has Secrets ;"** — subdued, elegant setup line
2. **"Reviews are the KEYS"** — the hero punch, with a gold shimmer animation, larger size, and a subtle glow pulse to grab attention instantly

### Changes

#### 1. Split translations into two lines
**`src/i18n/locales/en.json`** and **`ar.json`**:
- `tagline_line1`: "Real Estate Has Secrets ;"
- `tagline_line2`: "Reviews are the KEYS" (en) / "التقييمات هي المفاتيح" (ar)

#### 2. Restyle the hero tagline in `src/pages/Index.tsx` (lines 240-245)
- **Line 1** ("Real Estate Has Secrets ;"): Smaller size (`text-base sm:text-lg md:text-xl`), muted foreground color, medium weight — the quiet setup
- **Line 2** ("Reviews are the KEYS"): Large bold (`text-2xl sm:text-3xl md:text-4xl`), gold-to-red gradient text, with a custom CSS class `hero-keys-shimmer` for an animated shimmer sweep + subtle text-shadow glow
- Remove `whitespace-pre-line` since we're splitting into two `<p>` tags

#### 3. Add `hero-keys-shimmer` animation in `src/index.css`
A horizontal shimmer sweep (gold highlight sliding across the text every 3s) using a `background-size` + `background-position` animation on the gradient text. This creates a "light catching keys" effect — attention-grabbing but not distracting.

```text
Layout:

   Real Estate Has Secrets ;        ← subdued, smaller
   Reviews are the KEYS             ← BOLD, gold shimmer, glowing
```

### Files Modified
- `src/i18n/locales/en.json` — split tagline back into two lines
- `src/i18n/locales/ar.json` — same for Arabic
- `src/pages/Index.tsx` — two styled `<p>` tags with differentiated treatment
- `src/index.css` — new `hero-keys-shimmer` keyframe animation

