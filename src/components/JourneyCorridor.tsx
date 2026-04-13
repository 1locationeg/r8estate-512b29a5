import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const COLORS: Record<string, { bg: string; text: string; bar: string; dim: string }> = {
  research: { bg: "bg-journey-research", text: "text-white", bar: "bg-journey-research", dim: "bg-journey-research/12" },
  choose:   { bg: "bg-journey-choose",   text: "text-white", bar: "bg-journey-choose",   dim: "bg-journey-choose/12" },
  finance:  { bg: "bg-journey-finance",  text: "text-white", bar: "bg-journey-finance",  dim: "bg-journey-finance/12" },
  protect:  { bg: "bg-journey-protect",  text: "text-white", bar: "bg-journey-protect",  dim: "bg-journey-protect/12" },
};

export const JourneyCorridor = () => {
  const { t } = useTranslation();
  const [activeZone, setActiveZone] = useState(0); // 1-4, 0 = none
  const [zoneProgress, setZoneProgress] = useState(0); // 0-1
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
        let progress = 0;

        for (let i = 0; i < zones.length; i++) {
          const el = zones[i];
          if (!el) continue;
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (viewMid >= top && viewMid <= bottom) {
            current = i + 1;
            progress = Math.min(1, Math.max(0, (viewMid - top) / (bottom - top)));
            break;
          }
          if (viewMid > bottom) {
            current = i + 1;
            progress = 1;
          }
        }

        setActiveZone(current);
        setZoneProgress(progress);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [getZoneElements]);

  const scrollToZone = (zone: number) => {
    const el = document.querySelector(`[data-zone="${zone}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-[56px] z-20 w-full bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="max-w-[1100px] mx-auto flex items-stretch">
        {JOURNEY_STATIONS.map((station, idx) => {
          const zone = idx + 1;
          const isPast = activeZone > zone;
          const isActive = activeZone === zone;
          const isFuture = activeZone < zone;
          const c = COLORS[station.key];
          const Icon = station.icon;

          return (
            <button
              key={station.key}
              onClick={() => scrollToZone(zone)}
              className={cn(
                "flex-1 flex flex-col items-center py-2 px-1 relative transition-all duration-300 cursor-pointer",
                isActive && "scale-[1.02]"
              )}
            >
              {/* Number / Check */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 mb-0.5",
                isPast ? cn(c.bg, c.text) :
                isActive ? cn(c.bg, c.text, "ring-2 ring-offset-1 ring-offset-background", `ring-${station.colorClass}/30`) :
                cn(c.dim, `text-${station.colorClass}`)
              )}>
                {isPast ? <Check className="w-3 h-3" /> : zone}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[9px] md:text-[10px] font-semibold leading-tight transition-colors duration-300 whitespace-nowrap",
                isActive ? `text-${station.colorClass}` :
                isPast ? "text-foreground" :
                "text-muted-foreground/60"
              )}>
                {t(station.labelKey)}
              </span>

              {/* Progress bar */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-[3px] rounded-full overflow-hidden transition-colors duration-300",
                isPast ? c.bg : isActive ? "bg-muted/30" : "bg-transparent"
              )}>
                {isActive && (
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-200", c.bar)}
                    style={{ width: `${zoneProgress * 100}%` }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
