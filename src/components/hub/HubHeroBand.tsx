import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HubHeroBandProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export const HubHeroBand = ({ search, onSearchChange }: HubHeroBandProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const [stats, setStats] = useState({ total: 0, avg: 0, verifiedPct: 0 });
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const placeholders = isRTL
    ? [
        "جرّب 'أوراسكوم O-West'",
        "ابحث عن 'تأخير تسليم بالم هيلز'",
        "ابحث 'ماونتن فيو'",
      ]
    : [
        "Try 'Orascom O-West'",
        "Search 'Palm Hills delivery delays'",
        "Find 'Mountain View'",
      ];

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % placeholders.length), 3500);
    return () => clearInterval(id);
  }, [placeholders.length]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("rating, is_verified")
        .eq("status", "approved")
        .limit(1000);
      if (!mounted || !data) return;
      const total = data.length;
      const avg = total ? data.reduce((s, r: any) => s + (r.rating || 0), 0) / total : 0;
      const verifiedPct = total ? (data.filter((r: any) => r.is_verified).length / total) * 100 : 0;
      setStats({ total, avg, verifiedPct });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary mb-3">
          <Sparkles className="w-3 h-3" />
          {isRTL ? "مركز المراجعات · منصة الثقة" : "Review Hub · Trust Platform"}
        </div>

        <h1 className="heading-section text-2xl md:text-4xl font-bold text-foreground mb-2 max-w-3xl">
          {isRTL
            ? "اقرأ تجارب المشترين الحقيقيين — قبل أن توقّع."
            : "Read what real buyers say — before you sign."}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-2xl">
          {isRTL
            ? "آلاف المراجعات الموثّقة عن المطورين والمشاريع وشركات الخدمات في مصر."
            : "Thousands of verified reviews on developers, projects and service companies in Egypt."}
        </p>

        {/* KPIs */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
          <KpiPill value={stats.total.toLocaleString()} label={isRTL ? "مراجعة" : "reviews"} />
          <KpiPill value={`${stats.avg.toFixed(1)}★`} label={isRTL ? "متوسط التقييم" : "avg rating"} />
          <KpiPill value={`${Math.round(stats.verifiedPct)}%`} label={isRTL ? "موثّق" : "verified"} />
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholders[placeholderIdx]}
            className="w-full h-12 md:h-14 ps-12 pe-4 rounded-2xl border border-border bg-background shadow-sm text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>
      </div>
    </section>
  );
};

const KpiPill = ({ value, label }: { value: string; label: string }) => (
  <div className="inline-flex items-baseline gap-1.5 rounded-full bg-background/80 backdrop-blur border border-border px-3 py-1.5 shadow-sm">
    <span className="text-sm md:text-base font-bold text-foreground">{value}</span>
    <span className="text-[11px] md:text-xs text-muted-foreground">{label}</span>
  </div>
);