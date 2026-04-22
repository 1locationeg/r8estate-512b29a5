import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";
import { Card } from "@/components/ui/card";
import { Scale, Truck, Wallet, HardHat, Users, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    icon: Scale,
    titleEn: "Legal Standing",
    titleAr: "الوضع القانوني",
    descEn: "Court records, license validity, and regulator standing with NUCA & New Capital authorities.",
    descAr: "السجلات القضائية، صلاحية الترخيص، والوضع لدى الجهات التنظيمية.",
    weight: 25,
  },
  {
    icon: Truck,
    titleEn: "Delivery History",
    titleAr: "سجل التسليم",
    descEn: "On-time delivery rate across past projects, average delay months, and quality at handover.",
    descAr: "معدل التسليم في الموعد، متوسط التأخير، وجودة الاستلام.",
    weight: 25,
  },
  {
    icon: Wallet,
    titleEn: "Financial Strength",
    titleAr: "القوة المالية",
    descEn: "Liquidity ratio, land bank value, and developer-vs-buyer payment risk profile.",
    descAr: "السيولة، قيمة بنك الأراضي، ومخاطر السداد.",
    weight: 20,
  },
  {
    icon: HardHat,
    titleEn: "Construction Progress",
    titleAr: "تقدم البناء",
    descEn: "Live-photo verification, milestone-vs-promise variance, and active site activity score.",
    descAr: "التحقق بالصور المباشرة، مقارنة الإنجاز بالوعود، ونشاط الموقع.",
    weight: 15,
  },
  {
    icon: Users,
    titleEn: "Social Currency",
    titleAr: "السمعة الاجتماعية",
    descEn: "Verified buyer reviews, complaint resolution rate, and community sentiment trend.",
    descAr: "مراجعات المشترين الموثقة، معدل حل الشكاوى، والاتجاه المجتمعي.",
    weight: 15,
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

      <article className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {isRTL ? "كيف نحسب درجة الثقة؟" : "How We Calculate the Trust Score"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "تقرير ألفا — منهجية شفافة من 5 ركائز تحوّل البيانات الخام عن المطورين العقاريين في مصر إلى درجة ثقة من 100."
              : "The Alpha Report — a transparent 5-pillar methodology that transforms raw data on Egyptian real estate developers into a 0-100 Trust Score."}
          </p>
        </header>

        <section aria-label="trust-pillars" className="grid gap-4 md:grid-cols-2">
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
                      <span className="text-xs font-mono text-primary font-bold">{p.weight}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL ? p.descAr : p.descEn}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section aria-label="data-sources" className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "مصادر البيانات" : "Data Sources"}
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ps-2">
            <li>{isRTL ? "السجلات الحكومية (NUCA، الشهر العقاري)" : "Government registries (NUCA, Real Estate Publicity)"}</li>
            <li>{isRTL ? "مراجعات المشترين الموثقة على R8ESTATE" : "Verified buyer reviews on R8ESTATE"}</li>
            <li>{isRTL ? "صور المواقع المباشرة من المتطوعين" : "Live site photos from community volunteers"}</li>
            <li>{isRTL ? "البيانات المالية المعلنة (للشركات المدرجة)" : "Public financial filings (for listed entities)"}</li>
            <li>{isRTL ? "تقارير الإعلام والمحاكم العامة" : "Media reports and public court rulings"}</li>
          </ul>
        </section>

        <section aria-label="freshness" className="bg-muted/40 rounded-lg p-5">
          <h2 className="text-lg font-bold text-foreground mb-2">
            {isRTL ? "التحديث والمراجعة" : "Updates & Auditing"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "تُعاد حسبة الدرجات أسبوعياً. تُراجَع المنهجية كل 6 أشهر بواسطة لجنة مستقلة."
              : "Scores are recomputed weekly. The methodology is audited every 6 months by an independent committee."}
          </p>
        </section>
      </article>
    </StationPageWrapper>
  );
};

export default AboutTrustMeter;
