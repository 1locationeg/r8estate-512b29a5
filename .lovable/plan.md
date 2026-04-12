

## Plan: Move trust badges before ReviewsCarousel

### Changes in `src/pages/Index.tsx`

1. **Remove** the trust badges block (lines 657–666) from the bottom "Trust Badges + Reviews + Footer" wrapper — the two "Zero Risk" and "100% Confidence" buttons and their flex container.

2. **Insert** that same flex container immediately before the `ReviewsCarousel` block (before line 492), inside the same below-the-fold section so they share one visual fold.

3. The bottom wrapper (lines 655–669) simplifies to just `<Footer />`.

### Resulting order around that area
… CommunityHighlights → **Trust Badges (Zero Risk / 100% Confidence)** → ReviewsCarousel → Category Links → …

