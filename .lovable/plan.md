

# Expressive Status Icons — Bigger, Centered, Label Below

## Problem
The current cycling indicator uses tiny 2px colored dots that don't visually express the status meaning. The user wants meaningful icons (e.g., a warning triangle for risk) displayed larger and centered, with the term label underneath.

## Changes

### File: `src/components/ContractCheckCard.tsx`

1. **Import expressive icons**: Add `CheckCircle2`, `AlertTriangle`, `AlertCircle` from lucide-react
2. **Update terms array** to include an icon per status:
   - `ok` → `CheckCircle2` (green checkmark)
   - `risk` → `AlertTriangle` (red warning triangle)
   - `warn` → `AlertCircle` (amber alert circle)
3. **Redesign the middle section**: Replace the small dot + inline text with a centered layout:
   - Large icon (`w-7 h-7`) centered, colored per status
   - Term label below the icon, centered, colored per status
4. **Keep**: Header row (FileSearch + "Contract Health"), bottom CTA (Upload), and dot pagination

### Layout after change:
```text
🔍 Contract Health          ← header stays

      ⚠️                    ← large icon, centered
   Penalty Clause           ← label below, centered, colored

  📤 Upload yours →         ← CTA stays
      • • •                 ← dots stay
```

### No other files change.

