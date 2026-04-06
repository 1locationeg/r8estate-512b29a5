

## Plan: Insert "i" into business/developer names for legal differentiation

### Approach
Insert the letter **"i"** into the middle of each business/developer name to create a subtle but clear distinction from genuine company names during testing. For example:
- "Palm Hills Developments" → "Palim Hills Developments"
- "Emaar Misr" → "Emiaar Misr"  
- "SODIC" → "SODiIC"
- "Ora Developers" → "Oria Developers"
- "Mountain View" → "Mouintain View"
- "Hyde Park Developments" → "Hyide Park Developments"
- "Tatweer Misr" → "Tatiweir Misr"
- "Coldwell Banker" → "Colidwell Banker"
- "RE/MAX" → "RE/iMAX"
- etc.

**Regarding bold "i"**: Since names are stored as plain strings and rendered across 15+ components, making one character bold everywhere would require a global name-rendering utility wrapping each name in JSX. This is high-effort and fragile. Instead, the inserted "i" will naturally stand out because it breaks the expected spelling. If you really want visual emphasis, we can explore it as a follow-up.

### Files to edit

1. **`src/data/mockData.ts`** — All developer names, project names, brokerage names, app names, review project references, and developer reply author names (~50+ name occurrences)

2. **`src/components/HeroCategoryItems.tsx`** — All `nameEn` values in category items (brokers, apps, platforms, exhibitions, channels, law firms, valuation, training, auctions, mortgage, research, tax, management, shares, leasing, blockchain, lands — ~60+ items)

3. **`src/components/CompareEngineShowcase.tsx`** — DEVELOPERS array names (2 items)

4. **`src/components/LiveMarketPulse.tsx`** — FALLBACK_EVENTS text and entityName fields (2 items)

5. **`src/lib/fuzzySearch.ts`** — commonMisspellings values to match the new names

6. **`src/components/ReviewsCarousel.tsx`** — TESTIMONIALS business author names

7. **`src/components/BusinessUpgradeModal.tsx`** — placeholder text example

### What stays unchanged
- Arabic names (بالم هيلز, إعمار, etc.) — these are transliterations and don't carry the same trademark risk
- Unit type names (Studio, Villa, etc.) — generic terms, not trademarks
- Location names (New Cairo, etc.) — geographic, no legal risk
- User/reviewer names (Ahmed, Sara, etc.) — fictional already

### Notes
- IDs remain unchanged (e.g., `palm-hills`) so no routing/linking breaks
- Only display names are modified
- The "i" placement will be in the first word of each name, roughly in the middle, to keep names readable

