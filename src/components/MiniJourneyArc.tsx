import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";
import { ChevronRight, ArrowRight, ShieldCheck, CheckCircle2, Users, Star } from "lucide-react";

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
      {/* Trust Promise Banner */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-journey-protect/10 border border-journey-protect/20">
          <ShieldCheck className="w-3.5 h-3.5 text-journey-protect" />
          <span className="text-[10px] sm:text-xs font-bold text-journey-protect tracking-wide">
            {t("journeyArc.trustPromise")}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase text-foreground/70">
          {t("journeyArc.title")}
        </h3>
        <button
          onClick={onStartJourney}
          className="text-[10px] sm:text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
        >
          {t("journeyArc.startJourney")}
          <ArrowRight className="w-3 h-3" />
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
                  {/* Verified check badge */}
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm",
                      FILL_MAP[station.key]
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
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
                <div className="flex items-center self-center mt-2 mx-0.5 sm:mx-1.5 md:mx-3">
                  <div className={cn(
                    "flex items-center transition-all duration-500",
                    isPast ? "opacity-80" : "opacity-30"
                  )}>
                    <div className={cn(
                      "w-3 sm:w-5 md:w-8 h-[2px] rounded-full",
                      isPast ? FILL_MAP[station.key] : "bg-muted-foreground/20"
                    )} />
                    <ChevronRight className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 -ml-1",
                      isPast ? TEXT_MAP[station.key] : "text-muted-foreground/30",
                      isActive && "animate-pulse"
                    )} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust social proof bar */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 mt-2 py-1.5 px-3 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-journey-research" />
          <span className="text-[9px] sm:text-[11px] font-semibold text-foreground/70">
            {t("journeyArc.proofBuyers")}
          </span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-journey-choose fill-journey-choose" />
          <span className="text-[9px] sm:text-[11px] font-semibold text-foreground/70">
            {t("journeyArc.proofReviews")}
          </span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-journey-protect" />
          <span className="text-[9px] sm:text-[11px] font-semibold text-foreground/70">
            {t("journeyArc.proofProtected")}
          </span>
        </div>
      </div>

      {/* Mobile hint */}
      <p className="text-[8px] text-muted-foreground/50 text-center mt-1.5 sm:hidden flex items-center justify-center gap-1">
        {t("journeyArc.tapExplore")}
        <ArrowRight className="w-2.5 h-2.5 animate-bounce" style={{ animationDirection: "alternate" }} />
      </p>
    </div>
  );
};
