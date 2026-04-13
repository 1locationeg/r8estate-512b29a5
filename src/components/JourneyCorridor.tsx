import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS } from "@/lib/journeyStations";
import { useCorridorEngagement } from "@/hooks/useCorridorEngagement";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

const STATION_COLORS = [
  "hsl(var(--journey-research))",
  "hsl(var(--journey-choose))",
  "hsl(var(--journey-finance))",
  "hsl(var(--journey-protect))",
];

export const JourneyCorridor = () => {
  const { t } = useTranslation();
  const { zoneEngagement } = useCorridorEngagement();
  const [activeZone, setActiveZone] = useState(0);
  const [zoneScrollProgress, setZoneScrollProgress] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [contextZone, setContextZone] = useState<number | null>(null);
  const contextTimer = useRef<ReturnType<typeof setTimeout>>();
  const rafRef = useRef<number>(0);

  const getZoneElements = useCallback(() => {
    return [1, 2, 3, 4].map(z => document.querySelector(`[data-zone="${z}"]`) as HTMLElement | null);
  }, []);

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
        // Collapse context on scroll
        if (contextZone !== null) {
          setContextZone(null);
          if (contextTimer.current) clearTimeout(contextTimer.current);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, [getZoneElements, contextZone]);

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
    setContextZone(zone);
    if (contextTimer.current) clearTimeout(contextTimer.current);
    contextTimer.current = setTimeout(() => setContextZone(null), 4000);
  };

  // Find next incomplete station
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
          <div className="relative flex-shrink-0 w-[28px] h-[28px] md:w-[32px] md:h-[32px]">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress * 0.9425} 94.25`}
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-foreground tabular-nums">
              {overallProgress}%
            </span>
          </div>

          {/* Center: station track */}
          <div className="flex-1 flex items-center">
            {JOURNEY_STATIONS.map((station, idx) => {
              const zone = idx + 1;
              const isPast = activeZone > zone;
              const isActive = activeZone === zone;
              const isFuture = activeZone < zone;
              const progress = combinedZone[idx];
              const color = STATION_COLORS[idx];

              return (
                <div key={station.key} className="flex-1 flex flex-col items-center relative">
                  {/* Connecting line (before dot, not on first) */}
                  {idx > 0 && (
                    <div className="absolute top-[10px] md:top-[12px] right-1/2 w-full h-[2px] -z-[1]">
                      <div className="w-full h-full bg-border/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${combinedZone[idx - 1] * 100}%`,
                            backgroundColor: STATION_COLORS[idx - 1],
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleStationClick(zone)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer group"
                  >
                    {/* Dot */}
                    <div
                      className={cn(
                        "w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-black transition-all duration-300 border-2",
                        isPast && "text-white border-transparent",
                        isActive && "text-white border-transparent scale-110 shadow-md",
                        isFuture && "bg-background text-muted-foreground border-border/50",
                      )}
                      style={{
                        backgroundColor: isPast || isActive ? color : undefined,
                        boxShadow: isActive ? `0 0 8px ${color}` : undefined,
                      }}
                    >
                      {isPast ? <Check className="w-2.5 h-2.5 md:w-3 md:h-3" /> : zone}
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "text-[8px] md:text-[9px] font-bold leading-tight whitespace-nowrap transition-colors duration-300",
                        isActive ? "text-foreground" : isPast ? "text-muted-foreground" : "text-muted-foreground/50"
                      )}
                      style={{ color: isActive ? color : undefined }}
                    >
                      {t(station.labelKey)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Context strip — shows on station click */}
        {contextZone !== null && (
          <div className="pb-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
            <div
              className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-md text-[9px] md:text-[10px]"
              style={{
                backgroundColor: `color-mix(in srgb, ${STATION_COLORS[contextZone - 1]} 10%, transparent)`,
                color: STATION_COLORS[contextZone - 1],
              }}
            >
              <span className="font-semibold">
                {t("corridor.stationOf", { current: contextZone, total: 4 })} · {t(JOURNEY_STATIONS[contextZone - 1].labelKey)}
                {contextZone < 4 && (
                  <span className="text-muted-foreground font-normal mx-1">
                    · {t("corridor.remaining", { count: 4 - contextZone })}
                  </span>
                )}
              </span>
              {nextIncomplete && nextIncomplete !== contextZone && (
                <button
                  onClick={() => { scrollToZone(nextIncomplete); setContextZone(nextIncomplete); }}
                  className="flex items-center gap-0.5 font-bold hover:underline"
                >
                  {t("corridor.next", { name: t(JOURNEY_STATIONS[nextIncomplete - 1].labelKey) })}
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
