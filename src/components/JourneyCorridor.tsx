import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS } from "@/lib/journeyStations";
import { useCorridorEngagement } from "@/hooks/useCorridorEngagement";
import { cn } from "@/lib/utils";
import { Check, Home } from "lucide-react";

// HSL values for background interpolation
const ZONE_COLORS = [
  { h: 203, s: 81, l: 12 }, // entry / pre-zone — dark navy
  { h: 195, s: 70, l: 15 }, // zone 1 research — deep teal
  { h: 35, s: 60, l: 15 },  // zone 2 choose — deep amber
  { h: 215, s: 70, l: 15 }, // zone 3 finance — deep blue
  { h: 152, s: 60, l: 15 }, // zone 4 protect — deep green
];

function lerpHsl(a: typeof ZONE_COLORS[0], b: typeof ZONE_COLORS[0], t: number) {
  const h = a.h + (b.h - a.h) * t;
  const s = a.s + (b.s - a.s) * t;
  const l = a.l + (b.l - a.l) * t;
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

const STATION_ACCENT_COLORS = [
  "hsl(195, 70%, 50%)", // research teal
  "hsl(35, 80%, 55%)",  // choose amber
  "hsl(215, 70%, 55%)", // finance blue
  "hsl(152, 60%, 50%)", // protect green
];

export const JourneyCorridor = () => {
  const { t } = useTranslation();
  const { zoneEngagement } = useCorridorEngagement();
  const [activeZone, setActiveZone] = useState(0);
  const [zoneScrollProgress, setZoneScrollProgress] = useState<[number, number, number, number]>([0, 0, 0, 0]);
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
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, [getZoneElements]);

  // Combined progress per zone (scroll 50% + engagement 50%)
  const combinedZone = useMemo(() => {
    return zoneScrollProgress.map((sp, i) =>
      Math.min(1, sp * 0.5 + zoneEngagement[i] * 0.5)
    ) as [number, number, number, number];
  }, [zoneScrollProgress, zoneEngagement]);

  // Overall progress 0-100
  const overallProgress = useMemo(() => {
    const total = combinedZone.reduce((a, b) => a + b, 0);
    return Math.round((total / 4) * 100);
  }, [combinedZone]);

  // Background color
  const bgColor = useMemo(() => {
    if (activeZone === 0) return lerpHsl(ZONE_COLORS[0], ZONE_COLORS[0], 0);
    const from = ZONE_COLORS[activeZone - 1] || ZONE_COLORS[0];
    const to = ZONE_COLORS[activeZone];
    const progress = zoneScrollProgress[activeZone - 1] || 0;
    return lerpHsl(from, to, progress);
  }, [activeZone, zoneScrollProgress]);

  const scrollToZone = (zone: number) => {
    const el = document.querySelector(`[data-zone="${zone}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="sticky top-[56px] z-20 w-full border-b border-white/[0.06] shadow-lg"
      style={{ backgroundColor: bgColor, transition: "background-color 0.5s ease" }}
    >
      <div className="max-w-[1100px] mx-auto px-3 md:px-4">
        {/* Layer 1 — Header */}
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[10px] md:text-xs text-white/60 font-medium tracking-wide">
            {t("corridor.title")}
          </span>
          <span className="text-[10px] md:text-xs text-white/80 font-bold tabular-nums">
            {overallProgress}% {t("corridor.complete")}
          </span>
        </div>

        {/* Layer 2 — Global progress bar */}
        <div className="w-full h-[3px] rounded-full bg-white/10 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${overallProgress}%`,
              background: "linear-gradient(90deg, hsl(195,70%,50%), hsl(35,80%,55%), hsl(215,70%,55%), hsl(152,60%,50%))",
            }}
          />
        </div>

        {/* Layer 3 — Stations row */}
        <div className="flex items-start gap-0.5 pb-2">
          {/* Entry state */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex flex-col items-center gap-0.5 px-1.5 py-0.5 min-w-[42px] md:min-w-[56px] transition-all"
          >
            <div className={cn(
              "w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center transition-all",
              activeZone >= 1 ? "bg-white/20 text-white/40" : "bg-white/10 text-white/70 ring-1 ring-white/20"
            )}>
              <Home className="w-3 h-3" />
            </div>
            <span className="text-[8px] md:text-[9px] text-white/40 font-medium leading-tight whitespace-nowrap">
              {t("corridor.entry")}
            </span>
          </button>

          {/* 4 Stations */}
          {JOURNEY_STATIONS.map((station, idx) => {
            const zone = idx + 1;
            const isPast = activeZone > zone;
            const isActive = activeZone === zone;
            const isFuture = activeZone < zone;
            const stationProgress = combinedZone[idx];
            const accentColor = STATION_ACCENT_COLORS[idx];

            return (
              <button
                key={station.key}
                onClick={() => scrollToZone(zone)}
                className="flex-1 flex flex-col items-center gap-0.5 py-0.5 relative transition-all cursor-pointer group"
              >
                {/* Number / Check circle */}
                <div
                  className={cn(
                    "w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black transition-all duration-300",
                    isPast && "text-white",
                    isActive && "text-white ring-2 ring-white/30 ring-offset-1 scale-110",
                    isFuture && "bg-white/8 text-white/30",
                  )}
                  style={{
                    backgroundColor: isPast || isActive ? accentColor : undefined,
                  }}
                >
                  {isPast ? <Check className="w-3 h-3" /> : zone}
                </div>

                {/* Name */}
                <span className={cn(
                  "text-[9px] md:text-[10px] font-bold leading-tight whitespace-nowrap transition-colors duration-300",
                  isActive ? "text-white" : isPast ? "text-white/70" : "text-white/30"
                )}>
                  {t(station.labelKey)}
                </span>

                {/* Subtitle */}
                <span className={cn(
                  "text-[7px] md:text-[8px] leading-tight whitespace-nowrap transition-colors duration-300 hidden sm:block",
                  isActive ? "text-white/60" : isPast ? "text-white/40" : "text-white/20"
                )}>
                  {t(`corridor.sub.${station.key}`)}
                </span>

                {/* Per-station progress bar */}
                <div className="w-full h-[2px] rounded-full bg-white/10 mt-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-200"
                    style={{
                      width: `${stationProgress * 100}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
