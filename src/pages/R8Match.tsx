import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Building2,
  Wallet,
  Calendar,
  MapPin,
  Star,
  Lock,
  Eye,
  Info,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  runR8Match,
  AREA_OPTIONS,
  UNIT_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
  type MatchBrief,
  type MatchedProject,
} from "@/lib/r8Match";

const PRIORITY_OPTIONS: Array<{
  value: MatchBrief["priority"];
  label: string;
  desc: string;
  icon: typeof Shield;
}> = [
  { value: "trust", label: "Trust", desc: "Verified reputation first", icon: Shield },
  { value: "price", label: "Price", desc: "Best value matters most", icon: Wallet },
  { value: "delivery", label: "Delivery", desc: "On-time handover priority", icon: Calendar },
  { value: "amenities", label: "Amenities", desc: "Lifestyle & quality first", icon: Star },
];

const R8Match = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [searchParams] = useSearchParams();

  // Prefill from query string (Copilot/Choose-station handoff)
  const initialBrief: MatchBrief = useMemo(() => {
    const budgetMin = parseFloat(searchParams.get("budgetMin") || "3");
    const budgetMax = parseFloat(searchParams.get("budgetMax") || "12");
    const areasParam = searchParams.get("areas");
    const unit = searchParams.get("unit") || "any";
    const timeline = searchParams.get("timeline") || "any";
    return {
      budgetMinM: budgetMin,
      budgetMaxM: budgetMax,
      areas: areasParam ? areasParam.split(",").filter(Boolean) : [],
      unitType: unit,
      timeline,
      priority: "trust",
    };
  }, [searchParams]);

  const [brief, setBrief] = useState<MatchBrief>(initialBrief);
  const [submitted, setSubmitted] = useState(searchParams.get("auto") === "1");
  const [results, setResults] = useState<MatchedProject[]>(() =>
    searchParams.get("auto") === "1" ? runR8Match(initialBrief) : []
  );

  const handleRun = () => {
    setResults(runR8Match(brief));
    setSubmitted(true);
    setTimeout(() => {
      document.getElementById("r8-match-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReset = () => {
    setSubmitted(false);
    setResults([]);
    setBrief({
      budgetMinM: 3,
      budgetMaxM: 12,
      areas: [],
      unitType: "any",
      timeline: "any",
      priority: "trust",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleArea = (area: string) => {
    setBrief((b) => ({
      ...b,
      areas: b.areas.includes(area) ? b.areas.filter((a) => a !== area) : [...b.areas, area],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-journey-choose/5">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-journey-choose/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-journey-choose/10 border border-journey-choose/30 text-journey-choose text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            R8 Match · {isRTL ? "ترشيحات بدون إعلانات" : "Zero paid placement"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-3">
            {isRTL ? "أفضل مطور — مش أكتر مطور بيدفع." : "The best performer — not the highest bidder."}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            {isRTL
              ? "قولنا احتياجك. هنرشّحلك أفضل 5 مشاريع — مرتّبة بدرجات الثقة والمراجعات الموثقة وسجل التسليم. مفيش حد يقدر يدفع علشان يطلع في الترشيح."
              : "Tell us what you need. We rank the top 5 projects by trust score, verified reviews, and delivery track record. No developer can pay to be on this list."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-journey-protect" />
              {isRTL ? "خوارزمية شفافة" : "Transparent algorithm"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-3.5 h-3.5 text-journey-research" />
              {isRTL ? "بدون نتائج ممولة" : "No sponsored results"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              {isRTL ? "بيانات موثقة فقط" : "Verified data only"}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Brief form */}
        <Card className="p-5 md:p-7 border-journey-choose/20 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-journey-choose" />
              {isRTL ? "وصفلنا اللي بتدوّر عليه" : "Tell us what you're looking for"}
            </h2>
            {submitted && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                {isRTL ? "ابدأ من جديد" : "Reset"}
              </Button>
            )}
          </div>

          {/* Budget */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                {isRTL ? "الميزانية" : "Budget"}
              </label>
              <span className="text-sm font-bold text-journey-choose">
                EGP {brief.budgetMinM}M – {brief.budgetMaxM}M
              </span>
            </div>
            <Slider
              value={[brief.budgetMinM, brief.budgetMaxM]}
              min={1}
              max={30}
              step={0.5}
              onValueChange={([min, max]) => setBrief((b) => ({ ...b, budgetMinM: min, budgetMaxM: max }))}
              className="my-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1M</span>
              <span>30M</span>
            </div>
          </div>

          {/* Areas */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {isRTL ? "المناطق المفضّلة" : "Preferred areas"}
              <span className="text-[10px] font-normal text-muted-foreground">
                ({isRTL ? "اختر واحد أو أكتر" : "select one or more"})
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map((area) => {
                const active = brief.areas.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      active
                        ? "bg-journey-choose text-white border-journey-choose shadow-md"
                        : "bg-card text-muted-foreground border-border hover:border-journey-choose/50 hover:text-foreground"
                    )}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit type + timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                {isRTL ? "نوع الوحدة" : "Property type"}
              </label>
              <Select value={brief.unitType} onValueChange={(v) => setBrief((b) => ({ ...b, unitType: v }))}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {UNIT_TYPE_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u === "any" ? (isRTL ? "أي نوع" : "Any type") : u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                {isRTL ? "متى تحب تستلم؟" : "Move-in timeline"}
              </label>
              <Select value={brief.timeline} onValueChange={(v) => setBrief((b) => ({ ...b, timeline: v }))}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {TIMELINE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-foreground mb-3 block">
              {isRTL ? "إيه أهم حاجة بالنسبالك؟" : "What matters most to you?"}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((p) => {
                const Icon = p.icon;
                const active = brief.priority === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setBrief((b) => ({ ...b, priority: p.value }))}
                    className={cn(
                      "p-3 rounded-xl border-2 text-start transition-all",
                      active
                        ? "border-journey-choose bg-journey-choose/10 shadow-md"
                        : "border-border bg-card hover:border-journey-choose/40"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mb-1.5", active ? "text-journey-choose" : "text-muted-foreground")} />
                    <p className={cn("text-xs font-bold", active ? "text-journey-choose" : "text-foreground")}>
                      {p.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={handleRun} size="lg" className="w-full bg-journey-choose hover:bg-journey-choose/90 text-white font-bold text-base h-12 shadow-lg">
            <Sparkles className="w-5 h-5 me-2" />
            {isRTL ? "اعرضلي ترشيحاتي" : "Show my trust-ranked shortlist"}
          </Button>
        </Card>

        {/* Results */}
        {submitted && (
          <div id="r8-match-results" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {isRTL ? `أفضل ${results.length} مشاريع ليك` : `Your top ${results.length} matches`}
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="w-3.5 h-3.5" />
                      {isRTL ? "إزاي بنرتّب؟" : "How we rank"}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      {isRTL
                        ? "الترتيب ١٠٠٪ بناءً على درجة الثقة، المراجعات الموثقة، وسجل التسليم. مفيش حد يقدر يدفع علشان يطلع هنا."
                        : "Ranking is 100% based on trust score, verified reviews, and delivery track record. Developers cannot pay to appear here."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {results.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL
                    ? "مفيش مشروع يطابق الفلاتر دي. جرّب توسّع الميزانية أو المناطق."
                    : "No projects match these filters. Try widening your budget or areas."}
                </p>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  {isRTL ? "ابدأ من جديد" : "Start over"}
                </Button>
              </Card>
            ) : (
              results.map((m, idx) => (
                <Card
                  key={m.project.id}
                  className="p-4 md:p-5 border-border/60 hover:border-journey-choose/40 transition-all duration-300 hover:shadow-xl group"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image + rank */}
                    <div className="relative shrink-0 w-full md:w-40 h-32 md:h-32 rounded-xl overflow-hidden bg-muted">
                      {m.project.image && (
                        <img src={m.project.image} alt={m.project.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 start-2 w-8 h-8 rounded-full bg-journey-choose text-white font-black text-sm flex items-center justify-center shadow-lg">
                        #{idx + 1}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-foreground truncate group-hover:text-journey-choose transition-colors">
                            {m.project.name}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {m.developer.name}
                            <span className="mx-1">·</span>
                            <MapPin className="w-3 h-3" />
                            {m.project.location}
                          </p>
                        </div>
                        <div className="text-end shrink-0">
                          <div className="text-2xl font-black text-journey-choose leading-none">{m.score}</div>
                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                            {isRTL ? "نقاط المطابقة" : "Match"}
                          </div>
                        </div>
                      </div>

                      {/* Trust signals */}
                      <div className="grid grid-cols-3 gap-2 my-3">
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-foreground flex items-center justify-center gap-0.5">
                            <Shield className="w-3 h-3 text-journey-protect" />
                            {m.trustPct}
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Trust</div>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-foreground flex items-center justify-center gap-0.5">
                            <TrendingUp className="w-3 h-3 text-journey-choose" />
                            {m.meterPct}
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">R8 Meter</div>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-foreground flex items-center justify-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {m.deliveryPct}%
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Delivery</div>
                        </div>
                      </div>

                      {/* Why this matched */}
                      <div className="mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          {isRTL ? "ليه طلعت ليك؟" : "Why this matched"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.reasons.map((r, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] font-medium">
                              {r}
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-[10px] font-medium border-journey-choose/30 text-journey-choose">
                            {m.project.priceRange}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions — NO contact button (neutrality rule) */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => navigate(`/entity/${m.developer.id}`)}
                        >
                          {isRTL ? "اعرف أكتر" : "View developer"}
                          <ArrowRight className={cn("w-3.5 h-3.5 ms-1", isRTL && "rotate-180")} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => navigate(`/entity/${m.developer.id}#reviews`)}
                        >
                          {isRTL ? "اقرأ المراجعات" : "Read reviews"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {/* Neutrality footer */}
            <Card className="p-4 bg-journey-protect/5 border-journey-protect/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-journey-protect/15 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-journey-protect" />
                </div>
                <div className="text-xs text-foreground/80">
                  <p className="font-bold mb-1">
                    {isRTL ? "وعد الحياد" : "Our neutrality promise"}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {isRTL
                      ? "غيرنا بيوريك مين دفع أكتر. إحنا بنوريك مين سلّم أكتر. الترتيب ده اتعمل بخوارزمية مفتوحة بناءً على بيانات الثقة بس — مفيش مطور قادر يدفع علشان يطلع هنا."
                      : "Other portals show you who paid the most. R8 Match shows you who delivered the most. This list was generated by an open algorithm using only trust data — no developer can pay to appear here."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default R8Match;
