

## Integrate Golden Coin Icon with Count Inside the Button

### Change in `src/components/ReviewerSpotlight.tsx`

Remove the separate `<span>` reward text. Instead, embed a golden coin icon (`Coins` from lucide-react) with "+25" directly inside the "Write a Review" button, styled with the existing `--coin` gold color (`text-coin`).

**Result:**
```
[ 🪙 +25  ✏️ Write a Review ]
```

The button will show a golden `Coins` icon + bold "+25" on the left, then the pen icon + "Write a Review" text — all in one button. The coin/number portion uses `text-coin` (gold #F5A623) to pop visually.

### File
- `src/components/ReviewerSpotlight.tsx` — replace line 26 span + update button to include coin count inside it

