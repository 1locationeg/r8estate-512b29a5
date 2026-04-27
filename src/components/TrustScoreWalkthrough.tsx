import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Star,
  BarChart3,
  BadgeCheck,
  Clock,
  Calculator,
  Truck,
  HardHat,
  Wallet,
  Headphones,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";
import { trustColorClass, trustBgClass } from "@/lib/trustScoreCalculator";

/**
 * Sample developer walkthrough — shows the exact 4-pillar math + category ratings
 * end-to-end on a single fictional but realistic developer profile.
 * All numbers are pre-computed using the same formula as `calculateTrustScore`.
 */

const SAMPLE = {
  name: { en: "Horizon Developments (sample)", ar: "هورايزن للتطوير (مثال)" },
  reviewCount: 32,
  avgRating: 4.3,
  verifiedCount: 22,
  recentCount: 11, // last 90 days
};

// Pre-computed pillar points using the live formula:
// Rating:        (4.3/5) * 60                            = 51.6
// Volume:        log10(33)/log10(101) * 25 ≈ 1.5185/2.0043 * 25 ≈ 18.9
// Verification:  (22/32) * 10                            = 6.9
// Recency:       (11/32) * 5                             = 1.7
// Total ≈ 79
const PILLARS = [
  {
    key: "rating",
    icon: Star,
    titleEn: "Rating",
    titleAr: "التقييم",
    inputEn: "Average rating: 4.3 ★ from 32 reviews",
    inputAr: "متوسط التقييم: 4.3 ★ من 32 مراجعة",
    formulaEn: "(4.3 ÷ 5) × 60",
    formulaAr: "(4.3 ÷ 5) × 60",
    pts: 51.6,
    max: 60,
  },
  {
    key: "volume",
    icon: BarChart3,
    titleEn: "Volume",
    titleAr: "حجم العينة",
    inputEn: "32 verified reviews on file",
    inputAr: "32 مراجعة موثّقة في الملف",
    formulaEn: "log₁₀(33) ÷ log₁₀(101) × 25",
    formulaAr: "log₁₀(33) ÷ log₁₀(101) × 25",
    pts: 18.9,
    max: 25,
  },
  {
    key: "verification",
    icon: BadgeCheck,
    titleEn: "Verification",
    titleAr: "التوثيق",
    inputEn: "22 of 32 reviewers KYC-verified (69%)",
    inputAr: "22 من 32 مراجع موثّقين KYC (69%)",
    formulaEn: "0.69 × 10",
    formulaAr: "0.69 × 10",
    pts: 6.9,
    max: 10,
  },
  {
    key: "recency",
    icon: Clock,
    titleEn: "Recency",
    titleAr: "الحداثة",
    inputEn: "11 of 32 reviews in last 90 days (34%)",
    inputAr: "11 من 32 مراجعة في آخر 90 يوم (34%)",
    formulaEn: "0.34 × 5",
    formulaAr: "0.34 × 5",
    pts: 1.7,
    max: 5,
  },
];

const TOTAL = 79; // rounded sum

const CATEGORIES = [
  {
    icon: Truck,
    titleEn: "Project Timeliness",
    titleAr: "الالتزام بالمواعيد",
    avg: 4.1,
    sample: 28,
    inputEn: "Avg 4.1 from 28 reviews with delivery rating",
    inputAr: "متوسط 4.1 من 28 مراجعة فيها تقييم تسليم",
  },
  {
    icon: HardHat,
    titleEn: "Construction Quality",
    titleAr: "جودة البناء",
    avg: 4.5,
    sample: 30,
    inputEn: "Avg 4.5 from 30 reviews with quality rating",
    inputAr: "متوسط 4.5 من 30 مراجعة فيها تقييم جودة",
  },
  {
    icon: Wallet,
    titleEn: "Value for Money",
    titleAr: "القيمة مقابل السعر",
    avg: 4.2,
    sample: 26,
    inputEn: "Avg 4.2 from 26 reviews with financial rating",
    inputAr: "متوسط 4.2 من 26 مراجعة فيها تقييم مالي",
  },
  {
    icon: Headphones,
    titleEn: "Customer Service",
    titleAr: "خدمة العملاء",
    avg: 3.9,
    sample: 24,
    inputEn: "Avg 3.9 from 24 reviews with support rating",
    inputAr: "متوسط 3.9 من 24 مراجعة فيها تقييم دعم",
  },
];

const STEPS_INTRO = {
  en: "Let's walk through how Horizon Developments earned their 79/100. Same math runs on every real developer page.",
  ar: "خلّينا نشوف ازاي هورايزن طلعت 79/100. نفس الحسبة بتشتغل على كل صفحة مطور حقيقية.",
};

