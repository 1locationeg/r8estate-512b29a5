import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS } from "@/lib/journeyStations";
import { useCorridorEngagement } from "@/hooks/useCorridorEngagement";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

export const JourneyCorridor = () => {
  const { t, i18n } = useTranslation();
  const { zoneEngagement } = useCorridorEngagement();
  const [activeZone, setActiveZone] = useState(0);
  const [zoneScrollProgress, setZoneScrollProgress] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [scrollTargetZone, setScrollTargetZone] = useState<number | null>(null);

  const isRtl = i18n.dir() === "rtl";
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const getZoneElements = useCallback(() => {
    return [1, 2, 3, 4].map((z) => document.querySelector(`[data-zone="${z}"]`) as HTMLElement | null);
  }, []);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const zones = getZoneElements();
        const viewMid = window.scrollY + window.innerHeight * 0.4;
        let current = 0;
        const progress: [number, number, number, number] = [0, 0, 0, 0];

        for (let i = 0; i < zones.length; i++) {
          const el = zones[i];
          if (!el) continue;

          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;

          if (viewMid >= top) {
            if (viewMid <= bottom) {
              current = i + 1;
              progress[i] = Math.min(1, Math.max(0, (viewMid - top) / (bottom - top)));
            } else {
              current = i + 1;
              progress[i] = 1;
            }
          }
        }

        setActiveZone(current);
        setZoneScrollProgress(progress);

        if (scrollTargetZone !== null && current === scrollTargetZone) {
          setScrollTargetZone(null);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [getZoneElements, scrollTargetZone]);

  const combinedZone = useMemo(() => {
    return zoneScrollProgress.map((scrollProgress, index) =>
      Math.min(1, scrollProgress * 0.5 + zoneEngagement[index] * 0.5)
    ) as [number, number, number, number];
  }, [zoneEngagement, zoneScrollProgress]);

  const overallProgress = useMemo(() => {
    const total = combinedZone.reduce((sum, value) => sum + value, 0);
    return Math.round((total / 4) * 100);
  }, [combinedZone]);

  const resolvedZone = activeZone > 0 ? activeZone : 1;
  const currentStation = JOURNEY_STATIONS[resolvedZone - 1];
  const previousStation = resolvedZone > 1 ? JOURNEY_STATIONS[resolvedZone - 2] : null;
  const remainingStations = activeZone === 0 ? JOURNEY_STATIONS : JOURNEY_STATIONS.slice(resolvedZone);
  const nextStation = remainingStations[0] ?? null;
  const pendingTargetStation = scrollTargetZone ? JOURNEY_STATIONS[scrollTargetZone - 1] : null;

  const scrollToZone = (zone: number) => {
    const el = document.querySelector(`[data-zone="${zone}"]`);
    if (!el) return;

    setScrollTargetZone(zone);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-[56px] z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1100px] px-3 md:px-4">
        <div className="flex items-center gap-2 py-1.5 md:py-2">
          <div className="relative h-[28px] w-[28px] flex-shrink-0 md:h-[32px] md:w-[32px]" aria-label={`${overallProgress}% ${t("corridor.complete")}`}>
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress * 0.9425} 94.25`}
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold tabular-nums text-foreground md:text-[9px]">
              {overallProgress}%
            </span>
          </div>

          <div className="flex flex-1 items-center">
            {JOURNEY_STATIONS.map((station, idx) => {
              const zone = idx + 1;
              const isPast = activeZone > zone;
              const isActive = activeZone === zone;
              const isTarget = scrollTargetZone === zone;

              return (
                <div key={station.key} className="relative flex flex-1 flex-col items-center">
                  {idx > 0 && (
                    <div className="absolute right-1/2 top-[10px] -z-[1] h-[2px] w-full md:top-[12px]">
                      <div className="h-full w-full overflow-hidden rounded-full bg-border/30">
                        <div
                          className={cn("h-full rounded-full transition-all duration-300", JOURNEY_STATIONS[idx - 1].bgClass)}
                          style={{ width: `${combinedZone[idx - 1] * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => scrollToZone(zone)}
                    className="flex flex-col items-center gap-0.5"
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 text-[8px] font-black transition-all duration-300 md:h-6 md:w-6 md:text-[9px]",
                        isPast && cn(station.bgClass, "border-transparent text-primary-foreground"),
                        isActive && cn(station.bgClass, "scale-110 border-transparent text-primary-foreground ring-2 ring-ring/20"),
                        !isPast && !isActive && "border-border/50 bg-background text-muted-foreground",
                        isTarget && !isActive && cn(station.bgTintClass, station.textClass, "border-current")
                      )}
                    >
                      {isPast ? <Check className="h-2.5 w-2.5 md:h-3 md:w-3" /> : zone}
                    </div>

                    <span
                      className={cn(
                        "whitespace-nowrap text-[8px] font-bold leading-tight transition-colors duration-300 md:text-[9px]",
                        isActive ? station.textClass : isPast ? "text-muted-foreground" : "text-muted-foreground/50",
                        isTarget && !isActive && station.textClass
                      )}
                    >
                      {t(station.labelKey)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-t border-border/30 py-1.5">
          {previousStation ? (
            <button
              onClick={() => scrollToZone(resolvedZone - 1)}
              className={cn(
                "inline-flex min-w-0 flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium transition-colors md:text-[10px]",
                previousStation.bgTintClass,
                previousStation.textClass
              )}
            >
              <BackIcon className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline">{t("corridor.backTo", { name: t(previousStation.labelKey) })}</span>
            </button>
          ) : (
            <div className="w-6 sm:w-0" />
          )}

          <div className="min-w-0 flex-1">
            <div className="truncate text-[9px] font-semibold text-foreground md:text-[10px]">
              {t("corridor.current", {
                name: activeZone === 0 ? t("corridor.entry") : t(currentStation.labelKey),
              })}
              {activeZone > 0 && (
                <span className="font-normal text-muted-foreground">
                  {` · ${t("corridor.stationOf", { current: resolvedZone, total: 4 })} · ${t("corridor.remaining", {
                    count: remainingStations.length,
                  })}`}
                </span>
              )}
              {activeZone === 0 && (
                <span className="font-normal text-muted-foreground">{` · ${t("corridor.remaining", { count: 4 })}`}</span>
              )}
            </div>

            {(pendingTargetStation || remainingStations.length > 0) && (
              <div className="mt-1 hidden items-center gap-1 md:flex">
                {pendingTargetStation && (
                  <button
                    onClick={() => scrollToZone(scrollTargetZone!)}
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                      pendingTargetStation.bgTintClass,
                      pendingTargetStation.textClass
                    )}
                  >
                    {t("corridor.next", { name: t(pendingTargetStation.labelKey) })}
                  </button>
                )}
                {!pendingTargetStation &&
                  remainingStations.map((station) => (
                    <button
                      key={station.key}
                      onClick={() => scrollToZone(JOURNEY_STATIONS.findIndex((item) => item.key === station.key) + 1)}
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                        station.bgTintClass,
                        station.textClass
                      )}
                    >
                      {t(station.labelKey)}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {nextStation ? (
            <button
              onClick={() => scrollToZone(JOURNEY_STATIONS.findIndex((station) => station.key === nextStation.key) + 1)}
              className={cn(
                "inline-flex min-w-0 flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium transition-colors md:text-[10px]",
                nextStation.bgTintClass,
                nextStation.textClass
              )}
            >
              <span className="hidden sm:inline">{t("corridor.next", { name: t(nextStation.labelKey) })}</span>
              <NextIcon className="h-3 w-3 flex-shrink-0" />
            </button>
          ) : (
            <div className="w-6 sm:w-0" />
          )}
        </div>
      </div>
    </div>
  );
};
