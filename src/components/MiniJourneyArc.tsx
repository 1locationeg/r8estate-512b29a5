import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";

const FILL_MAP: Record<string, string> = {
  research: "bg-journey-research",
  choose: "bg-journey-choose",
  finance: "bg-journey-finance",
  protect: "bg-journey-protect",
};

const RING_MAP: Record<string, string> = {
  research: "ring-journey-research/40",
  choose: "ring-journey-choose/40",
  finance: "ring-journey-finance/40",
  protect: "ring-journey-protect/40",
};

const BORDER_MAP: Record<string, string> = {
  research: "border-journey-research/30",
  choose: "border-journey-choose/30",
  finance: "border-journey-finance/30",
  protect: "border-journey-protect/30",
};

const TEXT_MAP: Record<string, string> = {
  research: "text-journey-research",
  choose: "text-journey-choose",
  finance: "text-journey-finance",
  protect: "text-journey-protect",
};

export const MiniJourneyArc = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentStation = getStationForRoute(pathname);

  return (
    <div className="flex items-center gap-1" role="navigation" aria-label="Journey progress">
      {JOURNEY_STATIONS.map((station, idx) => {
        const isActive = currentStation?.key === station.key;
        const Icon = station.icon;
        return (
          <div key={station.key} className="flex items-center gap-1">
            {idx > 0 && (
              <div className="w-3 h-px bg-border" aria-hidden="true" />
            )}
            <button
              onClick={() => navigate(station.homeRoute)}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
                isActive
                  ? cn(FILL_MAP[station.key], "text-white ring-2", RING_MAP[station.key], "border-transparent")
                  : cn("bg-transparent", BORDER_MAP[station.key], TEXT_MAP[station.key], "opacity-50 hover:opacity-80")
              )}
              title={t(station.labelKey)}
              aria-label={t(station.labelKey)}
              aria-current={isActive ? "step" : undefined}
            >
              <Icon className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
