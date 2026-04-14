

## Plan: Shift CollectiveBuyerProtection to a Light Red/Warm Danger Theme

### What changes
The entire card currently has a neutral card background with a subtle red tint for the "Without" section and a green zone for the "With" section. The user wants the overall card to lean into a **light red/danger theme** — making the urgency more visceral while keeping the green "WITH R8ESTATE" safe zone as a contrasting relief.

### Design approach
Inspired by the attached image's clean, light aesthetic — apply a warm red-tinted background to the whole card instead of neutral `bg-card/80`:

1. **Card wrapper**: Change from `bg-card/80` + subtle destructive overlay → `bg-red-50/80` (light mode feel) with `border-red-200/40`. Increase the red gradient overlay opacity slightly.
2. **Dot texture**: Boost opacity from `0.04` → `0.06` for more visual texture.
3. **Risk counter (847M EGP)**: Keep `text-destructive` but make it bolder with a subtle red glow shadow.
4. **Risk keyword pills**: Add light red pill backgrounds (`bg-red-100/60 rounded-full px-2 py-0.5`) instead of plain text — more badge-like.
5. **Divider**: Change to `border-red-200/40` to blend with the red theme.
6. **Green safe zone**: Keep as-is — the contrast between the red card and green zone amplifies the "safety" message. This matches the attached image's clean green CTA bar.

### Files changed
- `src/components/CollectiveBuyerProtection.tsx` — update Tailwind classes only

### Technical details
- Card: `bg-red-50/80 dark:bg-red-950/20 border-red-200/30 dark:border-red-900/30`
- Gradient overlay: increase from `0.03` → `0.06`
- Keyword pills: wrap in `bg-red-100/60 dark:bg-red-900/20 rounded-full px-2.5 py-0.5`
- Counter: add `drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]`
- All changes are CSS-only, no logic changes

