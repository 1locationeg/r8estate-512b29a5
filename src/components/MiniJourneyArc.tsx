import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

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

      {/* Station strip */}
      <div className="flex items-start justify-between gap-0 sm:gap-1 w-full">
        {JOURNEY_STATIONS.map((station, idx) => {
          const isActive = currentStation?.key === station.key;
          const Icon = station.icon;
          return (
            <div key={station.key} className="flex items-start flex-1 min-w-0">
              {/* Station */}
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
                      "w-12 h-12 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center transition-all duration-300 ring-3",
                      isActive
                        ? cn(FILL_MAP[station.key], "text-white shadow-lg", RING_MAP[station.key])
                        : cn(TINT_MAP[station.key], TEXT_MAP[station.key], RING_MAP[station.key], "group-hover:scale-105")
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7",
                      isActive ? "text-white" : ""
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
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[10px] sm:text-xs font-bold leading-tight",
                  isActive ? TEXT_MAP[station.key] : "text-foreground/80"
                )}>
                  {t(station.labelKey)}
                </span>

                {/* Subtitle */}
                <span className="text-[8px] sm:text-[10px] text-muted-foreground/70 leading-tight text-center max-w-[80px] sm:max-w-[100px]">
                  {t(`journeyArc.${station.key}.subtitle`)}
                </span>
              </button>

              {/* Chevron connector */}
              {idx < JOURNEY_STATIONS.length - 1 && (
                <div className="flex items-center pt-4 sm:pt-5 md:pt-7 px-0">
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/30 shrink-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile hint */}
      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 sm:hidden">
        {t("journeyArc.tapExplore")}
      </p>
    </div>
  );
};
