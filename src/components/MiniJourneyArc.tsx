import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const FILL_MAP: Record<string, string> = {
  research: "bg-journey-research",
  choose: "bg-journey-choose",
  finance: "bg-journey-finance",
  protect: "bg-journey-protect",
};

const RING_MAP: Record<string, string> = {
  research: "ring-journey-research/30",
  choose: "ring-journey-choose/30",
  finance: "ring-journey-finance/30",
  protect: "ring-journey-protect/30",
};

const TEXT_MAP: Record<string, string> = {
  research: "text-journey-research",
  choose: "text-journey-choose",
  finance: "text-journey-finance",
  protect: "text-journey-protect",
};

const TINT_MAP: Record<string, string> = {
  research: "bg-journey-research/10",
  choose: "bg-journey-choose/10",
  finance: "bg-journey-finance/10",
  protect: "bg-journey-protect/10",
};

const BADGE_MAP: Record<string, string> = {
  research: "bg-journey-research text-white",
  choose: "bg-journey-choose text-white",
  finance: "bg-journey-finance text-white",
  protect: "bg-journey-protect text-white",
};

interface MiniJourneyArcProps {
  onStartJourney?: () => void;
}

export const MiniJourneyArc = ({ onStartJourney }: MiniJourneyArcProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentStation = getStationForRoute(pathname);
  const currentIdx = currentStation
    ? JOURNEY_STATIONS.findIndex((s) => s.key === currentStation.key)
    : -1;

  const handleStationClick = (homeRoute: string) => {
    navigate(homeRoute);
  };

  return (
    <div className="w-full" role="navigation" aria-label="Journey progress">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase text-foreground/70">
          {t("journeyArc.title")}
        </h3>
        <button
          onClick={onStartJourney}
          className="text-[10px] sm:text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
        >
          {t("journeyArc.startJourney")}
        </button>
      </div>

      {/* Station strip with flowing path */}
      <div className="relative">
        {/* Flowing gradient line behind stations */}
        <div className="absolute top-6 sm:top-7 md:top-9 left-[12%] right-[12%] h-[3px] z-0">
          {/* Background track */}
          <div className="absolute inset-0 bg-muted/40 rounded-full" />
          {/* Animated progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{
              width: currentIdx >= 0
                ? `${(currentIdx / (JOURNEY_STATIONS.length - 1)) * 100}%`
                : "0%",
              background: "linear-gradient(90deg, hsl(var(--journey-research)), hsl(var(--journey-choose)), hsl(var(--journey-finance)), hsl(var(--journey-protect)))",
            }}
          />
          {/* Animated flowing arrows on the track */}
          <div className="absolute inset-0 flex items-center justify-around overflow-hidden">
            {[0, 1, 2].map((i) => (
              <ArrowRight
                key={i}
                className={cn(
                  "w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-pulse",
                  i <= currentIdx - 1
                    ? "text-white/80"
                    : "text-muted-foreground/25"
                )}
                style={{
                  animationDelay: `${i * 400}ms`,
                  animationDuration: "1.8s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Stations */}
        <div className="flex items-start justify-between gap-0 w-full relative z-10">
          {JOURNEY_STATIONS.map((station, idx) => {
            const isActive = currentIdx === idx;
            const isPast = currentIdx > idx;
            const Icon = station.icon;

            return (
              <div key={station.key} className="flex flex-col items-center flex-1 min-w-0">
                <button
                  onClick={() => handleStationClick(station.homeRoute)}
                  className="flex flex-col items-center gap-1 w-full group"
                  title={t(station.labelKey)}
                  aria-label={t(station.labelKey)}
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Circle with ring + numbered badge */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center transition-all duration-300 ring-3 border-2 border-background",
                        isActive
                          ? cn(FILL_MAP[station.key], "text-white shadow-lg scale-110", RING_MAP[station.key])
                          : isPast
                            ? cn(FILL_MAP[station.key], "text-white opacity-80", RING_MAP[station.key])
                            : cn(TINT_MAP[station.key], TEXT_MAP[station.key], RING_MAP[station.key], "group-hover:scale-105")
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7",
                        isActive || isPast ? "text-white" : ""
                      )} />
                    </div>
                    {/* Numbered badge */}
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm",
                        BADGE_MAP[station.key]
                      )}
                    >
                      {idx + 1}
                    </span>
                    {/* Active pulse ring */}
                    {isActive && (
                      <div className={cn(
                        "absolute inset-0 rounded-full animate-ping opacity-20",
                        FILL_MAP[station.key]
                      )} />
                    )}
                  </div>

                  {/* Label */}
                  <span className={cn(
                    "text-[10px] sm:text-xs font-bold leading-tight mt-0.5",
                    isActive ? TEXT_MAP[station.key] : isPast ? TEXT_MAP[station.key] + " opacity-70" : "text-foreground/80"
                  )}>
                    {t(station.labelKey)}
                  </span>

                  {/* Subtitle */}
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground/70 leading-tight text-center max-w-[80px] sm:max-w-[100px]">
                    {t(`journeyArc.${station.key}.subtitle`)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile hint with arrow */}
      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 sm:hidden flex items-center justify-center gap-1">
        {t("journeyArc.tapExplore")}
        <ArrowRight className="w-2.5 h-2.5 animate-bounce" style={{ animationDirection: "alternate" }} />
      </p>
    </div>
  );
};
