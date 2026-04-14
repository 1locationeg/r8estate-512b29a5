

## Audience Color Identity System

### Concept
Assign each of the four audience segments a distinct color theme that persists across the entire platform — cards, pages, profiles, badges, replies, etc. When a user sees a color, they instantly know which audience it belongs to.

### Color Assignments

```text
Segment            Type   Color Name      Hex        HSL
─────────────────────────────────────────────────────────
Buyers/Investors   B2C    Brand Navy      #0a3d62    203 81% 21%  (existing --primary)
Developers         B2B    Forest Green    #3B6D11    93 72% 25%   (existing --business-border)
Service Companies  B2B    Teal/Cyan       #0891B2    192 91% 37%  (new)
RE Professionals   B2B    Amber/Bronze    #B45309    30 92% 37%   (new)
```

Buyers keep the existing navy primary. Developers keep the established forest green. Service Companies get a teal blue, and RE Professionals get a warm amber/bronze — all distinct and accessible.

### Implementation Steps

**1. Add CSS custom properties** (`src/index.css`)
- Add new token groups for `--services` and `--professionals` (similar to existing `--business` group)
- Add `--buyers` alias tokens pointing to existing primary values for consistency

**2. Add Tailwind color mappings** (`tailwind.config.ts`)
- Add `services`, `professionals`, and `buyers` color groups to the `extend.colors` config

**3. Update AudienceSegmentCards** (`src/components/AudienceSegmentCards.tsx`)
- Add color metadata to each segment definition
- Apply segment-specific colors to icon backgrounds, hover borders, and CTA text per card

**4. Update segment-specific pages and components**
- **Developers**: Already uses forest green — no changes needed
- **Service Companies**: Apply teal theme to service-related components (service profiles, service cards, service badges)
- **RE Professionals**: Apply amber theme to professional-related components (professional profiles, credentials, badges)
- **Buyers/Investors**: Confirm navy is used consistently (already the default primary)

**5. Update translation files** (`en.json`, `ar.json`)
- No text changes needed — this is purely visual

### Files to modify
- `src/index.css` — add CSS variables for services and professionals
- `tailwind.config.ts` — add new color tokens
- `src/components/AudienceSegmentCards.tsx` — color-code each card
- Business/developer components — already green, verify consistency
- Service-related components — apply teal theme
- Professional-related components — apply amber theme

### Visual Result
Each audience card will have its own accent color on icon, border hover, and CTA. This color will carry through to their respective dashboards, profiles, badges, and interactions across the platform.

