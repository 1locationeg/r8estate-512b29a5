

# Secure Contract Verification Flow — Auto-Blur Sensitive Data + Authenticity Check

Upgrade the existing "Verified Buyer" receipt submission flow into a **lovable, privacy-first contract verification experience** that auto-redacts sensitive data on Egyptian reservation forms (استمارة حجز) and payment receipts before they ever reach an admin's eyes — then runs an AI authenticity check.

The current flow (`receipt_submissions` table + `AdminReceiptVerification.tsx`) accepts a raw upload and shows it to admins. That's a privacy liability and feels clunky. We'll make it feel like a private wealth tool.

## The lovable moment

A buyer uploads their reservation form. Within 5 seconds they see:
1. **Live preview** of their document with sensitive fields **blurred in real-time** (name, national ID, phone, contract value, signature)
2. A **green "Authenticated"** stamp with confidence score
3. A clear list of what was **detected vs blurred** so they trust what's being sent
4. One-tap submit → instant **"Verified Buyer"** badge upon admin approval

This converts the anxiety of "I'm sending my contract to strangers" into **"R8ESTATE protected my data before I even hit submit."**

## What we'll build

### 1. New component: `SecureContractUpload.tsx`
Replaces the raw file input inside `WriteReviewModal` (Phase 3 receipt step) and `BuyerVerification.tsx`.

Three-step inline flow inside an existing modal slot:
- **Step A — Upload**: drag-drop or camera capture (mobile-friendly), accepts JPG/PNG/PDF up to 8MB
- **Step B — Auto-redaction preview** (2–4 sec): shows the document with blurred regions overlaid as soft frosted rectangles. User sees a checklist: "✓ Name blurred · ✓ National ID blurred · ✓ Phone blurred · ✓ Contract value blurred · ✓ Signature blurred"
- **Step C — Authenticity result**: shows confidence badge (Authentic / Needs Review / Suspicious), document type detected (Reservation Form / Payment Receipt / Sale Contract / Unknown), developer name extracted (auto-fills the form), and a "Submit for Verification" CTA

Visual style: Navy/Gold "Silent Luxury" — glassmorphism card, gold accent border on success, soft pulsing scan-line animation during processing. Mobile-safe at 390px, RTL-aware.

### 2. New edge function: `verify-contract`
Called from the client after upload. Runs in two stages:

**Stage 1 — Vision-based redaction & extraction** (Lovable AI Gateway, `google/gemini-2.5-flash` for cost):
- Receives the uploaded image (base64)
- Single multimodal call extracts structured JSON via tool calling: detected document type, developer name, project name (if visible), and **bounding boxes** for sensitive regions (name, national_id, phone, address, contract_value, signature, account_number)
- Returns coordinates only — never returns the raw extracted PII text to the client

**Stage 2 — Authenticity scoring** (same call, additional tool fields):
- Heuristic flags from the AI: font_consistency, has_official_letterhead, has_stamp_or_signature, image_tampering_signs (cloned regions, mismatched compression), date_validity
- Outputs `authenticity_score: 0–100` + `authenticity_label: authentic | needs_review | suspicious` + `flags: string[]`

### 3. Client-side blur rendering
The edge function returns coordinates; the client draws blurred rectangles over the image using `<canvas>`:
- Original image is **never uploaded as-is** to storage — the canvas-rendered redacted version is what gets uploaded
- Original is held only in browser memory and discarded after upload
- Storage receives only the **redacted** image → admins see the redacted version, never the raw PII

This is the privacy guarantee that makes the feature trustworthy.

### 4. Database changes (migration)

Extend `receipt_submissions` with:
- `document_type` (text: 'reservation_form' / 'payment_receipt' / 'sale_contract' / 'unknown')
- `authenticity_score` (int 0–100)
- `authenticity_label` (text)
- `authenticity_flags` (jsonb array)
- `redacted_fields` (jsonb array — list of what was blurred, e.g. `["name", "national_id", "contract_value"]`)
- `extracted_developer_name` (text — for admin cross-check, not user-visible PII)
- `redacted_image_url` (text — the safe version stored in `review-attachments` bucket)
- Keep existing `image_url` column but **populate it with the redacted image URL** (no schema break)

