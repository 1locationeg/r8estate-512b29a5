# Boost the Arabic & English Reviewing System and Reviewer Experience

A focused, high-impact upgrade across the review modal, reviewer journey, and copy — in both Arabic (white-Arabic: warm-but-professional) and English. No schema changes; we layer on top of the existing 4-step `WriteReviewModal`, gamification, and verification systems.

## Goals

1. Lower the friction of starting a review (1-tap stars + chips → AI draft).
2. Raise the perceived value of writing a real review (impact, badges, points, visibility).
3. Make reviewer status feel like a VIP identity (tiers, streaks, profile pride).
4. Convert one review into more reviews (post-submit loop + referrals).
5. Unify Arabic/English voice so both feel native — Arabic in clean white-Arabic, English warm and confident.

## 1. WriteReviewModal — Step 1 (Rate)

Add **above** the existing "Tell your full story" motivator, in this order:

- **Social Impact Banner** (logged-in users only, after `saveRatingOnly`)
  - Soft amber card (`#fdf3d0` / border `#f0d068`), eye icon, 12px text in `#7a5500`.
  - Rating-aware copy:
    - 5★ AR: "تم حفظ تقييمك ✓ — أكثر من 1,247 مشتري سيطّلعون على هذا المشروع هذا الأسبوع"  
      EN: "Your rating is saved ✓ — over 1,247 buyers will see this developer this week"
    - 4★ AR: "رأيك مهم ✓ — ساعدت 1,247 مشتري في اتخاذ قرار صحيح"  
      EN: "Your view matters ✓ — you just helped 1,247 buyers decide with confidence"
    - 3★ AR: "شكراً لك — رأيك يساعد المشترين على معرفة الحقيقة"  
      EN: "Thank you — your honesty helps buyers see the full picture"
    - 1–2★ AR: "نأسف لتجربتك — رأيك يحمي المشترين القادمين"  
      EN: "We're sorry it went this way — your review protects future buyers"

- **Word-Cloud Chips** ("اختر ما ينطبق على تجربتك" / "Pick what fits your experience")
  - 5–7 chips per rating bucket (positive / negative / neutral colors as specified).
  - Multi-select; selected chips get red ring + slight scale.
  - Hint line under chips:
    - 0 selected AR: "اختر بعض الكلمات وسنساعدك في صياغة المراجعة ✨"  
      EN: "Pick a few words and we'll help you draft the review ✨"
    - ≥1 selected AR: "ممتاز — تابع لكتابة مراجعتك" (green `#1a6635`)  
      EN: "Great — continue to write your review"

- **Pre-populate Step 2 textarea** when advancing, only if content is empty:  
  AR: `اشتريت وحدتي في {developer}، وأبرز ما ميّز تجربتي: {chips}.`  
  EN: `I bought my unit at {developer}. What stood out the most: {chips}.`

## 2. WriteReviewModal — Step 2 (Your Review) polish

- Replace ammiya nudges with white-Arabic copy (e.g. "قصتك تساعد آلاف المشترين" instead of "قصتك بتساعد آلاف المشترين").
- Strengthen the AI Enhance button label:  
  AR: "حسّن صياغتي ✨" • EN: "Polish my writing ✨"
- Voice button tooltip:  
  AR: "سجّل صوتك وسنحوّله نصاً" • EN: "Speak it — we'll transcribe"
- Title suggestion pill:  
  AR: "اقترح لي عنواناً" • EN: "Suggest a title"

## 3. WriteReviewModal — Step 3 (Categories) and Step 4 (Proof)

- Reorder category metrics with short white-Arabic labels: التسليم / الجودة / الالتزام المالي / خدمة العملاء.
- Add a small "+5 نقاط لكل تقييم تفصيلي" / "+5 pts per category rated" hint.
- Step 4: highlight the verified-badge upside above the upload zone:  
  AR: "ارفع إيصال الحجز واحصل على شارة *مشتري موثّق* + مضاعفة النقاط (×2)"  
  EN: "Upload your booking receipt to earn the *Verified Buyer* badge and 2× points"

## 4. Post-submit reviewer loop (success overlay upgrade)

Inside the existing `ReviewSuccessOverlay`:

- Show actual points awarded + streak status pulled from `useBuyerGamification`.
- Add 3 sticky CTAs:
  1. "راجع مطوراً آخر تعاملت معه" / "Review another developer you've dealt with" → opens dev picker.
  2. "ادعُ صديقاً واكسبا معاً 50 نقطة" / "Invite a friend — both earn 50 pts" → copies their referral link.
  3. "شارك مراجعتك" / "Share your review" → reuses existing share sheet.
- Confetti only on `completion_level = 'full'` (already partially there).

## 5. Reviewer Program landing (`/reviewer-program`) — copy + identity refresh

