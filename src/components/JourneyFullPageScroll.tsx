import { useRef, useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Building2, Wallet, ShieldCheck, ChevronUp, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ─── Lazy-loaded expanded components ─── */
const BrowseCategoriesGrid = lazy(() =>
  import("@/components/BrowseCategoriesGrid").then(m => ({ default: m.BrowseCategoriesGrid }))
);
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

/* ─── Expanded Content per Station ─── */
const StationExpandedContent = ({ stationKey }: { stationKey: string }) => {
  const fallback = (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  switch (stationKey) {
    case "research":
      return (
        <Suspense fallback={fallback}>
          <BrowseCategoriesGrid />
        </Suspense>
      );
    case "choose":
      return (
        <Suspense fallback={fallback}>
          <LaunchWatchWidget />
        </Suspense>
      );
    case "finance":
      return (
        <Suspense fallback={fallback}>
          <DealWatchWidget />
        </Suspense>
      );
    case "protect":
      return (
        <Suspense fallback={fallback}>
          <CommunityHighlights />
        </Suspense>
      );
    default:
      return null;
  }
};

/* ─── Compact Hook (clickable interactive element) ─── */
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
              <StationExpandedContent stationKey={station.key} />
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