RLS unchanged — users see only their own submissions, admins see all. The original (non-redacted) image is **never persisted server-side**.

### 5. Admin UI update — `AdminReceiptVerification.tsx`
Adds three new badges to each pending submission card:
- **Authenticity** badge (green/amber/red) with score and flags tooltip
- **Document type** chip
- **Redacted fields** chip-list (so admin sees what was protected)

Adds a "Re-run authenticity check" button (calls the edge function again — useful if the model improves later).

Sorting/filter by authenticity score added to help admins prioritize suspicious uploads.

### 6. New "Verified Receipt" review badge
In `ReviewCard.tsx`, when a review is linked to an approved receipt with `authenticity_score >= 75` AND `document_type IN ('reservation_form','sale_contract','payment_receipt')`, show a new gold-bordered chip: **"📜 Contract Verified"** (distinct from the existing "Verified Buyer" green chip).

This is the emotional payoff for the reader — they see proof tier, not just a generic verification.

### 7. i18n keys (`en.json` + `ar.json` Ammiya)
Under `verification.contract.*`:
- Step labels, blur explanations, authenticity messages, error states, privacy reassurance copy
- Arabic copy uses warm reassuring tone: "بياناتك محمية. مفيش حد هيشوف اسمك أو رقمك القومي."

### 8. Engagement tracking
Fire `corridor:engage` events:
- `{ zone: 4, action: "contract_upload_started" }`
- `{ zone: 4, action: "contract_redaction_complete" }`
- `{ zone: 4, action: "contract_submitted_for_verification" }`

## Files

**Create**
- `src/components/SecureContractUpload.tsx` — the 3-step inline component
- `src/lib/contractRedaction.ts` — canvas helper that takes image + bounding boxes and returns a redacted blob
- `supabase/functions/verify-contract/index.ts` — vision call + tool-calling extraction + authenticity scoring

**Edit**
- `src/components/WriteReviewModal.tsx` — swap raw receipt `<input type="file">` in `handleReceiptCapture` for `<SecureContractUpload>`
- `src/components/BuyerVerification.tsx` — same swap for standalone verification flow
- `src/components/AdminReceiptVerification.tsx` — render authenticity badges, document type, redacted-fields chips, sort/filter by score, re-run button
- `src/components/ReviewCard.tsx` — add "Contract Verified" gold chip when linked receipt has `authenticity_score >= 75`
- `src/hooks/useVerifiedBuyer.ts` — extend to also expose `hasContractVerified` boolean (for the new chip on reviews)
- `src/i18n/locales/en.json` + `ar.json` — `verification.contract.*` keys

**Migration**
- New columns on `receipt_submissions` (`document_type`, `authenticity_score`, `authenticity_label`, `authenticity_flags`, `redacted_fields`, `extracted_developer_name`, `redacted_image_url`)
- Index on `(authenticity_score DESC)` for admin sorting

## Cost & privacy guardrails

- **One AI call per upload** (combined extraction + authenticity in single tool-calling request)
- Uses cheap `google/gemini-2.5-flash` model (~$0.005/upload estimated)
- Original image never persisted server-side — only the canvas-redacted version is uploaded to storage
- AI never returns extracted PII text to client — only bounding box coordinates
- Rate limit (already planned in earlier abuse-protection work): 5 contract uploads per user per day, enforced inside edge function before any AI call

## Out of scope
- True OCR of every contract field for searchable archive (privacy-hostile + costly)
- Cross-checking contract numbers against developer-provided databases (no such API exists in Egypt yet)
- Watermarking the redacted image (can layer on later)
- PDF multi-page handling beyond first page (v2)
- Arabic-only legal validation rules (RERA compliance check) — defer to legal review feature

## Why this is the lovable upgrade

Before: "Upload a receipt and trust us." → buyer hesitates, abandons.
After: "We blurred your private data before sending it. Here's exactly what was protected. Here's the authenticity score." → buyer feels in control, completes verification, gets gold contract-verified badge that future readers trust more than a generic green chip.

That gap — between *I uploaded a file* and *R8ESTATE protected me* — is where MVP becomes MLP.

