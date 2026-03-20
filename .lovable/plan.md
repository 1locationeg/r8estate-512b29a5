

# Making the Hero Tagline Easier to Absorb Instantly

## The Problem
The tagline "Who's taking your millions to give you a home?" is powerful content, but it's a single block of text — the user's eye has to read the whole sentence before "getting it." At a glance, it's just a gradient blob.

## What Would Help: Visual Hierarchy Within the Tagline

The idea is **not to change the words** — but to make the key emotional words **pop at different speeds** so the brain processes it in chunks:

### Approach: Split-emphasis with staggered reveal

Break the tagline into **two visual lines** with different weights and a subtle staggered animation:

```text
Line 1:  "Who's taking your millions"     ← larger, heavier, appears first
Line 2:  "to give you a home?"            ← slightly smaller, appears 200ms later
```

**Why this works:**
- The eye catches "your millions" first (the emotional hook)
- Then "to give you a home?" lands as the punchline
- Two short lines are faster to scan than one long line
- The stagger creates a natural reading rhythm without feeling "animated"

### Technical implementation (Index.tsx, lines 304-309):

Replace the single `<p>` with two lines:

```tsx
<div className="mb-1.5 max-w-3xl mx-auto">
  <p className="text-xl sm:text-2xl md:text-3xl leading-tight font-black tracking-tight 
    bg-gradient-to-r from-primary via-brand-red to-accent bg-clip-text text-transparent
    animate-fade-in-up" style={{ animationDelay: '0ms' }}>
    {t("hero.tagline_line1")}
  </p>
  <p className="text-lg sm:text-xl md:text-2xl leading-tight font-bold tracking-tight 
    text-primary/90
    animate-fade-in-up" style={{ animationDelay: '200ms' }}>
    {t("hero.tagline_line2")}
  </p>
</div>
```

- Line 1 keeps the gradient effect (the emotional punch)
- Line 2 is solid navy, slightly smaller — the "resolution"
- Both use `animate-fade-in-up` with 200ms stagger

### Translation keys to add:

**English:**
- `hero.tagline_line1`: `"Who's taking your millions"`
- `hero.tagline_line2`: `"to give you a home?"`

**Arabic:**
- `hero.tagline_line1`: `"مين اللي بياخد ملايينك"`
- `hero.tagline_line2`: `"عشان يديك بيت؟"`

### Files to change:
1. **`src/i18n/locales/en.json`** — Add two new keys
2. **`src/i18n/locales/ar.json`** — Add two new keys
3. **`src/pages/Index.tsx`** — Split tagline into two styled lines with staggered animation

### Result
Same powerful words. But now the user "gets it" in under 1 second because the eye processes two short chunks instead of parsing one long sentence. The staggered fade creates a moment of drama without being flashy.

