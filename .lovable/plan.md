# R8ESTATE → MLP: The "Truth-Check" Lovable Moment

You already have the hard parts built (AI verify-contract, on-device blur, `receipt_submissions`, Verified Buyer badge, trust-score pillars). What's missing is the **emotional payoff** — the single moment where a buyer feels: *"this platform just saved me 5M EGP."*

This plan ships **one focused MLP feature** + two small surfacing wins, instead of spreading thin across the whole blueprint.

---

## 1. Truth-Check Hero Widget (NEW — the lovable moment)

**Where:** New card in the homepage hero stack (between `HeroTrustShowcase` and `HeroNextSteps`), plus a deep-link route `/truth-check`. Mobile gets a compact entry chip in the hero CTAs.

**The interaction (≤ 3 taps):**
1. Buyer pastes a developer's marketing claim (Arabic or English) — e.g. *"تسليم في 2026، ١٠٠٪ على الخريطة، عائد استثماري ١٢٪"*.
2. Optional: pick the developer from a typeahead (reuses `businessProfileSearch.ts`).
3. Hits **"تحقّق من الحقيقة / Truth-Check"** → streaming AI verdict appears below.

**The output (the "warranty of truth" feel):**
- A verdict pill: ✅ Backed by buyers · ⚠️ Mixed signals · ❌ Contradicted by buyers
- 2–4 short evidence bullets, each citing a *real* verified review or approved receipt (with reviewer first-name + verification badge inline).
- A "Risk delta" line — e.g. *"3 verified buyers reported delivery slipped by 8 months on this developer's last 2 launches."*
- CTA: **"See full trust report →"** linking to the developer's `/entity/...` page.

**Why this is the MLP unlock:** it converts a passive directory into an active anxiety-management tool. A guest who pastes a brochure claim and gets contradicted by 3 verified contracts will tell their friends.

### Implementation

**New edge function:** `supabase/functions/truth-check/index.ts`
- Input: `{ claim: string, developer_id?: string, lang?: 'ar' | 'en' }`.
- Server-side: pull grounding context with the service role:
  - Up to 25 most-recent **approved** reviews for the developer (or top-rated developers if no `developer_id`), prioritising verified buyers and contract-verified receipts (reuses logic in `useVerifiedBuyer.ts`).
  - Aggregate stats from `trust_score_snapshots` (latest row): `computed_score`, `avg_rating`, `verified_pct`, `per_category_counts`.
  - Approved `receipt_submissions` count where `authenticity_score >= 75` and `document_type IN ('reservation_form','payment_receipt','sale_contract')` → "N contract-verified buyers".
- Compose a tightly scoped prompt to `google/gemini-3-flash-preview` via the Lovable AI Gateway, **streaming** SSE back to the client.
- Use **tool calling** for the verdict header (verdict enum + 2–4 evidence items each linking back to a `review_id`), then stream a freeform short summary after. This guarantees structured citations.
- Strict guardrails in the system prompt: *"Cite only the provided reviews/receipts. If evidence is insufficient, return verdict='insufficient_evidence' and say so plainly. Never fabricate buyer names or numbers."*
- Handle 429 / 402 with the standard surfaced toasts.
- Rate limit: 1 call / 10s per IP via in-memory map (acceptable for MLP; document the limitation).

**New component:** `src/components/TruthCheckHero.tsx`
- Glassmorphism card matching `HeroTrustShowcase` (navy + gold). RTL-safe (`ms-`/`pe-`/`text-start`).
- Textarea (max 500 chars) + developer typeahead + submit.
- Streams tokens via the SSE pattern from `AIChatWidget.tsx`.
- Renders verdict pill, evidence list (each row clickable → `/reviews?developer=...&highlight=<review_id>`), and the "See full trust report" CTA.
- Empty state shows two pre-baked example claims (one positive, one suspicious) the user can tap to demo without typing — critical for the "wow" moment on first load.
- Skeleton + abort controller to cancel mid-stream.

**New page:** `src/pages/TruthCheck.tsx` mounted at `/truth-check` in `App.tsx`. Pre-fills `?claim=` and `?developer=` query params for shareable links (smart-links friendly).

**i18n:** Add an Ammiya Arabic copy block + English fallback under a new `truthCheck.*` namespace in `src/i18n/locales/{ar,en}.json`. Keep the verdict labels short (≤ 3 words) for mobile.

**Tracking:** Fire `corridor:engage` with `kind: 'truth_check'` on submit and on "See full report" click, so the Journey Corridor recognises it as a Choose-stage action.

---

## 2. "Contract-Verified" surfacing (small wins, big trust signal)

The badge logic exists (`useVerifiedBuyer.hasContractVerified`) but is barely visible. Two micro-changes:

- **`ReviewCard.tsx`**: when `hasContractVerified` for the reviewer, prepend a small gold shield chip *"عقد موثّق · Contract Verified"* with a tooltip explaining what it means. This is the visible *"warranty of truth"*.
- **Entity profile header** (`ItemDetailSection.tsx` sidebar stats): add a one-line stat *"N contract-verified buyers"* under the existing review count, computed from approved `receipt_submissions` for that `developer_id`. Read-only, no schema change.

---

## 3. Truth-Check entry point in the Compare flow (lightweight)

In `CompareModal.tsx`, add a single row above the comparison grid: *"Paste a claim either developer makes → Truth-Check it"*. Clicking opens the same `TruthCheckHero` component in a sheet, pre-populated with both `developer_id`s so the AI can rule on which one the claim better matches.

---

## What we're explicitly NOT doing in this iteration

- No schema changes — every input already exists (`reviews`, `receipt_submissions`, `trust_score_snapshots`, `business_profiles`).
- No "marketing render vs site progress" comparison slider — that needs a UGC photo upload pipeline + moderation, which is its own MLP and would dilute focus.
- No new badge tier — the existing Verified Buyer / Contract Verified vocabulary is enough; we're just making it visible.
- No crowdsourced heat map — promising but a separate build (geocoding + map clustering).

---

## Risks & mitigations

- **Hallucinated citations** → mitigated by tool-calling structured output that requires a `review_id` from the supplied list; the client will refuse to render any evidence row whose `review_id` isn't in the request payload.
- **Sparse data on small developers** → verdict falls back to `insufficient_evidence` with a "Be the first to review" CTA, which itself drives the review funnel.
- **Cost** → flash model + 25-review cap + 10s per-IP throttle keeps spend bounded; LOVABLE_API_KEY rate-limit errors are surfaced as toasts.
- **Arabic/English mixed claims** → prompt explicitly accepts both and replies in the claim's primary language.

---

## Files touched

- **New**: `supabase/functions/truth-check/index.ts`, `src/components/TruthCheckHero.tsx`, `src/pages/TruthCheck.tsx`
- **Edited**: `src/App.tsx` (route), `src/pages/Index.tsx` (hero slot), `src/components/ReviewCard.tsx` (badge), `src/components/ItemDetailSection.tsx` (stat), `src/components/CompareModal.tsx` (entry row), `src/i18n/locales/{ar,en}.json` (copy), `src/lib/corridorEvents.ts` (new event kind), memory file `mem://features/truth-check` + index update.

Approve and I'll build it end-to-end in default mode.
