

## AI Content Guard — Full Plan (Updated)

### Problem

Users can post insults, competitor attacks, bias, and generic/evidence-free reviews. The existing `review-integrity-check` only catches promotional language.

### Solution: Two-Layer Content Guard + Pre-Publish Objectivity Prompt

#### Layer 1: Client-Side Pre-filter (`src/lib/contentGuard.ts`)
- Regex list of Arabic/Egyptian + English profanity and slurs
- `checkContentLocally(text): { blocked: boolean; reason?: string }` — instant inline warning while typing (debounced 500ms)

#### Layer 2: AI Deep Analysis (`supabase/functions/review-integrity-check/index.ts`)
- Expand system prompt to detect: profanity, insults, personal attacks, competitor sabotage, bias, threats, defamation
- Add `content_type` param (`review` | `post` | `reply`)
- New response fields: `violation_type`, `severity`
- Keep backward compatibility with existing `suspicion_score` + `flags`

#### NEW — Layer 3: Pre-Publish Objectivity Reminder

Before the submit button fires the AI check, show a **prominent guidance card** reminding the reviewer to be objective and evidence-based. This appears as a persistent banner above the submit button in all review/post forms.

**Message (EN):**
> "Your review matters. To help others make real decisions, please be specific and objective — share what happened, when, and what evidence you have. Generic praise or personal attacks without proof won't be published."

**Message (AR):**
> "رأيك مهم. عشان تساعد غيرك ياخد قرار صح، اكتب بموضوعية — قول إيه اللي حصل بالظبط، إمتى، وإيه الدليل. الكلام العام أو الهجوم الشخصي من غير دليل مش هيتنشر."

This card includes:
- A `ShieldCheck` icon with amber/gold accent
- Three mini-tips as bullet points: "Be specific", "Share evidence", "Stay objective"
- Appears in `WriteReviewModal`, `FrictionlessReview`, `CommunityNewPost`, and `CommunityPostDetail` (reply composer)

### Integration Points

| Component | Local filter | AI check on submit | Objectivity reminder |
|-----------|-------------|-------------------|---------------------|
| `WriteReviewModal` | Yes (typing) | Yes (block >80, warn 50-80) | Yes (above submit) |
| `FrictionlessReview` | Yes (typing) | Yes (existing, enhanced) | Yes (above submit) |
| `CommunityNewPost` | Yes (typing) | Yes (post body) | Yes (above submit) |
| `CommunityPostDetail` | Yes (replies) | Yes (reply body) | Yes (above send) |

### Files

1. **New: `src/lib/contentGuard.ts`** — Client-side regex pre-filter
2. **Edit: `supabase/functions/review-integrity-check/index.ts`** — Expand AI prompt for profanity/attacks/bias + add `content_type` param
3. **Edit: `src/components/WriteReviewModal.tsx`** — Add local filter, AI check on submit, objectivity reminder card
4. **Edit: `src/pages/FrictionlessReview.tsx`** — Add local filter, objectivity reminder card (AI check already exists)
5. **Edit: `src/components/CommunityNewPost.tsx`** — Add local filter, AI check, objectivity reminder card
6. **Edit: `src/components/CommunityPostDetail.tsx`** — Add local filter + AI check + reminder to reply composer
7. **Edit: `src/i18n/locales/en.json`** — Add `contentGuard` namespace (warnings, objectivity tips, violation messages)
8. **Edit: `src/i18n/locales/ar.json`** — Arabic translations

### No database changes needed