- Rewrite headline AR: "كن صوت السوق. واكسب من ثقتك." • EN: "Be the voice of the market. Earn from your trust."
- Tier names cleaned up (white-Arabic): جديد / نشط / موثوق / خبير / نخبة — matching New / Active / Trusted / Expert / Elite.
- Each tier card lists: required reviews, perks (badge, profile pin, priority moderation, monthly spotlight), and a single example perk illustration.
- Add a "Why we built this" block (3 lines, soft navy card) — calm, professional, no slang.

## 6. Buyer Dashboard reviewer block

Add (or refresh) a "My Reviewer Status" card on `/buyer`:

- Tier badge + progress bar to next tier ("3 مراجعات لتصبح *موثوقاً*" / "3 reviews to become *Trusted*").
- Current streak pill ("🔥 streak 5 days").
- Quick actions: "اكتب مراجعة جديدة" / "Write a new review", "تحقّق من حسابك" / "Verify your account".
- Tiny "Top 12% of reviewers this month" social proof when applicable.

## 7. Notifications & retention nudges

- New notification template after a review is approved:  
  AR: "تمت الموافقة على مراجعتك — شاهدها {N} مشتري بالفعل"  
  EN: "Your review is live — already seen by {N} buyers"
- Weekly digest (use existing follow/notification infra; no schema change):  
  AR: "هذا الأسبوع: مراجعتك ساعدت {N} مشتري في اتخاذ قرارهم"  
  EN: "This week: your reviews helped {N} buyers decide"
- Re-engagement after 30 days of inactivity for users with ≥1 review:  
  AR: "افتقدناك — أكمل تجربتك في *{developer}* بمراجعة سريعة"  
  EN: "We miss you — finish your experience at *{developer}* with a quick review"

## 8. Referral hook inside the review flow

- After a successful submit, the second CTA ("Invite a friend") deep-links to the existing referral system.
- Reuse `R8-XXXXXX` codes; copy refresh:  
  AR: "ادعُ صديقاً يكتب مراجعته الأولى — تكسبان 50 نقطة لكل واحد"  
  EN: "Invite a friend to write their first review — you both earn 50 pts"

## 9. i18n cleanup pass (white-Arabic across the review system)

Single pass on `src/i18n/locales/ar.json` for all keys under `form.*`, `review.*`, `reviewer.*`, `gamification.*`:

- Remove ammiya particles (هنكتب → سنكتب, هتساعد → ستساعد, اللي → التي/الذي, عشان → لكي, كمان → أيضاً, ده → هذا) **without** turning it into heavy فصحى.
- Keep contractions short and friendly: "شكراً لك"، "رأيك مهم"، "تابع"، "ابدأ"، "حسّن صياغتي".
- Mirror tone in `en.json`: warm, confident, no exclamation spam — at most one per CTA.

## 10. Visual identity polish

- All new chips, banners, and tier badges use the existing palette: navy `#0a3d62`, gold `#fac417`, red `#ed1b40`, plus the soft sentiment tokens defined for chips.
- Use `ms-/pe-/text-start` exclusively (no left/right physical classes).
- All new touch targets ≥ 44px; banner padding `p-3`, chips `min-h-[32px]` with comfortable horizontal padding.

## What we are NOT changing

- `saveRatingOnly`, `savePhase2`, `savePhase3`, `handleDone` — untouched.
- Supabase schema, RLS, edge functions — untouched.
- Draft resume overlay, AI moderation pipeline (`review-integrity-check`), guest flow — untouched.
- Existing motivator card and step structure stay; we only insert new blocks and rewrite copy.

## Files we will edit

- `src/components/WriteReviewModal.tsx` — chips constant, social impact banner, prepopulation helper, copy refresh on Steps 2–4.
- `src/components/ReviewSuccessOverlay.tsx` (or equivalent) — points/streak readout + 3-CTA loop.
- `src/pages/ReviewerProgram.tsx` — headline, tier cards, "why" block.
- `src/pages/BuyerDashboard.tsx` — reviewer status card.
- `src/i18n/locales/ar.json` and `src/i18n/locales/en.json` — full white-Arabic + warm-EN pass on review-related keys, plus new keys for chips, banner, success CTAs, notifications.
- (Optional, light) `src/components/ReviewerBadge.tsx` — tier label strings only.

## Open questions before we build

1. Should the **referral** CTA in the success overlay open the existing referral page, or copy the link inline with a toast? (Default: copy inline, with a "Open referral page" link below.)
2. For the **weekly digest** notification, do you want it sent through the existing in-app notifications only, or also via email when an email is on file? (Default: in-app only for now.)
3. Should the Step-1 chips be **localized per language** (AR labels in AR, EN labels in EN), or always Arabic since most reviewers are Egyptian? (Default: localized per language.)
