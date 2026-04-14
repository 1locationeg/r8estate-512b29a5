import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Building2, Wallet, ShieldCheck, ChevronUp, X, ArrowRight, Shield, Lock, BadgeCheck, Eye, UserCheck, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const LaunchWatchWidget = lazy(() =>
  import("@/components/LaunchWatchWidget").then(m => ({ default: m.LaunchWatchWidget }))
);
const DealWatchWidget = lazy(() =>
  import("@/components/DealWatchWidget").then(m => ({ default: m.DealWatchWidget }))
);
const CommunityHighlights = lazy(() =>
  import("@/components/CommunityHighlights").then(m => ({ default: m.CommunityHighlights }))
);

interface StationData {
  key: string;
  step: number;
  icon: LucideIcon;
  color: string;
  hslVar: string;
  route: string;
  hookLabelKey: string;
}

const STATIONS: StationData[] = [
  { key: "research", step: 1, icon: Search, color: "journey-research", hslVar: "var(--journey-research)", route: "/categories", hookLabelKey: "journeyScroll.research.hook" },
  { key: "choose", step: 2, icon: Building2, color: "journey-choose", hslVar: "var(--journey-choose)", route: "/launch-watch", hookLabelKey: "journeyScroll.choose.hook" },
  { key: "finance", step: 3, icon: Wallet, color: "journey-finance", hslVar: "var(--journey-finance)", route: "/deal-watch", hookLabelKey: "journeyScroll.finance.hook" },
  { key: "protect", step: 4, icon: ShieldCheck, color: "journey-protect", hslVar: "var(--journey-protect)", route: "/auth", hookLabelKey: "journeyScroll.protect.hook" },
];

/* ─── Testimonials ─── */
import testimonialOmar from "@/assets/testimonial-omar.jpg";
import testimonialSara from "@/assets/testimonial-sara.jpg";
import testimonialMohamed from "@/assets/testimonial-mohamed.jpg";
import testimonialNour from "@/assets/testimonial-nour.jpg";
import testimonialHassan from "@/assets/testimonial-hassan.jpg";
import testimonialLayla from "@/assets/testimonial-layla.jpg";
import testimonialYoussef from "@/assets/testimonial-youssef.jpg";

type TestimonialItem = { photo: string; name: string; quote: string; badge: string };

const STATION_TESTIMONIALS: Record<string, TestimonialItem[]> = {
  research: [
    { photo: testimonialOmar, name: "Omar H.", quote: "R8ESTATE exposed a 2.1-rated developer — saved my family's entire savings.", badge: "Saved EGP 1.2M" },
    { photo: testimonialSara, name: "Sara A.", quote: "One search revealed hidden fees no agent ever mentioned — crisis averted.", badge: "Saved EGP 850K" },
    { photo: testimonialMohamed, name: "Mohamed K.", quote: "Compared 3 developers in minutes — the trust scores made choosing effortless.", badge: "Smart choice" },
  ],
  choose: [
    { photo: testimonialNour, name: "Nour E.", quote: "Side-by-side comparison showed me the honest developer — best decision of my life.", badge: "Saved EGP 2M" },
    { photo: testimonialHassan, name: "Hassan R.", quote: "Verified reviews helped me choose a builder who actually delivered on time.", badge: "On-time delivery" },
    { photo: testimonialOmar, name: "Omar H.", quote: "I almost picked the cheapest — R8ESTATE showed me why quality matters more.", badge: "Saved EGP 900K" },
  ],
  finance: [
    { photo: testimonialLayla, name: "Layla M.", quote: "Found a payment plan that cut my down payment in half — life-changing.", badge: "50% less upfront" },
    { photo: testimonialYoussef, name: "Youssef T.", quote: "R8ESTATE flagged a deal with hidden interest — saved me from a money trap.", badge: "Saved EGP 600K" },
    { photo: testimonialSara, name: "Sara A.", quote: "Compared financing options across 5 developers — picked the one that fit my budget.", badge: "Best terms" },
  ],
  protect: [
    { photo: testimonialMohamed, name: "Mohamed K.", quote: "The community warned me about a contract clause that could've cost me everything.", badge: "Contract saved" },
    { photo: testimonialNour, name: "Nour E.", quote: "Real buyers shared their delivery horror stories — I avoided the same fate.", badge: "Risk avoided" },
    { photo: testimonialHassan, name: "Hassan R.", quote: "Collective protection gave me leverage I never had alone as a single buyer.", badge: "Protected" },
  ],
};

