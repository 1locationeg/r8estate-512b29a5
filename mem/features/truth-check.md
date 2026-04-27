---
name: Truth-Check (MLP lovable moment)
description: Hero AI claim-checker on /truth-check + homepage that grounds verdicts on verified buyer reviews + approved contract receipts via the truth-check edge function.
type: feature
---
The Truth-Check feature is R8ESTATE's MLP "lovable moment". A buyer pastes a developer's marketing claim and gets a grounded verdict (backed_by_buyers / mixed_signals / contradicted_by_buyers / insufficient_evidence) within seconds.

Architecture:
- `supabase/functions/truth-check/index.ts` — pulls up to 25 approved reviews (verified-first) + latest trust_score_snapshot + count of approved receipt_submissions with authenticity_score>=75 and document_type in (reservation_form, payment_receipt, sale_contract). Calls Lovable AI Gateway (google/gemini-3-flash-preview) with strict tool-calling output. Validates every cited review_id against the supplied list to prevent hallucinated citations. Per-IP throttle 1 call / 10s.
- `src/components/TruthCheckHero.tsx` — reusable card. Props: developerId, developerName, initialClaim, variant ('hero'|'compact'). Uses supabase.functions.invoke. Fires fireCorridorEngage(2, 'truth_check').
- `src/pages/TruthCheck.tsx` — full page at `/truth-check`, accepts ?claim=, ?developer=, ?name= query params for shareable smart-links.
- Homepage: rendered between ReviewerSpotlight and HeroNextSteps in `src/pages/Index.tsx`.
- i18n: full `truthCheck.*` namespace in en.json and ar.json (Egyptian Ammiya).

Contract Verified chip on ReviewCard already lives at lines 114-123 of ReviewCard.tsx and uses useVerifiedBuyer.hasContractVerified.