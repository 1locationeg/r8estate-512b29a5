

## Modern Referral & Trust System — Fully Bilingual (AR/EN)

### What Changes

#### 1. `src/i18n/locales/en.json` — Add `referral` namespace
```json
"referral": {
  "headline": "Your contribution makes a difference",
  "subtext": "Share your experience with friends and help them make the right decision",
  "cta": "Invite a Friend",
  "invited": "Invited",
  "verified": "Verified",
  "insightCredits": "Insight Credits",
  "collectiveNote": "Every invite strengthens the community",
  "linkCopied": "Referral link copied!",
  "shareTitle": "Join R8ESTATE",
  "shareDesc": "Join R8ESTATE — the trusted real estate review platform!",
  "shareButton": "Share Invite Link",
  "rewardNote": "Both you and your friend earn Insight Credits when they verify",
  "perReferral": "+50 credits each"
}
```
Update `community.referralNudge` → "Your contribution makes a difference 🎁" and `community.referralNudgeDesc` → "Share your experience and help friends make the right decision".

#### 2. `src/i18n/locales/ar.json` — Add Arabic `referral` namespace
```json
"referral": {
  "headline": "مساهمتك تصنع الفرق",
  "subtext": "شارك خبرتك مع أصدقائك وساعدهم في اتخاذ القرار الصحيح",
  "cta": "دعوة صديق",
  "invited": "تمت الدعوة",
  "verified": "تم التفعيل",
  "insightCredits": "رصيد المعرفة",
  "collectiveNote": "كل دعوة تضيف لمجتمع أقوى",
  "linkCopied": "تم نسخ رابط الدعوة!",
  "shareTitle": "انضم لـ R8ESTATE",
  "shareDesc": "انضم لـ R8ESTATE — منصة التقييم العقاري الموثوقة!",
  "shareButton": "شارك رابط الدعوة",
  "rewardNote": "أنت وصديقك تحصلوا على رصيد معرفة لما يفعّل حسابه",
  "perReferral": "+٥٠ رصيد لكل دعوة"
}
```
Update `community.referralNudge` and `community.referralNudgeDesc` with Arabic equivalents.

#### 3. `src/components/ReferralWidget.tsx` — Full i18n redesign
- Add `useTranslation()` hook
- Replace all hardcoded English strings with `t("referral.*")` keys
- Headline: `t("referral.headline")` — shows Arabic or English based on active language
- Stats labels: `t("referral.invited")`, `t("referral.verified")`, `t("referral.insightCredits")`
- Badge: `t("referral.perReferral")`
- Toast: `t("referral.linkCopied")`
- ShareMenu props: `title={t("referral.shareTitle")}`, `description={t("referral.shareDesc")}`, `label={t("referral.shareButton")}`
- Bottom note: `t("referral.rewardNote")`
- Add collective intelligence tagline: `t("referral.collectiveNote")`
- Visual polish: gradient accent border, Sparkles icon next to headline

#### 4. `src/components/CommunityEngagementNudge.tsx` — Update referral variant
- Change referral config to use new i18n keys:
  - `title`: `t("community.referralNudge")` (already uses this, just updating the fallback and the locale values)
  - `desc`: `t("community.referralNudgeDesc")`
  - `cta`: `t("referral.cta")`

#### 5. `src/index.css` — Add Cairo as preferred Arabic font
- Update Arabic font rule to: `font-family: 'Cairo', 'Almarai', 'Tajawal', sans-serif;`

#### 6. `index.html` — Import Cairo font
- Add Google Fonts `<link>` for Cairo (weights 400, 600, 700) alongside existing font preconnects

### No database changes needed
The existing `referrals` table and logic remain unchanged. "Insight Credits" is a UI-only rename of points.

