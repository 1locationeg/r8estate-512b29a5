import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, BarChart3, BadgeCheck, Clock, ShieldCheck, Truck, HardHat, Wallet, Headphones } from "lucide-react";
import { TrustScoreCalculator } from "@/components/TrustScoreCalculator";
import { TrustScoreWalkthrough } from "@/components/TrustScoreWalkthrough";

const PILLARS = [
  {
    icon: Star,
    titleEn: "Rating",
    titleAr: "التقييم",
    descEn: "Average star rating from real reviews, scaled to 60 points. This is what reviewers actually said.",
    descAr: "متوسط التقييم بالنجوم من المراجعات الحقيقية، محسوب من 60 نقطة. ده اللي قاله الناس فعلاً.",
    formulaEn: "(avg ÷ 5) × 60",
    formulaAr: "(المتوسط ÷ 5) × 60",
    weight: 60,
  },
  {
    icon: BarChart3,
    titleEn: "Volume",
    titleAr: "حجم العينة",
    descEn: "Sample size on a logarithmic curve — full credit at 100 reviews. Few reviews = lower confidence.",
    descAr: "حجم العينة على منحنى لوغاريتمي — كامل عند 100 مراجعة. مراجعات قليلة = ثقة أقل.",
    formulaEn: "log10(n+1) ÷ log10(101) × 25",
    formulaAr: "log10(ن+1) ÷ log10(101) × 25",
    weight: 25,
  },
  {
    icon: BadgeCheck,
    titleEn: "Verification",
    titleAr: "التوثيق",
    descEn: "Share of reviews from KYC-verified buyers or identity-linked accounts. Higher verified ratio = more trust.",
    descAr: "نسبة المراجعات من مشترين موثقين بالـKYC أو حسابات هويتها متأكدة. كل ما زادت النسبة، زادت الثقة.",
    formulaEn: "(verified ÷ total) × 10",
    formulaAr: "(الموثقة ÷ الكلي) × 10",
    weight: 10,
  },
  {
    icon: Clock,
    titleEn: "Recency",
    titleAr: "حداثة المراجعات",
    descEn: "Share of reviews from the last 90 days. Recent activity signals an actively-monitored developer.",
    descAr: "نسبة المراجعات من آخر 90 يوم. النشاط الحديث معناه إن المطور تحت المراقبة فعلاً.",
    formulaEn: "(last 90d ÷ total) × 5",
    formulaAr: "(آخر 90 يوم ÷ الكلي) × 5",
    weight: 5,
  },
];

const CATEGORIES = [
  {
    icon: Truck,
    titleEn: "Project Timeliness",
    titleAr: "الالتزام بمواعيد التسليم",
    descEn: "Did the developer deliver on time? Aggregated from each reviewer's `delivery` rating.",
    descAr: "هل المطور سلّم في الموعد؟ متجمعة من تقييم كل مراجع لمحور `التسليم`.",
  },
  {
    icon: HardHat,
    titleEn: "Construction Quality",
    titleAr: "جودة البناء",
    descEn: "Finishing, materials, and build quality observed by buyers post-handover.",
    descAr: "التشطيب، الخامات، وجودة البناء بعد الاستلام.",
  },
  {
    icon: Wallet,
    titleEn: "Value for Money",
    titleAr: "القيمة مقابل السعر",
    descEn: "How fair was the price relative to the unit, location, and payment plan offered?",
    descAr: "هل السعر كان عادل مقارنة بالوحدة، الموقع، وخطة السداد؟",
  },
  {
    icon: Headphones,
    titleEn: "Customer Service",
    titleAr: "خدمة العملاء",
    descEn: "Responsiveness of sales, after-sales, and complaint resolution speed.",
    descAr: "سرعة استجابة المبيعات، خدمة ما بعد البيع، وحل الشكاوى.",
  },
];