const StationTrustBlock = ({ stationKey }: { stationKey: string }) => {
  const testimonials = STATION_TESTIMONIALS[stationKey] || STATION_TESTIMONIALS.research;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const t = testimonials[idx];

  return (
    <div className="mt-3 w-full max-w-md mx-auto space-y-2">
      <div className="relative bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2.5 text-start transition-all duration-500 animate-fade-in" key={`${stationKey}-${idx}`}>
        <div className="flex items-center gap-2.5">
          <img src={t.photo} alt={t.name} loading="lazy" width={36} height={36} className="shrink-0 w-9 h-9 rounded-full object-cover border-2 border-primary/30" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-xs font-semibold text-foreground">{t.name}</span>
              <span className="shrink-0 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full truncate max-w-[100px] md:max-w-none md:whitespace-nowrap">{t.badge}</span>
            </div>
            <p className="text-[11px] text-muted-foreground italic truncate">"{t.quote}"</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          {testimonials.map((_, i) => (
            <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === idx ? "bg-primary w-3" : "bg-muted-foreground/30")} />
          ))}
        </div>
      </div>
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center justify-center gap-4">
          {[
            { icon: Shield, tip: "Verified Reviews", color: "text-primary" },
            { icon: Lock, tip: "256-bit Encrypted", color: "text-emerald-500" },
            { icon: BadgeCheck, tip: "Trusted Platform", color: "text-blue-500" },
            { icon: Eye, tip: "Transparent Ratings", color: "text-amber-500" },
            { icon: UserCheck, tip: "Identity Verified", color: "text-violet-500" },
          ].map(({ icon: Icon, tip, color }) => (
            <Tooltip key={tip}>
              <TooltipTrigger asChild>
                <div className={cn("w-6 h-6 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-default", color)}>
                  <Icon className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">{tip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

/* ─── Research Story Section ─── */
const STORIES = [1, 2, 3] as const;

const ResearchStorySection = ({
  onCollapse,
  navigate,
  isRTL,
  t,
  sectionTitle,
}: {
  onCollapse: () => void;
  navigate: ReturnType<typeof useNavigate>;
  isRTL: boolean;
  t: (key: string) => string;
  sectionTitle: (en: string, ar: string) => React.ReactNode;
}) => {
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStoryIndex((s) => (s + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  const activeStory = STORIES[storyIndex];

  return (
    <div className="space-y-3">
      {/* Storytelling wrapper */}
      <div className="relative rounded-2xl border border-journey-research/15 bg-gradient-to-br from-journey-research/8 to-transparent p-4 space-y-3 overflow-hidden">
        {/* Search bar */}
        <HeroSearchBar
          onSelectDeveloper={(id) => { onCollapse(); navigate(`/entity/${id}`); }}
          onSelectItem={(item) => { onCollapse(); navigate(`/entity/${item.id}`); }}
          showResearchHub={true}
        />

        {/* Stats row */}
        <div className="flex items-center justify-center gap-4 py-1">
          <div className="text-center"><span className="text-lg font-black text-foreground">18</span><p className="text-[10px] text-muted-foreground">{isRTL ? "فئة" : "Categories"}</p></div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center"><span className="text-lg font-black text-foreground">70+</span><p className="text-[10px] text-muted-foreground">{isRTL ? "شركة مقيّمة" : "Businesses Rated"}</p></div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center"><span className="text-lg font-black text-foreground">7</span><p className="text-[10px] text-muted-foreground">{isRTL ? "مطور" : "Developers"}</p></div>
        </div>

        {/* Value pill */}
        <div className="flex items-center justify-center">
          <span
            key={`val-${storyIndex}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-journey-research/10 border border-journey-research/20 text-[10px] font-semibold text-journey-research animate-fade-in"
          >
            <BarChart3 className="w-3 h-3" />
            {t(`journeyScroll.research.agentValue${activeStory}`)}
          </span>
        </div>

        {/* Social proof + share */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] text-muted-foreground">{t("journeyScroll.research.agentProof")}</p>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "R8ESTATE", text: t("journeyScroll.research.agentShare"), url: window.location.origin });
              }
            }}
            className="text-[9px] font-medium text-journey-research hover:underline transition-all"
          >
            {t("journeyScroll.research.agentShare")} →
          </button>
        </div>
      </div>

      {sectionTitle("Research Categories", "فئات البحث")}
      <BrowseCategoriesGrid stationFilter="research" />
    </div>
  );
};

/* ─── Expanded Content per Station ─── */
const StationExpandedContent = ({ stationKey, onCollapse }: { stationKey: string; onCollapse: () => void }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const fallback = (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const sectionTitle = (en: string, ar: string) => (
    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-2 px-1">{isRTL ? ar : en}</h3>
  );

  if (stationKey === "research") {
    return (
      <ResearchStorySection
        onCollapse={onCollapse}
        navigate={navigate}
        isRTL={isRTL}
        t={t}
        sectionTitle={sectionTitle}
      />
    );
  }

  if (stationKey === "choose") {
    return (
      <div className="space-y-3">
        <button onClick={() => { onCollapse(); navigate("/directory"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group">
          <div className="w-10 h-10 rounded-full bg-journey-choose/10 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5 text-journey-choose" /></div>
          <div className="text-start flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{isRTL ? "قارن بين المطورين في 30 ثانية" : "Compare developers in 30 seconds"}</p>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "اعثر على الأنسب لك" : "Find the right fit for you"}</p>
          </div>
          <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", isRTL && "rotate-180")} />
        </button>
        {sectionTitle("Choose Categories", "فئات الاختيار")}
        <BrowseCategoriesGrid stationFilter="choose" />
        {sectionTitle("Latest Launches", "أحدث الإطلاقات")}
        <div className="grid grid-cols-2 gap-2">
          <Suspense fallback={fallback}><LaunchWatchWidget /></Suspense>
          <button onClick={() => { onCollapse(); navigate("/insights"); }} className="relative flex flex-col items-center gap-1.5 p-3 pt-4 rounded-xl border ring-1 ring-journey-choose/20 border-journey-choose/40 bg-gradient-to-br from-journey-choose/10 via-journey-choose/5 to-transparent hover:shadow-lg transition-all text-center group overflow-hidden">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-journey-choose" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">AI Insights</span>
              <span className="flex items-center gap-1 bg-journey-choose text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full"><Sparkles className="w-2 h-2" />AI</span>
            </div>
            <span className="text-2xl font-black text-journey-choose">{isRTL ? "تحليل" : "Smart"}</span>
            <span className="text-[10px] text-muted-foreground">{isRTL ? "اتخذ قرارات مبنية على البيانات" : "Data-driven decisions"}</span>
          </button>
        </div>
      </div>
    );
  }

  if (stationKey === "finance") {
    return (
      <div className="space-y-3">
        <button onClick={() => { onCollapse(); navigate("/deal-watch"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group">
          <div className="w-10 h-10 rounded-full bg-journey-finance/10 flex items-center justify-center shrink-0"><Wallet className="w-5 h-5 text-journey-finance" /></div>
          <div className="text-start flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{isRTL ? "قارن خطط السداد — وفّر أكثر" : "Compare payment plans — save more"}</p>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "اعرف الفرق قبل أن توقّع" : "Know the difference before you sign"}</p>
          </div>
          <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", isRTL && "rotate-180")} />
        </button>
        {sectionTitle("Finance & Valuation", "التمويل والتقييم")}
        <BrowseCategoriesGrid stationFilter="finance" />
        {sectionTitle("Active Deals", "العروض النشطة")}
        <Suspense fallback={fallback}><DealWatchWidget /></Suspense>
      </div>
    );
  }

  if (stationKey === "protect") {
    return (
      <div className="space-y-3">
        <button onClick={() => { onCollapse(); navigate("/buyer"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group">
          <div className="w-10 h-10 rounded-full bg-journey-protect/10 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-journey-protect" /></div>
          <div className="text-start flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{isRTL ? "ارفع عقدك — نكشف لك المخاطر" : "Upload your contract — we flag the risks"}</p>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "حماية جماعية للمشترين" : "Collective buyer protection"}</p>
          </div>
          <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", isRTL && "rotate-180")} />
        </button>
        <button onClick={() => { onCollapse(); navigate("/reviews"); }} className="w-full text-center py-2.5 rounded-lg bg-journey-protect/10 text-journey-protect text-xs font-bold hover:bg-journey-protect/20 transition-colors">
          {isRTL ? "شارك تجربتك — احمِ غيرك 🛡️" : "Share your experience — protect others 🛡️"}
        </button>
        {sectionTitle("Legal & Management", "القانون والإدارة")}
        <BrowseCategoriesGrid stationFilter="protect" />
        {sectionTitle("Community Warnings", "تحذيرات المجتمع")}
        <Suspense fallback={fallback}><CommunityHighlights /></Suspense>
      </div>
    );
  }

  return null;
};

/* ─── Compact Hook Button ─── */
const StationCompactHook = ({ station, onExpand }: { station: StationData; onExpand: () => void }) => {
  const { t } = useTranslation();

  if (station.key === "research") {
    return (
      <button onClick={onExpand} className="w-full max-w-sm mx-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all group" style={{ borderColor: `hsl(${station.hslVar} / 0.25)` }}>
        <Search className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" style={{ color: `hsl(${station.hslVar} / 0.6)` }} />
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t("journeyScroll.research.searchPlaceholder", "Search developers, projects...")}</span>
      </button>
    );
  }

  return (
    <button onClick={onExpand} className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg group" style={{ borderColor: `hsl(${station.hslVar})`, color: `hsl(${station.hslVar})`, backgroundColor: `hsl(${station.hslVar} / 0.06)` }}>
      <station.icon className="w-5 h-5" />
      {t(station.hookLabelKey, station.key === "choose" ? "Browse launches" : station.key === "finance" ? "See deals" : "Join community")}
      <ChevronUp className="w-4 h-4 rotate-180 group-hover:translate-y-0.5 transition-transform" />
    </button>
  );
};

/* ─── Single Station Section ─── */
const JourneyStepSection = ({ station, isExpanded, onExpand, onCollapse }: {
  station: StationData;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = station.icon;

  return (
    <section
      id={`journey-section-${station.step - 1}`}
      className="w-full flex items-center justify-center relative overflow-hidden py-6 md:py-8"
      style={{
        background: `linear-gradient(135deg, hsl(${station.hslVar} / 0.06) 0%, hsl(${station.hslVar} / 0.02) 50%, transparent 100%)`,
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none" style={{ background: `radial-gradient(circle, hsl(${station.hslVar}), transparent 70%)` }} />

      <div className="relative z-10 flex flex-col items-center text-center px-2 sm:px-4 w-full max-w-xl mx-auto">
        {/* Step badge */}
        <span className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-2 px-3 py-1 rounded-full border" style={{ color: `hsl(${station.hslVar})`, borderColor: `hsl(${station.hslVar} / 0.3)`, backgroundColor: `hsl(${station.hslVar} / 0.08)` }}>
          {station.step}/{STATIONS.length} · {t(`journeyScroll.${station.key}.title`)}
        </span>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-tight mb-2">
          {t(`journeyScroll.${station.key}.heading`)}
        </h2>

        {/* Icon ring */}
        <div className="relative mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `hsl(${station.hslVar} / 0.12)` }}>
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: `hsl(${station.hslVar})` }} />
          </div>
        </div>

        {/* Collapsed */}
        {!isExpanded && (
          <div className="animate-fade-in mb-4">
            <StationCompactHook station={station} onExpand={onExpand} />
            <p className="text-[11px] text-muted-foreground mt-2 animate-pulse">{t("journeyScroll.tapToExplore", "Tap to explore")}</p>
            <StationTrustBlock stationKey={station.key} />
          </div>
        )}

        {/* Expanded */}
        {isExpanded && (
          <div className="w-full animate-fade-in">
            <div className="flex items-center justify-between mb-3 px-1">
              <button onClick={onCollapse} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />{t("journeyScroll.close", "Close")}
              </button>
              <button onClick={() => navigate(station.route)} className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80" style={{ color: `hsl(${station.hslVar})` }}>
                {t("journeyScroll.goToPage", "Go to full page")}<ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[65dvh] rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 text-start">
              <StationExpandedContent stationKey={station.key} onCollapse={onCollapse} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Mobile Journey Pills ─── */
const STATION_PILL_COLORS = [
  "var(--journey-research)",
  "var(--journey-choose)",
  "var(--journey-finance)",
  "var(--journey-protect)",
];

const MobileJourneyPills = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2" style={{ WebkitOverflowScrolling: "touch" }}>
      {STATIONS.map((station, idx) => {
        const Icon = station.icon;
        return (
          <button
            key={station.key}
            onClick={() => {
              const el = document.getElementById(`journey-section-${idx}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex items-center gap-2 shrink-0 min-h-[44px] rounded-full px-4 py-2 border bg-card/80 backdrop-blur-sm transition-all hover:scale-105"
            style={{
              borderColor: `hsl(${STATION_PILL_COLORS[idx]})`,
              borderLeftWidth: "3px",
            }}
          >
            <Icon className="w-4 h-4 shrink-0" style={{ color: `hsl(${STATION_PILL_COLORS[idx]})` }} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-foreground whitespace-nowrap">
                {station.step}. {t(`journeyScroll.${station.key}.title`)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ─── Exported Component ─── */
export const JourneyScrollSections = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  return (
    <div className="w-full">
      
      {/* Full station sections (both mobile & desktop) */}
      {STATIONS.map((station, idx) => (
        <JourneyStepSection
          key={station.key}
          station={station}
          isExpanded={expandedSection === idx}
          onExpand={() => setExpandedSection(idx)}
          onCollapse={() => setExpandedSection(null)}
        />
      ))}
    </div>
  );
};
