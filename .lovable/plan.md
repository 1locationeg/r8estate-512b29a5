

## Interactive Hero: Gauge + Review Card Focal Point

### Concept
Replace the current auto-cycling gauge with an interactive hero where the **review card is the focal point**, overlapping and driven by the gauge score. The gauge sets the emotional tone; the review card explains *why* the needle landed there. Users can interact via a slider and preset buttons.

### New Component: `HeroTrustShowcase`
A single new component replacing `HeroTrustGauge` in the hero section, containing:

**1. Gauge (top layer)**
- Same semicircular gauge with red→amber→green gradient arc, needle with elastic bounce animation, pulse ring at needle base
- On initial load: needle sweeps from 0 to the first score with a spring/overshoot easing
- Score badge pops in with scale animation after needle settles

**2. Review Card (overlapping the gauge)**
- Slides up from below, overlapping the gauge bottom ~30% so they share the same visual frame
- Content tied to the current score via preset review scenarios:
  - **25** (Low): negative review — delays, poor quality, "Slow" response tag
  - **55** (Mid): mixed review — decent but issues, "Average" tags
  - **88** (High): positive review — on time, great quality (matches the uploaded reference image style)
  - **97** (Elite): exceptional review — exceeded expectations
- Card structure (inspired by reference image):
  - Verified Buyer badge + project/location
  - Reviewer avatar, name, tier, star rating, date
  - Quoted review text in italics
  - Dimension score pills (e.g., "On time / Delivery", "Excellent / Build quality", "As shown / Brochure", "Slow / Response")
  - Footer: developer logo + name + Trust Score badge
- Each row staggers in with a 50ms delay for sequential reveal animation

**3. Interactive Controls (below the card)**
- **Slider**: drag to set score 0–100; needle, score number, color, label, and review card all update in real time
- **Preset buttons**: 25 / 55 / 88 / 97 — tap to jump to key trust scenarios
- **Replay button**: restarts the full entrance animation (gauge sweep + card slide-up + stagger)

**4. Score-to-Review Mapping**
- Define 4 review scenarios as data objects with: score, reviewer name, avatar initial, project, developer, rating, comment, dimension tags, trust label
- Slider snaps to nearest scenario content, or interpolates the gauge visually while showing the closest scenario's review

### Changes to `Index.tsx`
- Replace `<HeroTrustGauge />` with `<HeroTrustShowcase />`
- Remove the old "TRUST METER" label (now integrated into the component)
- Keep everything else (tagline, search bar, trust strip) below as-is

### Animation Details
- Gauge entrance: 1.2s cubic-bezier overshoot for needle, 0.8s arc fill left-to-right
- Review card: 0.6s slide-up + fade-in, starts 0.4s after gauge settles
- Row stagger: each row delays 80ms (badge → reviewer → quote → dimensions → footer)
- Slider interaction: immediate needle rotation + score color transition, review card crossfades to matching scenario
- Preset tap: 0.8s animated transition to target score + card swap

### Files
- **Create** `src/components/HeroTrustShowcase.tsx` — the full interactive hero component
- **Edit** `src/pages/Index.tsx` — swap `HeroTrustGauge` for `HeroTrustShowcase`
- **Keep** `src/components/HeroTrustGauge.tsx` — preserved but no longer used in hero

