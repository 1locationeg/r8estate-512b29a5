import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS } from "@/lib/journeyStations";
import { useCorridorEngagement } from "@/hooks/useCorridorEngagement";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, X, Search, GitCompare, Banknote, Shield } from "lucide-react";

const STATION_COLORS = [
  "hsl(var(--journey-research))",
  "hsl(var(--journey-choose))",
  "hsl(var(--journey-finance))",
  "hsl(var(--journey-protect))",
];

const STATION_ICONS = [Search, GitCompare, Banknote, Shield];

const STATION_TIPS: Record<number, string[]> = {
  1: ["Search for a developer or project", "Click a suggestion", "Try AI assistant"],
  2: ["View a company profile", "Open the comparison tool", "Check a spotlight card"],
  3: ["Explore a deal or launch", "View pricing plans", "Read 'How We Work'"],
  4: ["Visit the community", "Submit feedback", "Write a review"],
};

const STATION_HINTS: Record<number, string> = {
  1: "Search & explore developers",
  2: "Compare & shortlist options",
  3: "Review deals & financing",
  4: "Join community & protect",
};

export const JourneyCorridor = () => {
  const { t } = useTranslation();
  const { zoneEngagement } = useCorridorEngagement();
  const [activeZone, setActiveZone] = useState(0);
  const [zoneScrollProgress, setZoneScrollProgress] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const getZoneElements = useCallback(() => {
    return [1, 2, 3, 4].map(z => document.querySelector(`[data-zone="${z}"]`) as HTMLElement | null);
  }, []);

  // Close breakdown on outside click
  useEffect(() => {
    if (!showBreakdown) return;
    const handler = (e: MouseEvent) => {
      if (breakdownRef.current && !breakdownRef.current.contains(e.target as Node)) {
        setShowBreakdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBreakdown]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const zones = getZoneElements();
        const viewMid = window.scrollY + window.innerHeight * 0.4;
        let current = 0;
        const progArr: [number, number, number, number] = [0, 0, 0, 0];

        for (let i = 0; i < zones.length; i++) {
          const el = zones[i];
          if (!el) continue;
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (viewMid >= top) {
            if (viewMid <= bottom) {
              current = i + 1;
              progArr[i] = Math.min(1, Math.max(0, (viewMid - top) / (bottom - top)));
            } else {
              progArr[i] = 1;
              current = i + 1;
            }
          }
        }

        setActiveZone(current);
        setZoneScrollProgress(progArr);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, [getZoneElements]);

  const combinedZone = useMemo(() => {
    return zoneScrollProgress.map((sp, i) =>
      Math.min(1, sp * 0.5 + zoneEngagement[i] * 0.5)
    ) as [number, number, number, number];
  }, [zoneScrollProgress, zoneEngagement]);

  const overallProgress = useMemo(() => {
    const total = combinedZone.reduce((a, b) => a + b, 0);
    return Math.round((total / 4) * 100);
  }, [combinedZone]);

  const scrollToZone = (zone: number) => {
    const el = document.querySelector(`[data-zone="${zone}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStationClick = (zone: number) => {
    scrollToZone(zone);
    setShowBreakdown(false);
  };

  const nextIncomplete = useMemo(() => {
    for (let i = 0; i < 4; i++) {
      if (combinedZone[i] < 1) return i + 1;
    }
    return null;
  }, [combinedZone]);

  return (
    <div className="sticky top-[56px] z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1100px] mx-auto px-3 md:px-4">
        {/* Single compact row */}
        <div className="flex items-center gap-2 py-1.5 md:py-2">
          {/* Left: percentage ring */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="relative w-[28px] h-[28px] md:w-[32px] md:h-[32px] cursor-pointer hover:scale-110 transition-transform"
              aria-label="View journey progress breakdown"
            >
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
                    <stop offset="50%" stopColor="hsl(45, 93%, 47%)" />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" />
                  </linearGradient>
                </defs>
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${overallProgress * 0.9425} 94.25`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-foreground tabular-nums">
                {overallProgress}%
              </span>
            </button>

            {/* Breakdown popover */}
            {showBreakdown && (
              <div
                ref={breakdownRef}
                className="absolute top-full left-0 mt-2 w-[280px] md:w-[320px] bg-card border border-border rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">Your Journey Progress</h3>
                  <button onClick={() => setShowBreakdown(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Overall bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Overall</span>
                    <span className="font-bold text-foreground">{overallProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Per-station breakdown */}
                <div className="space-y-3">
                  {JOURNEY_STATIONS.map((station, idx) => {
                    const pct = Math.round(combinedZone[idx] * 100);
                    const Icon = STATION_ICONS[idx];
                    const isComplete = pct >= 100;
                    const tips = STATION_TIPS[idx + 1];

                    return (
                      <div key={station.key}>
                        <button
                          onClick={() => { handleStationClick(idx + 1); setShowBreakdown(false); }}
                          className="w-full text-start group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `color-mix(in srgb, ${STATION_COLORS[idx]} 15%, transparent)` }}
                            >
                              {isComplete
                                ? <Check className="w-3 h-3" style={{ color: STATION_COLORS[idx] }} />
                                : <Icon className="w-3 h-3" style={{ color: STATION_COLORS[idx] }} />
                              }
                            </div>
                            <span className="text-xs font-semibold text-foreground flex-1 group-hover:underline">
                              {t(station.labelKey)}
                            </span>
                            <span
                              className="text-[10px] font-bold tabular-nums"
                              style={{ color: STATION_COLORS[idx] }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="ml-7">
                            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: STATION_COLORS[idx],
                                }}
                              />
                            </div>
                          </div>
                        </button>

                        {!isComplete && (
                          <div className="ml-7 mt-1 space-y-0.5">
                            {tips.map((tip, tIdx) => (
                              <div key={tIdx} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                                {tip}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  {overallProgress >= 100 ? (
                    <p className="text-xs text-center font-semibold text-primary">
                      🎉 Journey complete! You've explored everything.
                    </p>
                  ) : (
                    <p className="text-[10px] text-center text-muted-foreground">
                      Explore each section to unlock your full journey. Progress is saved automatically.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center: station track */}
          <div className="flex-1 flex items-center">
            {JOURNEY_STATIONS.map((station, idx) => {
              const zone = idx + 1;
              const isPast = activeZone > zone;
              const isActive = activeZone === zone;
              const color = STATION_COLORS[idx];

              return (
                <div key={station.key} className="flex-1 flex flex-col items-center relative">
                  {/* Connecting line with gradient */}
                  {idx > 0 && (
                    <div className="absolute top-[12px] md:top-[14px] right-1/2 w-full h-[3px] -z-[1]">
                      <div
                        className="w-full h-full rounded-full overflow-hidden"
                        style={{
                          background: `linear-gradient(to right, ${STATION_COLORS[idx - 1]}20, ${color}20)`,
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${combinedZone[idx - 1] * 100}%`,
                            background: `linear-gradient(to right, ${STATION_COLORS[idx - 1]}, ${color})`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleStationClick(zone)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer group min-w-[44px] min-h-[44px] justify-center relative"
                  >
                    {/* Station dot — bigger, colored */}
                    <div
                      className={cn(
                        "w-[24px] h-[24px] md:w-[28px] md:h-[28px] rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black transition-all duration-300 border-2",
                      )}
                      style={{
                        backgroundColor: isPast || isActive
                          ? color
                          : `color-mix(in srgb, ${color} 12%, hsl(var(--background)))`,
                        borderColor: isPast || isActive
                          ? color
                          : `color-mix(in srgb, ${color} 30%, transparent)`,
                        color: isPast || isActive ? "white" : color,
                        boxShadow: isActive ? `0 0 12px ${color}, 0 0 4px ${color}` : "none",
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {isPast ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : zone}
                    </div>

                    {/* Pulsing ring on active */}
                    {isActive && (
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[24px] h-[24px] md:w-[28px] md:h-[28px] rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: color }}
                      />
                    )}

                    {/* Active underline accent */}
                    {isActive && (
                      <div
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )}

                    {/* Label — always colored per station */}
                    <span
                      className={cn(
                        "text-[10px] md:text-[11px] font-bold leading-tight whitespace-nowrap transition-all duration-300",
                        isPast ? "opacity-70" : isActive ? "opacity-100" : "opacity-50",
                      )}
                      style={{ color }}
                    >
                      {t(station.labelKey)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Persistent context strip — visible when user is in any zone */}
        {activeZone > 0 && (
          <div className="pb-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
            <div
              className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-md text-[9px] md:text-[10px]"
              style={{
                backgroundColor: `color-mix(in srgb, ${STATION_COLORS[activeZone - 1]} 10%, transparent)`,
                color: STATION_COLORS[activeZone - 1],
              }}
            >
              <span className="font-semibold flex items-center gap-1.5 min-w-0">
                <span className="flex-shrink-0">📍</span>
                <span className="truncate">
                  Step {activeZone}/4 · {t(JOURNEY_STATIONS[activeZone - 1].labelKey)}
                  <span className="text-muted-foreground font-normal mx-1">—</span>
                  <span className="font-normal opacity-80">{STATION_HINTS[activeZone]}</span>
                </span>
              </span>
              {nextIncomplete && nextIncomplete !== activeZone && (
                <button
                  onClick={() => scrollToZone(nextIncomplete)}
                  className="flex items-center gap-0.5 font-bold hover:underline flex-shrink-0"
                  style={{ color: STATION_COLORS[nextIncomplete - 1] }}
                >
                  Next: {t(JOURNEY_STATIONS[nextIncomplete - 1].labelKey)}
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
