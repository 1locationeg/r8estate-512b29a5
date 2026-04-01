import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Search, Building2, Wallet, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StationData {
  key: string;
  step: number;
  icon: LucideIcon;
  color: string;        // CSS variable name e.g. "journey-research"
  hslVar: string;       // e.g. "var(--journey-research)"
  route: string;
}

const STATIONS: StationData[] = [
  { key: "research", step: 1, icon: Search, color: "journey-research", hslVar: "var(--journey-research)", route: "/categories" },
  { key: "choose", step: 2, icon: Building2, color: "journey-choose", hslVar: "var(--journey-choose)", route: "/launch-watch" },
  { key: "finance", step: 3, icon: Wallet, color: "journey-finance", hslVar: "var(--journey-finance)", route: "/deal-watch" },
  { key: "protect", step: 4, icon: ShieldCheck, color: "journey-protect", hslVar: "var(--journey-protect)", route: "/auth" },
];

/* ─── Reusable Step Section ─── */
const JourneyStepSection = ({
  station,
  isActive,
  id,
}: {
  station: StationData;
  isActive: boolean;
  id: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = station.icon;
  const prefix = `journeyScroll.${station.key}`;

  const bullets = [
    t(`${prefix}.bullet1`),
    t(`${prefix}.bullet2`),
    t(`${prefix}.bullet3`),
    t(`${prefix}.bullet4`),
  ];

  return (
    <section
      id={id}
      className="min-h-[100dvh] w-full snap-start flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${station.hslVar} / 0.06) 0%, hsl(${station.hslVar} / 0.02) 50%, transparent 100%)`,
      }}
    >
      {/* Decorative circle in background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: `radial-gradient(circle, hsl(${station.hslVar}), transparent 70%)` }}
      />

      <div className={cn(
        "relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto transition-all duration-700",
        isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-4"
      )}>
        {/* Step badge */}
        <span
          className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-3 px-3 py-1 rounded-full border"
          style={{
            color: `hsl(${station.hslVar})`,
            borderColor: `hsl(${station.hslVar} / 0.3)`,
            backgroundColor: `hsl(${station.hslVar} / 0.08)`,
          }}
        >
          {t(`${prefix}.stepLabel`)}
        </span>

        {/* Tagline quote */}
        <p className="text-sm text-muted-foreground italic mb-5">
          "{t(`${prefix}.tagline`)}"
        </p>

        {/* Large icon ring with number badge */}
        <div className="relative mb-6">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `hsl(${station.hslVar} / 0.12)` }}
          >
            <Icon className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: `hsl(${station.hslVar})` }} />
          </div>
          {/* Number badge */}
          <span
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
            style={{ backgroundColor: `hsl(${station.hslVar})` }}
          >
            {station.step}
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight mb-3">
          {t(`${prefix}.heading`)}
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
          {t(`${prefix}.description`)}
        </p>

        {/* Bullet points */}
        <ul className="space-y-2.5 mb-8 text-start w-full max-w-sm">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <CheckCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-trust-excellent" style={{ color: "hsl(var(--trust-excellent))" }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          onClick={() => navigate(station.route)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
          style={{ backgroundColor: `hsl(${station.hslVar})` }}
        >
          {t(`${prefix}.cta`)}
        </button>
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
            {/* Connecting line above (skip first) */}
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

            {/* Ring button */}
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

              {/* Tooltip label on active */}
              {isActive && (
                <span
                  className="absolute right-full mr-2 whitespace-nowrap text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md animate-fade-in"
                  style={{
                    backgroundColor: `hsl(${s.hslVar})`,
                    color: "white",
                  }}
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
  const [activeSection, setActiveSection] = useState(-1); // -1 = hero

  // IntersectionObserver to track active station section
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

    // Also observe hero to reset nav
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

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
    >
      {/* Section 1 — Hero (existing content passed in) */}
      <section id="journey-hero" className="min-h-[100dvh] w-full snap-start flex flex-col">
        {heroContent}
      </section>

      {/* Sections 2-5 — Journey Stations */}
      {STATIONS.map((station, idx) => (
        <JourneyStepSection
          key={station.key}
          station={station}
          isActive={activeSection === idx}
          id={`journey-section-${idx}`}
        />
      ))}

      {/* Station Ring Navigation — always visible */}
      <StationRingNav activeIndex={activeSection} onRingClick={scrollToSection} />
    </div>
  );
};
