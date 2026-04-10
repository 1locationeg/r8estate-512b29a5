

## Plan: Rewrite CTA Copy for Clarity, Benefits, and Motivation

### Problem
Current copy is generic ("Start Here", "Smart Tools") — doesn't communicate what's in it for the visitor, doesn't reduce confusion, and doesn't motivate action.

### New Copy Strategy
Shift from **labels** to **benefit-driven micro-stories** that answer "what do I get?" instantly.

### English Copy Changes (`en.json`)

| Key | Current | New |
|-----|---------|-----|
| `startHere.cta` | "Start Here" | "See Who You Can Trust" |
| `startHere.subtitle` | "Your first step to a safe property purchase" | "Read real buyer reviews before you pay a single pound" |
| `smartTools.cta` | "Smart Tools" | "Compare, Track & Protect" |
| `smartTools.subtitle` | "Compare, track & protect like a pro" | "Save money and avoid risky deals in minutes" |
| `smartTools.drawerTitle` | "Your Power Tools" | "Your Deal Protection Kit" |
| `smartTools.drawerDesc` | "Compare deals, track launches & protect your investment" | "Every tool you need to buy smarter and safer" |
| `reviews.cta` | "Check Reviews" | "Read Real Reviews" |
| `reviews.subtitle` | "Is this developer legit?" | "See what actual buyers say before you commit" |
| `compare.cta` | "Compare Now" | "Compare Developers" |
| `compare.subtitle` | "Which one is the best deal?" | "Find the best value — side by side" |
| `launch.cta` | "Track Launches" | "Track New Projects" |
| `launch.subtitle` | "What's new near me?" | "Get early access to launches near you" |
| `contract.cta` | "Protect My Deal" | "Check My Contract" |
| `contract.subtitle` | "Is my contract safe?" | "Spot red flags before you sign" |
| `socialProof` | "2,847 buyers made smarter decisions this week." | "Join 2,847 buyers who avoided bad deals this week" |

### Arabic Copy Changes (`ar.json`)

Matching Arabic translations with the same benefit-driven tone, using Egyptian dialect where appropriate:

| Key | New Arabic |
|-----|-----------|
| `startHere.cta` | "اعرف مين تقدر تثق فيه" |
| `startHere.subtitle` | "اقرأ تقييمات مشترين حقيقيين قبل ما تدفع جنيه" |
| `smartTools.cta` | "قارن، تابع واحمي" |
| `smartTools.subtitle` | "وفّر فلوسك وابعد عن الصفقات الخطر في دقائق" |
| `smartTools.drawerTitle` | "أدوات حماية صفقتك" |
| `smartTools.drawerDesc` | "كل اللي محتاجه تشتري بذكاء وأمان" |
| `reviews.cta` | "اقرأ تقييمات حقيقية" |
| `reviews.subtitle` | "شوف رأي المشترين الحقيقيين قبل ما تلتزم" |
| `compare.cta` | "قارن المطورين" |
| `compare.subtitle` | "اعرف الأفضل — جنب بعض" |
| `launch.cta` | "تابع المشاريع الجديدة" |
| `launch.subtitle` | "اعرف أول واحد عن المشاريع القريبة منك" |
| `contract.cta` | "راجع عقدي" |
| `contract.subtitle` | "اكتشف المشاكل قبل ما توقّع" |
| `socialProof` | "انضم لـ ٢٬٨٤٧ مشتري تجنبوا صفقات سيئة الأسبوع ده" |

### Files to Edit
1. `src/i18n/locales/en.json` — Update all `nextSteps.*` values
2. `src/i18n/locales/ar.json` — Update all `nextSteps.*` values

No component code changes needed — the component already reads from these keys.

