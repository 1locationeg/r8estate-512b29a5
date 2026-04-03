import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";

const FILL: Record<string, string> = {
  research: "bg-journey-research",
  choose: "bg-journey-choose",
  finance: "bg-journey-finance",
  protect: "bg-journey-protect",
};

const TINT: Record<string, string> = {
  research: "bg-journey-research/10",
  choose: "bg-journey-choose/10",
  finance: "bg-journey-finance/10",
  protect: "bg-journey-protect/10",
};

const TEXT: Record<string, string> = {
  research: "text-journey-research",
  choose: "text-journey-choose",
  finance: "text-journey-finance",
  protect: "text-journey-protect",
};

export const SideJourneyRail = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/embed/") ||
    pathname === "/review" ||
    pathname.startsWith("/review/") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  )
    return null;

  const current = getStationForRoute(pathname);
  const currentIdx = current
    ? JOURNEY_STATIONS.findIndex((s) => s.key === current.key)
    : -1;

  return (
    <div
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center hidden min-[360px]:flex",
        isRTL ? "left-1" : "right-1"
      )}
      style={{
        paddingRight: !isRTL ? "env(safe-area-inset-right, 0px)" : undefined,
        paddingLeft: isRTL ? "env(safe-area-inset-left, 0px)" : undefined,
        marginTop: "calc(env(safe-area-inset-top, 0px) / 2)",
      }}
    >
      {JOURNEY_STATIONS.map((station, idx) => {
        const isActive = idx === currentIdx;
        const isPast = idx < currentIdx;
        const isLast = idx === JOURNEY_STATIONS.length - 1;
        const Icon = station.icon;

        return (
          <div key={station.key} className="flex flex-col items-center">
            {/* Station dot — same circle + icon style as homepage MiniJourneyArc */}
            <button
              onClick={() => navigate(station.homeRoute)}
              className="relative"
              aria-label={station.key}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 border-background shadow-sm",
                  isActive
                    ? cn(FILL[station.key], "text-white shadow-lg scale-110 ring-2 ring-offset-1 ring-offset-background",
                        station.key === "research" ? "ring-journey-research/30" :
                        station.key === "choose" ? "ring-journey-choose/30" :
                        station.key === "finance" ? "ring-journey-finance/30" :
                        "ring-journey-protect/30")
                    : isPast
                      ? cn(FILL[station.key], "text-white opacity-75")
                      : cn(TINT[station.key], TEXT[station.key])
                )}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  isActive || isPast ? "text-white" : ""
                )} />
              </div>
              {/* Number badge */}
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm",
                  FILL[station.key]
                )}
              >
                {idx + 1}
              </span>
              {/* Active pulse */}
              {isActive && (
                <div className={cn(
                  "absolute inset-0 rounded-full animate-ping opacity-20",
                  FILL[station.key]
                )} />
              )}
            </button>

            {/* Connecting line */}
            {!isLast && (
              <div
                className={cn(
                  "w-0.5 h-3 transition-colors duration-300",
                  idx < currentIdx ? FILL[station.key] : "bg-muted-foreground/15"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