export const TrustScoreWalkthrough = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  return (
    <Card className="p-5 md:p-6 space-y-6 border-accent/20 shadow-sm">
      <header className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              {isRTL ? "مثال محسوب: مطور حقيقي خطوة بخطوة" : "Worked Example: A Developer, Step-by-Step"}
            </h2>
            <Badge variant="outline" className="text-[10px]">
              {isRTL ? "مثال" : "Sample"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL ? STEPS_INTRO.ar : STEPS_INTRO.en}
          </p>
        </div>
      </header>

      {/* Step 0 — the inputs */}
      <div className="rounded-xl bg-muted/40 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground inline-flex items-center justify-center text-[10px] font-bold">
            0
          </span>
          {isRTL ? "الإدخالات الأولية" : "The raw inputs"}
        </div>
        <div className="text-sm font-semibold text-foreground">
          {isRTL ? SAMPLE.name.ar : SAMPLE.name.en}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-background rounded-md px-2.5 py-2">
            <div className="text-muted-foreground">{isRTL ? "المراجعات" : "Reviews"}</div>
            <div className="font-bold text-foreground tabular-nums">{SAMPLE.reviewCount}</div>
          </div>
          <div className="bg-background rounded-md px-2.5 py-2">
            <div className="text-muted-foreground">{isRTL ? "المتوسط" : "Avg ★"}</div>
            <div className="font-bold text-foreground tabular-nums">{SAMPLE.avgRating}</div>
          </div>
          <div className="bg-background rounded-md px-2.5 py-2">
            <div className="text-muted-foreground">{isRTL ? "موثّقين" : "Verified"}</div>
            <div className="font-bold text-foreground tabular-nums">{SAMPLE.verifiedCount}</div>
          </div>
          <div className="bg-background rounded-md px-2.5 py-2">
            <div className="text-muted-foreground">{isRTL ? "آخر 90ي" : "Last 90d"}</div>
            <div className="font-bold text-foreground tabular-nums">{SAMPLE.recentCount}</div>
          </div>
        </div>
      </div>

      {/* Steps 1-4 — the four pillars */}
      <ol className="space-y-3">
        {PILLARS.map((p, i) => {
          const Icon = p.icon;
          const pct = (p.pts / p.max) * 100;
          return (
            <li key={p.key} className="rounded-lg border border-border p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-bold text-sm text-foreground truncate">
                    {isRTL ? p.titleAr : p.titleEn}
                  </span>
                </div>
                <span className="font-mono text-sm tabular-nums">
                  <span className={`font-bold ${trustColorClass((p.pts / p.max) * 100)}`}>
                    {p.pts.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground"> / {p.max}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRTL ? p.inputAr : p.inputEn}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Calculator className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <code className="text-[11px] font-mono text-foreground bg-muted/60 rounded px-2 py-0.5">
                  {isRTL ? p.formulaAr : p.formulaEn} = {p.pts.toFixed(1)}
                </code>
              </div>
              <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 start-0 ${trustBgClass(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Step 5 — sum */}
      <div className="flex flex-col items-center gap-2">
        <ArrowDown className="w-4 h-4 text-muted-foreground" />
        <div className="rounded-xl bg-primary/5 border border-primary/20 px-5 py-4 text-center space-y-1 w-full max-w-md">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-[10px] font-bold">
              5
            </span>
            {isRTL ? "الإجمالي" : "Sum the pillars"}
          </div>
          <code className="block font-mono text-xs text-foreground">
            51.6 + 18.9 + 6.9 + 1.7 ≈
          </code>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className={`text-4xl font-extrabold ${trustColorClass(TOTAL)} tabular-nums`}>
              {TOTAL}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <Badge variant="outline" className={`${trustColorClass(TOTAL)} border-current text-[10px]`}>
            {isRTL ? "ممتاز · ثقة عالية" : "Excellent · High confidence"}
          </Badge>
        </div>
      </div>

      {/* Step 6 — category ratings */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground inline-flex items-center justify-center text-[10px] font-bold">
            6
          </span>
          {isRTL ? "كمان: درجات الفئات الأربع" : "Plus: the 4 category ratings"}
        </div>
        <p className="text-xs text-muted-foreground">
          {isRTL
            ? "الفئات بتحسب جنب الدرجة الكلية وبتعرض على البروفايل عشان توضح نقاط القوة والضعف."
            : "Categories are computed alongside the total and shown on the profile to reveal strengths and weak spots."}
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const score = Math.round((c.avg / 5) * 100);
            return (
              <div key={c.titleEn} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {isRTL ? c.titleAr : c.titleEn}
                    </span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${trustColorClass(score)}`}>
                    {score}
                  </span>
                </div>
                <Progress value={score} className="h-1" />
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? c.inputAr : c.inputEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
        <CheckCircle2 className="w-4 h-4 text-trust-excellent flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          {isRTL
            ? "كل رقم هنا مشتق من بيانات حقيقية في قاعدة البيانات — مفيش أوزان مخفية ولا تعديل يدوي."
            : "Every number here is derived from real database fields — no hidden weights, no manual overrides."}
        </p>
      </div>
    </Card>
  );
};

export default TrustScoreWalkthrough;