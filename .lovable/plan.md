

## Plan: Redesign Products Page — Minimal, Branded, Benefit-Focused

### Problem
The current Products page uses a dark standalone theme (black bg, amber accents) that's disconnected from the main R8ESTATE brand (navy/gold/white). It's also crowded — 10 large cards with feature lists, a stage overview section, AND a flywheel section all compete for attention.

### Approach
Rebuild the page using the site's existing design tokens (navy primary, gold accent, white background) with a clean, minimal layout. Replace verbose feature lists with a single benefit line per product. Group products under their stage with a stage icon. Remove the flywheel section (or reduce to a single line). Use the site's `bg-background`, `text-foreground`, `text-primary`, `text-accent` tokens.

### Changes — `src/pages/Products.tsx`

**1. Background & Theme**
- Replace `bg-[#0a0a0a] text-white` with `bg-background text-foreground` (site's light theme).
- Remove the grain texture overlay entirely.
- Use `font-['Montserrat']` consistent with the site.

**2. Hero — Simplify**
- Keep "BUILT ON TRUST / POWERED BY DATA" but style with `text-primary` (navy) and `text-accent` (gold) instead of white/amber.
- Remove the stats row (10/3/∞) and "The Complete Ecosystem" subtitle — they add noise.
- Add a short buyer-focused benefit line: "Know before you buy. Verify before you sign. Track after you pay."

**3. Stage Icons**
- Assign Lucide icons to each stage: `Search` (Before You Buy), `FileSignature` (At Signing), `ShieldCheck` (After You Buy).
- Remove the separate stage overview cards — merge stage headers directly into the product listing.

**4. Products — Compact List by Stage**
- Group products under stage headers (with stage icon + stage name).
- Each product becomes a single compact row: icon | name | one-line benefit (replacing the long description + feature list).
- Replace verbose descriptions with short buyer benefits:
  - R8 MAP → "See trust scores on a live map"
  - R8 METER → "Instant trust score for any entity"
  - R8 PULSE → "Real-time market sentiment signals"
  - R8 INTEL → "Deep developer intelligence reports"
  - R8 SHIELD → "AI-powered contract risk detection"
  - R8 CHECK → "One-click broker background check"
  - R8 CERTIFIED → "Developer trust certification badge"
  - R8 TRACK → "Track your unit's delivery progress"
  - R8 VOICE → "Verified buyer review engine"
  - R8 KEYS → "Trusted resale & handover platform"
- "COMING SOON" badge on each row in muted text.

**5. Flywheel — Reduce to a subtle footer line**
- Replace the full flywheel section with a single centered line: "Every product feeds every other — trust compounds over time."

**6. Footer — Match site**
- Use `text-primary` and `text-muted-foreground` instead of white.

**7. Back link**
- Style with `text-muted-foreground` and site tokens.

### Result
A clean, scrollable page that feels like part of the R8ESTATE site — light background, navy/gold palette, minimal layout with clear benefits per product grouped by journey stage.

