

## Plan: AI Vibes Facelift for the Landing Page

This is a **visual polish** of the existing landing page — same structure, same data, same flows. Every section stays in place. The upgrade adds a modern "AI-forward" aesthetic through refined spacing, subtle background textures, improved card treatments, and a new Quick Actions grid + AI Trust Strip.

### What Changes (and What Doesn't)

**Stays exactly the same:** All routing, state management, data flow, search logic, category selection, item detail, spotlight, bottom nav, FAB, footer. No functional changes.

### Visual Upgrades by Section

#### 1. Hero Card Container (`Index.tsx` hero section)
- Wrap the Trust Meter title + gauge + tagline in a card with a subtle dot-grid SVG background pattern and a soft navy gradient border
- Add `backdrop-blur` and refined padding
- "TRUST METER" label gets wider letter-spacing, smaller font, uppercase

#### 2. Trust Gauge (`HeroTrustGauge.tsx`)
- Add a verified checkmark (✓) circle at the gauge tip when score ≥ 66
- Add "TRUST SCORE" label below the arc in the SVG itself (centered, uppercase, tracked)
- Slightly larger gauge: `w-56 h-32 md:w-64 md:h-36`
- Add subtle outer glow ring on the arc

#### 3. Search Bar (`HeroSearchBar.tsx`)
- "Ask AI" pill gets a sparkle icon (already has it) + subtle gradient background
- Entire search container gets a slightly elevated shadow treatment
- No structural changes

#### 4. Traction Stats (`TractionStats.tsx`)
- Wrap in a card with subtle dividers between stats
- Gold numbers stay, icons stay brand-red
- Add thin vertical `border-e` dividers between each stat

#### 5. NEW: AI Trust Strip (in `Index.tsx`)
- Dark navy banner below stats, above discovery chips
- 3 value propositions in a row: "AI-Verified Reviews" / "Real Buyer Data" / "Zero Fake Reviews"
- Small icons + text, horizontal scroll on mobile

#### 6. NEW: Quick Actions Grid (in `Index.tsx`)
- 4-card grid below the discovery chips (Best of / Trending / New Launches)
- Cards: Compare Developers, Top Rated, Legal Advisory, Market Insights
- Each card: icon + title + one-line description
- Tapping them scrolls to relevant sections or opens modals (placeholder for now — just visual)

#### 7. Verified Badge Row (in `Index.tsx`)
- Horizontal scrolling pill badges: "Verified Developer ✓", "Trusted Broker ✓", "Verified Buyer ✓"
- Placed between discovery chips and Quick Actions

#### 8. Featured Marquee
- Slightly refined card styling — add `shadow-sm` and tighter border radius
- No structural changes

#### 9. Spotlight (`FeaturedIdentitySpotlight.tsx`)
- Add a dark navy gradient banner on top of the card (like a hero image area)
- Developer name in white on the banner
- "FEATURED" badge gets green accent treatment
- No structural changes to reviews/gauge

### Files to Edit

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Hero card wrapper with dot-grid, AI Trust Strip, Quick Actions grid, Verified Badge row |
| `src/components/HeroTrustGauge.tsx` | Verified checkmark, "TRUST SCORE" label in SVG, slightly larger, outer glow |
| `src/components/TractionStats.tsx` | Card wrapper with dividers |
| `src/components/FeaturedIdentitySpotlight.tsx` | Navy gradient banner header treatment |
| `src/index.css` | Add dot-grid pattern utility class, AI-strip gradient |

### No Changes To
- Color palette (navy, red, gold stay)
- Montserrat font (stays as-is per brand guidelines)
- Any routing, auth, data, or functional logic
- Search, categories, item detail, modals
- Footer, bottom nav, FAB

