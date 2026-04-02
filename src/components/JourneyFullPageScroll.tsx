/* refreshed */
import { useRef, useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Building2, Wallet, ShieldCheck, ChevronUp, X, ArrowRight, Shield, Lock, BadgeCheck, Eye, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

/* ─── Lazy-loaded expanded components ─── */
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
  { key: "research", step: 1, icon: Search,      color: "journey-research", hslVar: "var(--journey-research)", route: "/categories", hookLabelKey: "journeyScroll.research.hook" },
  { key: "choose",   step: 2, icon: Building2,   color: "journey-choose",   hslVar: "var(--journey-choose)",   route: "/launch-watch", hookLabelKey: "journeyScroll.choose.hook" },
  { key: "finance",  step: 3, icon: Wallet,      color: "journey-finance",  hslVar: "var(--journey-finance)",  route: "/deal-watch",   hookLabelKey: "journeyScroll.finance.hook" },
  { key: "protect",  step: 4, icon: ShieldCheck,  color: "journey-protect",  hslVar: "var(--journey-protect)",  route: "/auth",         hookLabelKey: "journeyScroll.protect.hook" },
];

/* ─── Expanded Content per Station (mini-app pattern) ─── */
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
      <div className="space-y-3">
        {/* 1. Hero action */}
        <HeroSearchBar
          onSelectDeveloper={(id) => { onCollapse(); navigate(`/entity/${id}`); }}
          onSelectItem={(item) => { onCollapse(); navigate(`/entity/${item.id}`); }}
        />
        {/* 2. Quick stats */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="text-center">
            <span className="text-lg font-black text-foreground">18</span>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "فئة" : "Categories"}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <span className="text-lg font-black text-foreground">70+</span>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "شركة مقيّمة" : "Businesses Rated"}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <span className="text-lg font-black text-foreground">7</span>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "مطور" : "Developers"}</p>
          </div>
        </div>
        {/* 3. Research categories only */}
        {sectionTitle("Research Categories", "فئات البحث")}
        <BrowseCategoriesGrid stationFilter="research" />
      </div>
    );
  }

  if (stationKey === "choose") {
    return (
      <div className="space-y-3">
        {/* 1. Comparison teaser */}
        <button
          onClick={() => { onCollapse(); navigate("/directory"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-journey-choose/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-journey-choose" />
          </div>
          <div className="text-start flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {isRTL ? "قارن بين المطورين في 30 ثانية" : "Compare developers in 30 seconds"}
            </p>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "اعثر على الأنسب لك" : "Find the right fit for you"}</p>
          </div>
          <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", isRTL && "rotate-180")} />
        </button>

        {/* 2. Choose categories */}
        {sectionTitle("Choose Categories", "فئات الاختيار")}
        <BrowseCategoriesGrid stationFilter="choose" />

        {/* 3. Launch Watch widget */}
        {sectionTitle("Latest Launches", "أحدث الإطلاقات")}
        <Suspense fallback={fallback}>
          <LaunchWatchWidget />
        </Suspense>
      </div>
    );
  }

  if (stationKey === "finance") {
    return (
      <div className="space-y-3">
        {/* 1. Deal calculator teaser */}
        <button
          onClick={() => { onCollapse(); navigate("/deal-watch"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-journey-finance/10 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-journey-finance" />
          </div>
          <div className="text-start flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {isRTL ? "قارن خطط السداد — وفّر أكثر" : "Compare payment plans — save more"}
            </p>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "اعرف الفرق قبل أن توقّع" : "Know the difference before you sign"}</p>
          </div>
          <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", isRTL && "rotate-180")} />
        </button>

        {/* 2. Finance categories */}
        {sectionTitle("Finance & Valuation", "التمويل والتقييم")}
        <BrowseCategoriesGrid stationFilter="finance" />

        {/* 3. Deal Watch widget */}
        {sectionTitle("Active Deals", "العروض النشطة")}
        <Suspense fallback={fallback}>
          <DealWatchWidget />
        </Suspense>
      </div>
    );
  }

  if (stationKey === "protect") {
    return (
      <div className="space-y-3">
        {/* 1. Contract check teaser */}
        <button
          onClick={() => { onCollapse(); navigate("/buyer"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-journey-protect/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-journey-protect" />
          </div>
          <div className="text-start flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {isRTL ? "ارفع عقدك — نكشف لك المخاطر" : "Upload your contract — we flag the risks"}
            </p>
            <p className="text-[10px] text-muted-foreground">{isRTL ? "حماية جماعية للمشترين" : "Collective buyer protection"}</p>
          </div>
          <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", isRTL && "rotate-180")} />
        </button>

        {/* 2. Review CTA */}
        <button
          onClick={() => { onCollapse(); navigate("/reviews"); }}
          className="w-full text-center py-2.5 rounded-lg bg-journey-protect/10 text-journey-protect text-xs font-bold hover:bg-journey-protect/20 transition-colors"
        >
          {isRTL ? "شارك تجربتك — احمِ غيرك 🛡️" : "Share your experience — protect others 🛡️"}
        </button>

        {/* 3. Protect categories */}
        {sectionTitle("Legal & Management", "القانون والإدارة")}
        <BrowseCategoriesGrid stationFilter="protect" />

        {/* 4. Community highlights */}
        {sectionTitle("Community Warnings", "تحذيرات المجتمع")}
        <Suspense fallback={fallback}>
          <CommunityHighlights />
        </Suspense>
      </div>
    );
  }

  return null;
};

/* ─── Station Testimonials + Trust Signals ─── */
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
      {/* Testimonial card */}
      <div className="relative bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2.5 text-start transition-all duration-500 animate-fade-in" key={`${stationKey}-${idx}`}>
        <div className="flex items-center gap-2.5">
          <img src={t.photo} alt={t.name} loading="lazy" width={36} height={36} className="shrink-0 w-9 h-9 rounded-full object-cover border-2 border-primary/30" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-xs font-semibold text-foreground">{t.name}</span>
              <span className="shrink-0 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">{t.badge}</span>
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

      {/* Trust signal icons */}
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


const StationCompactHook = ({
  station,
  onExpand,
}: {
  station: StationData;
  onExpand: () => void;
}) => {
  const { t } = useTranslation();
  const Icon = station.icon;

  if (station.key === "research") {
    return (
      <button
        onClick={onExpand}
        className="w-full max-w-sm mx-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all group"
        style={{ borderColor: `hsl(${station.hslVar} / 0.25)` }}
      >
        <Search className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" style={{ color: `hsl(${station.hslVar} / 0.6)` }} />
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {t("journeyScroll.research.searchPlaceholder", "Search developers, projects...")}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onExpand}
      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg group"
      style={{
        borderColor: `hsl(${station.hslVar})`,
        color: `hsl(${station.hslVar})`,
        backgroundColor: `hsl(${station.hslVar} / 0.06)`,
      }}
    >
      <Icon className="w-5 h-5" />
      {t(station.hookLabelKey, station.key === "choose" ? "Browse launches" : station.key === "finance" ? "See deals" : "Join community")}
      <ChevronUp className="w-4 h-4 rotate-180 group-hover:translate-y-0.5 transition-transform" />
    </button>
  );
};

/* ─── Step Section (collapsed / expanded) ─── */
const JourneyStepSection = ({
  station,
  isActive,
  isExpanded,
  onExpand,
  onCollapse,
  id,
}: {
  station: StationData;
  isActive: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  id: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = station.icon;
  const prefix = `journeyScroll.${station.key}`;

  return (
    <section
      id={id}
      className={cn(
        "w-full flex items-center justify-center relative overflow-hidden transition-all duration-500",
        isExpanded ? "min-h-[100dvh]" : "min-h-[100dvh] snap-start"
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${station.hslVar} / 0.06) 0%, hsl(${station.hslVar} / 0.02) 50%, transparent 100%)`,
      }}
    >
      {/* Decorative circle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: `radial-gradient(circle, hsl(${station.hslVar}), transparent 70%)` }}
      />

      <div className={cn(
        "relative z-10 flex flex-col items-center text-center px-4 w-full max-w-xl mx-auto transition-all duration-500",
        isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-4"
      )}>
        {/* Step badge */}
        <span
          className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-2 px-3 py-1 rounded-full border"
          style={{
            color: `hsl(${station.hslVar})`,
            borderColor: `hsl(${station.hslVar} / 0.3)`,
            backgroundColor: `hsl(${station.hslVar} / 0.08)`,
          }}
        >
          {t(`${prefix}.stepLabel`)}
        </span>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-tight mb-2">
          {t(`${prefix}.heading`)}
        </h2>

        {/* Icon ring */}
        <div className="relative mb-4">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `hsl(${station.hslVar} / 0.12)` }}
          >
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: `hsl(${station.hslVar})` }} />
          </div>
        </div>

        {/* Collapsed: interactive hook */}
        {!isExpanded && (
          <div className="animate-fade-in mb-4">
            <StationCompactHook station={station} onExpand={onExpand} />
            <p className="text-[11px] text-muted-foreground mt-2 animate-pulse">
              {t("journeyScroll.tapToExplore", "Tap to explore")}
            </p>

            {/* Station testimonial + trust signals */}
            {["research", "choose", "finance", "protect"].includes(station.key) && (
              <StationTrustBlock stationKey={station.key} />
            )}
          </div>
        )}

        {/* Expanded: full component */}
        {isExpanded && (
          <div className="w-full animate-fade-in">
            {/* Close bar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                onClick={onCollapse}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                {t("journeyScroll.close", "Close")}
              </button>
              <button
                onClick={() => navigate(station.route)}
                className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: `hsl(${station.hslVar})` }}
              >
                {t("journeyScroll.goToPage", "Go to full page")}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content area */}
            <div className="overflow-y-auto max-h-[65dvh] rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 text-start">
              <StationExpandedContent stationKey={station.key} onCollapse={onCollapse} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Station Ring Navigation ─── */
const StationRingNav = ({
  activeIndex,
  onRingClick,
}: {
  activeIndex: number;
  onRingClick: (idx: number) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
      {STATIONS.map((s, idx) => {
        const isActive = activeIndex === idx;
        const Icon = s.icon;
        const prefix = `journeyScroll.${s.key}`;

        return (
          <div key={s.key} className="flex flex-col items-center">
            {idx > 0 && (
              <div
                className="w-[2px] h-6 sm:h-8 transition-colors duration-500"
                style={{
                  backgroundColor: activeIndex >= idx
                    ? `hsl(${s.hslVar})`
                    : `hsl(${s.hslVar} / 0.15)`,
                }}
              />
            )}
            <button
              onClick={() => onRingClick(idx)}
              aria-label={`${s.step}. ${t(`${prefix}.stepLabel`)}`}
              className={cn(
                "relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-400 group",
                isActive ? "scale-110 shadow-lg" : "opacity-50 hover:opacity-80 hover:scale-105"
              )}
              style={{
                borderColor: `hsl(${s.hslVar})`,
                backgroundColor: isActive ? `hsl(${s.hslVar})` : "hsl(var(--background))",
              }}
            >
              <Icon
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors"
                style={{ color: isActive ? "white" : `hsl(${s.hslVar})` }}
              />
              {isActive && (
                <span
                  className="absolute right-full mr-2 whitespace-nowrap text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md animate-fade-in"
                  style={{ backgroundColor: `hsl(${s.hslVar})`, color: "white" }}
                >
                  {s.step}. {t(`${prefix}.stepLabel`)}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Main Container ─── */
interface Props {
  heroContent: React.ReactNode;
}

export const JourneyFullPageScroll = ({ heroContent }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(-1);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sectionEls = STATIONS.map((_, i) =>
      container.querySelector(`#journey-section-${i}`)
    ).filter(Boolean) as Element[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sectionEls.indexOf(entry.target);
            if (idx !== -1) setActiveSection(idx);
          }
        }
      },
      { root: container, threshold: 0.3 }
    );

    sectionEls.forEach((el) => observer.observe(el));

    const hero = container.querySelector("#journey-hero");
    if (hero) {
      const heroObs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) setActiveSection(-1);
        },
        { root: container, threshold: 0.3 }
      );
      heroObs.observe(hero);
      return () => { observer.disconnect(); heroObs.disconnect(); };
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((idx: number) => {
    const el = containerRef.current?.querySelector(`#journey-section-${idx}`);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleExpand = useCallback((idx: number) => {
    setExpandedSection(idx);
  }, []);

  const handleCollapse = useCallback(() => {
    setExpandedSection(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-[100dvh] overflow-y-auto scrollbar-hide",
        expandedSection === null ? "snap-y snap-mandatory" : ""
      )}
      style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
    >
      <section id="journey-hero" className="min-h-[100dvh] w-full snap-start flex flex-col">
        {heroContent}
      </section>

      {STATIONS.map((station, idx) => (
        <JourneyStepSection
          key={station.key}
          station={station}
          isActive={activeSection === idx}
          isExpanded={expandedSection === idx}
          onExpand={() => handleExpand(idx)}
          onCollapse={handleCollapse}
          id={`journey-section-${idx}`}
        />
      ))}

      <StationRingNav activeIndex={activeSection} onRingClick={scrollToSection} />
    </div>
  );
};
