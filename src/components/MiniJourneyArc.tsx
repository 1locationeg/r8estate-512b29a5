import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";
import { ChevronRight, ArrowRight } from "lucide-react";

const FILL_MAP: Record<string, string> = {
  research: "bg-journey-research",
  choose: "bg-journey-choose",
  finance: "bg-journey-finance",
  protect: "bg-journey-protect",
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

  return (
    <div className="w-full" role="navigation" aria-label="Journey progress">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase bg-gradient-to-r from-journey-research via-journey-choose to-journey-protect bg-clip-text text-transparent">
          {t("journeyArc.title")}
        </h3>
        <button
          onClick={onStartJourney}
          className="group text-[10px] sm:text-xs font-bold text-white bg-gradient-to-r from-journey-research to-journey-choose hover:from-journey-choose hover:to-journey-finance px-3 py-1 rounded-full transition-all duration-300 flex items-center gap-1 shadow-md hover:shadow-lg hover:scale-105"
        >
          {t("journeyArc.startJourney")}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Stations with arrows */}
      <div className="flex items-start justify-center w-full">
        {JOURNEY_STATIONS.map((station, idx) => {
          const isActive = currentIdx === idx;
          const isPast = currentIdx > idx;
          const Icon = station.icon;

          return (
            <div key={station.key} className="flex items-start">
              {/* Station */}
              <button
                onClick={() => navigate(station.homeRoute)}
                className="flex flex-col items-center gap-1 group min-w-0 flex-shrink-0"
                title={t(station.labelKey)}
                aria-label={t(station.labelKey)}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Circle */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center transition-all duration-300 border-2 border-background shadow-sm",
                      isActive
                        ? cn(FILL_MAP[station.key], "text-white shadow-lg scale-110 ring-4 ring-offset-2 ring-offset-background",
                            station.key === "research" ? "ring-journey-research/30" :
                            station.key === "choose" ? "ring-journey-choose/30" :
                            station.key === "finance" ? "ring-journey-finance/30" :
                            "ring-journey-protect/30")
                        : isPast
                          ? cn(FILL_MAP[station.key], "text-white opacity-75")
                          : cn(TINT_MAP[station.key], TEXT_MAP[station.key], "group-hover:scale-105")
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7",
                      isActive || isPast ? "text-white" : ""
                    )} />
                  </div>
                  {/* Number badge */}
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm",
                      FILL_MAP[station.key]
                    )}
                  >
                    {idx + 1}
                  </span>
                  {/* Active pulse */}
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
                  isActive || isPast ? TEXT_MAP[station.key] : "text-foreground/80"
                )}>
                  {t(station.labelKey)}
                </span>

                {/* Subtitle */}
                <span className="text-[8px] sm:text-[10px] text-muted-foreground/60 leading-tight text-center max-w-[70px] sm:max-w-[90px]">
                  {t(`journeyArc.${station.key}.subtitle`)}
                </span>
              </button>

              {/* Arrow connector between stations */}
              {idx < JOURNEY_STATIONS.length - 1 && (
                <div className="flex items-center self-center mt-2 mx-1 sm:mx-2 md:mx-4">
                  <div className={cn(
                    "flex items-center transition-all duration-500",
                    isPast ? "opacity-90" : "opacity-40"
                  )}>
                    <div className={cn(
                      "w-4 sm:w-6 md:w-10 h-[3px] rounded-full transition-all duration-500",
                      isPast
                        ? `bg-gradient-to-r ${idx === 0 ? 'from-journey-research to-journey-choose' : idx === 1 ? 'from-journey-choose to-journey-finance' : 'from-journey-finance to-journey-protect'}`
                        : "bg-muted-foreground/15"
                    )} />
                    <ChevronRight className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 -ml-1 transition-all duration-300",
                      isPast ? TEXT_MAP[station.key] : "text-muted-foreground/25",
                      isActive && "animate-pulse text-primary"
                    )} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile hint */}
      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 sm:hidden flex items-center justify-center gap-1">
        {t("journeyArc.tapExplore")}
        <ArrowRight className="w-2.5 h-2.5 animate-bounce" style={{ animationDirection: "alternate" }} />
      </p>
    </div>
  );
};