const AboutTrustMeter = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    document.title = isRTL
      ? "منهجية مقياس الثقة | R8ESTATE Meter"
      : "Trust Meter Methodology | R8ESTATE Meter";
  }, [isRTL]);

  return (
    <StationPageWrapper className="min-h-screen bg-background pb-20">
      <PageHeader
        title={isRTL ? "منهجية مقياس الثقة" : "Trust Meter Methodology"}
        breadcrumbs={[{ label: isRTL ? "حول" : "About" }, { label: isRTL ? "المنهجية" : "Methodology" }]}
      />

      <article className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {isRTL ? "كيف نحسب درجة الثقة؟" : "How We Calculate the Trust Score"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "منهجية شفافة من 4 ركائز تحوّل المراجعات الحقيقية للمشترين إلى درجة ثقة من 100 — نفس المعادلة اللي بتشغّل صفحة كل مطور."
              : "A transparent 4-pillar formula that turns real buyer reviews into a 0-100 Trust Score — the exact same math that powers every developer page."}
          </p>
        </header>

        <section aria-label="formula-summary" className="bg-muted/40 rounded-xl p-5 md:p-6">
          <p className="text-sm font-bold text-foreground mb-3 text-center">
            {isRTL ? "المعادلة الكاملة (الإجمالي = 100)" : "The Full Formula (total = 100)"}
          </p>
          <code className="block text-center font-mono text-xs md:text-sm text-primary leading-relaxed break-words">
            TrustScore = Rating(60) + Volume(25) + Verification(10) + Recency(5)
          </code>
        </section>

        <section aria-label="interactive-calculator">
          <TrustScoreCalculator />
        </section>

        <section aria-label="worked-example">
          <TrustScoreWalkthrough />
        </section>

        <section aria-label="trust-pillars" className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "الركائز الأربع" : "The 4 Pillars"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.titleEn} className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-bold text-foreground">{isRTL ? p.titleAr : p.titleEn}</h2>
                      <span className="text-xs font-mono text-primary font-bold">{p.weight} {isRTL ? "نقطة" : "pts"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL ? p.descAr : p.descEn}
                    </p>
                    <div className="mt-3 space-y-1.5">
                      <Progress value={p.weight} className="h-1.5" />
                      <code className="block font-mono text-[11px] text-muted-foreground">
                        {isRTL ? p.formulaAr : p.formulaEn}
                      </code>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          </div>
        </section>

        <section aria-label="category-breakdown" className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "الفئات الأربع للتقييم" : "The 4 Rating Categories"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "كل مراجع بيقيّم المطور على 4 محاور. لو فيه 5 مراجعات أو أكتر فيها بيانات للمحور، الدرجة بتتحسب من المراجعات الحقيقية. لو لأ، بنحطها كـ«تقدير» بحدود متقطعة."
              : "Each reviewer rates the developer across 4 dimensions. With 5+ reviews containing that dimension, the score is data-backed. Otherwise it's marked as 'Estimated' with a dashed border."}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.titleEn} className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground">
                      {isRTL ? c.titleAr : c.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isRTL ? c.descAr : c.descEn}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section aria-label="confidence" className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "مستويات الثقة في الدرجة" : "Confidence Levels"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4 border-trust-fair/30">
              <div className="text-xs font-mono text-trust-fair font-bold mb-1">{isRTL ? "منخفضة" : "LOW"}</div>
              <p className="text-sm text-foreground font-bold">{isRTL ? "أقل من 5 مراجعات" : "Fewer than 5 reviews"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL ? "الدرجة موجودة بس العينة صغيرة." : "Score is shown but sample is small."}
              </p>
            </Card>
            <Card className="p-4 border-trust-good/30">
              <div className="text-xs font-mono text-trust-good font-bold mb-1">{isRTL ? "متوسطة" : "MEDIUM"}</div>
              <p className="text-sm text-foreground font-bold">{isRTL ? "من 5 إلى 19 مراجعة" : "5–19 reviews"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL ? "الاتجاه واضح، لكن استمر في القراءة." : "Trend is clear, but keep reading reviews."}
              </p>
            </Card>
            <Card className="p-4 border-trust-excellent/30">
              <div className="text-xs font-mono text-trust-excellent font-bold mb-1">{isRTL ? "عالية" : "HIGH"}</div>
              <p className="text-sm text-foreground font-bold">{isRTL ? "20 مراجعة فأكتر" : "20+ reviews"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL ? "عينة قوية وموثوقة." : "Strong, statistically meaningful sample."}
              </p>
            </Card>
          </div>
        </section>

        <section aria-label="data-sources" className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "مصادر البيانات" : "Data Sources"}
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ps-2">
            <li>{isRTL ? "مراجعات المشترين الموثقة على R8ESTATE" : "Verified buyer reviews on R8ESTATE"}</li>
            <li>{isRTL ? "تقييمات الفئات (تسليم، جودة، قيمة، خدمة)" : "Category ratings (delivery, quality, value, service)"}</li>
            <li>{isRTL ? "حالة التوثيق للمراجع (KYC / إيصال / هوية)" : "Reviewer verification status (KYC / receipt / identity)"}</li>
            <li>{isRTL ? "تواريخ المراجعات (نافذة 90 يوم للحداثة)" : "Review timestamps (90-day recency window)"}</li>
          </ul>
        </section>

        <section aria-label="freshness" className="bg-muted/40 rounded-lg p-5">
          <h2 className="text-lg font-bold text-foreground mb-2">
            {isRTL ? "التحديث والمراجعة" : "Updates & Auditing"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "الدرجات بتتحسب لحظياً مع كل مراجعة جديدة. المنهجية بتتراجَع كل 6 شهور للتأكد من إنها لسه عادلة."
              : "Scores recompute live with every new review. The methodology is audited every 6 months to ensure it remains fair."}
          </p>
        </section>
      </article>
    </StationPageWrapper>
  );
};

export default AboutTrustMeter;
