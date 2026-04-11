

## Plan: Cycle "Reviews" Word with Star Rating Animation

### Behavior
The hero tagline line 2 normally shows **"Reviews are the KEYS"** (or Arabic equivalent). Periodically, the word "Reviews" swaps out for an animated star sequence (1★→2★→3★→4★→5★), then swaps back to "Reviews". The cycle repeats indefinitely.

**Timing:**
- Show "Reviews" text: **6 seconds**
- Show stars phase: stars animate 1→5 over ~3 seconds (600ms per star), hold 5★ for 1s, then swap back
- Total cycle: ~10s

### Changes

**1. `src/pages/Index.tsx` (lines 248-250)**

Add local state and effect to manage the swap:

```tsx
const [showStars, setShowStars] = useState(false);
const [starCount, setStarCount] = useState(0);

useEffect(() => {
  // Show "Reviews" for 6s, then switch to stars
  // Stars: increment 1→5 every 600ms, hold 1s, then back to text
  // Loop forever
}, []);
```

Replace the static `{t("hero.tagline_line2")}` with:

```tsx
<p className="... hero-keys-shimmer mt-1">
  {showStars ? (
    <>
      <span className="inline-flex items-center gap-1">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-7 h-7 md:w-9 md:h-9 transition-all duration-300
            ${i <= starCount ? 'fill-[#00b67a] text-[#00b67a] scale-100' : 'text-transparent scale-75'}`} />
        ))}
      </span>
      {" "}{t("hero.tagline_line2_post")}
    </>
  ) : (
    t("hero.tagline_line2")
  )}
</p>
```

**2. `src/i18n/locales/en.json`** — Add: `"tagline_line2_post": "are the KEYS"`

**3. `src/i18n/locales/ar.json`** — Add: `"tagline_line2_post": "هي المفاتيح"`

### Single file scope
- `src/pages/Index.tsx` — ~25 lines added
- `en.json` / `ar.json` — 1 key each

