import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, BarChart3, BadgeCheck, Clock, RotateCcw, Sparkles } from "lucide-react";
import { trustColorClass, trustBgClass } from "@/lib/trustScoreCalculator";

/**
 * Interactive Trust Score calculator.
 * Mirrors `calculateTrustScore` in src/lib/trustScoreCalculator.ts:
 *   Rating(60) + Volume(25) + Verification(10) + Recency(5)
 */

const RATING_MAX = 60;
const VOLUME_MAX = 25;
const VERIFICATION_MAX = 10;
const RECENCY_MAX = 5;
const VOLUME_FULL_AT = 100;

interface Inputs {
  avgRating: number;     // 0-5
  reviewCount: number;   // 0-200
  verifiedRatio: number; // 0-1
  recentRatio: number;   // 0-1
}

const DEFAULTS: Inputs = {
  avgRating: 4.2,
  reviewCount: 25,
  verifiedRatio: 0.6,
  recentRatio: 0.4,
};

const PRESETS = [
  { key: "newcomer", inputs: { avgRating: 4.5, reviewCount: 3, verifiedRatio: 1, recentRatio: 1 } },
  { key: "established", inputs: { avgRating: 4.1, reviewCount: 45, verifiedRatio: 0.55, recentRatio: 0.35 } },
  { key: "veteran", inputs: { avgRating: 3.8, reviewCount: 120, verifiedRatio: 0.7, recentRatio: 0.2 } },
  { key: "redflag", inputs: { avgRating: 2.4, reviewCount: 18, verifiedRatio: 0.2, recentRatio: 0.6 } },
];

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export const TrustScoreCalculator = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);

  const result = useMemo(() => {
    const ratingPts = clamp((inputs.avgRating / 5) * RATING_MAX, 0, RATING_MAX);
    const volumePts = clamp(
      (Math.log10(inputs.reviewCount + 1) / Math.log10(VOLUME_FULL_AT + 1)) * VOLUME_MAX,
      0,
      VOLUME_MAX
    );
    const verificationPts = clamp(inputs.verifiedRatio * VERIFICATION_MAX, 0, VERIFICATION_MAX);
    const recencyPts = clamp(inputs.recentRatio * RECENCY_MAX, 0, RECENCY_MAX);
    const total = Math.round(ratingPts + volumePts + verificationPts + recencyPts);
    let confidence: "low" | "medium" | "high" = "low";
    if (inputs.reviewCount >= 20) confidence = "high";
    else if (inputs.reviewCount >= 5) confidence = "medium";
    return { ratingPts, volumePts, verificationPts, recencyPts, total, confidence };
  }, [inputs]);

  const update = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const presetLabel = (key: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      newcomer: { en: "Newcomer", ar: "مطور جديد" },
      established: { en: "Established", ar: "متمكّن" },
      veteran: { en: "Veteran", ar: "خبرة طويلة" },
      redflag: { en: "Red flag", ar: "علامة تحذير" },
    };
    return labels[key]?.[isRTL ? "ar" : "en"] ?? key;
  };

  const confidenceLabel = isRTL
    ? { low: "ثقة منخفضة", medium: "ثقة متوسطة", high: "ثقة عالية" }[result.confidence]
    : { low: "Low confidence", medium: "Medium confidence", high: "High confidence" }[result.confidence];

  const verdict = (() => {
    if (result.total >= 66) return isRTL ? "ممتاز" : "Excellent";
    if (result.total >= 50) return isRTL ? "جيد" : "Good";
    return isRTL ? "مقبول" : "Fair";
  })();

  const pillars = [
    {
      key: "rating",
      icon: Star,
      label: isRTL ? "التقييم" : "Rating",
      pts: result.ratingPts,
      max: RATING_MAX,
      detail: isRTL
        ? `(${inputs.avgRating.toFixed(1)} ÷ 5) × 60`
        : `(${inputs.avgRating.toFixed(1)} ÷ 5) × 60`,
    },
    {
      key: "volume",
      icon: BarChart3,
      label: isRTL ? "حجم العينة" : "Volume",
      pts: result.volumePts,
      max: VOLUME_MAX,
      detail: isRTL
        ? `log(${inputs.reviewCount}+1) ÷ log(101) × 25`
        : `log(${inputs.reviewCount}+1) ÷ log(101) × 25`,
    },
    {
      key: "verification",
      icon: BadgeCheck,
      label: isRTL ? "التوثيق" : "Verification",
      pts: result.verificationPts,
      max: VERIFICATION_MAX,
      detail: `${Math.round(inputs.verifiedRatio * 100)}% × 10`,
    },
    {
      key: "recency",
      icon: Clock,
      label: isRTL ? "الحداثة" : "Recency",
      pts: result.recencyPts,
      max: RECENCY_MAX,
      detail: `${Math.round(inputs.recentRatio * 100)}% × 5`,
    },
  ];

  return (
    <Card className="p-5 md:p-6 space-y-6 border-primary/20 shadow-sm">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              {isRTL ? "احسب درجة الثقة بنفسك" : "Try the Calculator"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRTL
                ? "حرّك المؤشرات لتشوف الدرجة بتتغير لحظياً."
                : "Move the sliders — the score updates instantly."}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInputs(DEFAULTS)}
          className="gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isRTL ? "إعادة" : "Reset"}
        </Button>
      </header>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            variant="outline"
            size="sm"
            onClick={() => setInputs(p.inputs)}
            className="text-xs h-8"
          >
            {presetLabel(p.key)}
          </Button>
        ))}
      </div>

      {/* Big score readout */}
      <div className="flex items-center justify-center gap-4 py-4 bg-muted/30 rounded-xl">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(result.total / 100) * 264} 264`}
              className={`${trustColorClass(result.total)} transition-[stroke-dasharray] duration-300`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${trustColorClass(result.total)} tabular-nums`}>
              {result.total}
            </span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={`text-lg font-bold ${trustColorClass(result.total)}`}>{verdict}</span>
          <Badge variant="outline" className="text-[10px] w-fit">
            {confidenceLabel}
          </Badge>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-primary" />
              {isRTL ? "متوسط التقييم" : "Average rating"}
            </label>
            <span className="font-mono font-bold text-primary tabular-nums">
              {inputs.avgRating.toFixed(1)} ★
            </span>
          </div>
          <Slider
            value={[inputs.avgRating]}
            onValueChange={(v) => update("avgRating", v[0])}
            min={0}
            max={5}
            step={0.1}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              {isRTL ? "عدد المراجعات" : "Review count"}
            </label>
            <span className="font-mono font-bold text-primary tabular-nums">
              {inputs.reviewCount}
            </span>
          </div>
          <Slider
            value={[inputs.reviewCount]}
            onValueChange={(v) => update("reviewCount", v[0])}
            min={0}
            max={200}
            step={1}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              {isRTL ? "نسبة المراجعات الموثّقة" : "Verified reviews ratio"}
            </label>
            <span className="font-mono font-bold text-primary tabular-nums">
              {Math.round(inputs.verifiedRatio * 100)}%
            </span>
          </div>
          <Slider
            value={[inputs.verifiedRatio * 100]}
            onValueChange={(v) => update("verifiedRatio", v[0] / 100)}
            min={0}
            max={100}
            step={1}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {isRTL ? "نسبة آخر 90 يوم" : "Reviews from last 90 days"}
            </label>
            <span className="font-mono font-bold text-primary tabular-nums">
              {Math.round(inputs.recentRatio * 100)}%
            </span>
          </div>
          <Slider
            value={[inputs.recentRatio * 100]}
            onValueChange={(v) => update("recentRatio", v[0] / 100)}
            min={0}
            max={100}
            step={1}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>
      </div>

      {/* Pillar contribution breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isRTL ? "كيف اتحسبت الدرجة؟" : "How the score breaks down"}
        </p>
        {pillars.map((p) => {
          const Icon = p.icon;
          const pct = (p.pts / p.max) * 100;
          return (
            <div key={p.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-foreground font-medium">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  {p.label}
                </span>
                <span className="font-mono tabular-nums">
                  <span className="font-bold text-foreground">{p.pts.toFixed(1)}</span>
                  <span className="text-muted-foreground"> / {p.max}</span>
                </span>
              </div>
              <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 start-0 ${trustBgClass(pct)} transition-[width] duration-300`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <code className="text-[10px] text-muted-foreground font-mono">{p.detail}</code>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TrustScoreCalculator;