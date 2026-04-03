import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";

const BG: Record<string, string> = {
  research: "bg-journey-research",
  choose: "bg-journey-choose",
  finance: "bg-journey-finance",
  protect: "bg-journey-protect",
};

const RING: Record<string, string> = {
  research: "ring-journey-research/40",
  choose: "ring-journey-choose/40",
  finance: "ring-journey-finance/40",
  protect: "ring-journey-protect/40",
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

  // Hide on homepage, auth, embed, review (frictionless), forgot/reset password
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
        "fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-0 hidden min-[360px]:flex",
        isRTL ? "right-1.5" : "left-1.5"
      )}
    >
      {JOURNEY_STATIONS.map((station, idx) => {
        const isActive = idx === currentIdx;
        const isPast = idx < currentIdx;
        const isLast = idx === JOURNEY_STATIONS.length - 1;

        return (
          <div key={station.key} className="flex flex-col items-center">
            {/* Dot */}
            <button
              onClick={() => navigate(station.homeRoute)}
              className={cn(
                "rounded-full transition-all duration-300 relative group",
                isActive
                  ? cn("w-3.5 h-3.5 ring-4", BG[station.key], RING[station.key], "animate-pulse")
                  : isPast
                  ? cn("w-2.5 h-2.5", BG[station.key])
                  : "w-2.5 h-2.5 bg-muted-foreground/25"
              )}
              aria-label={station.key}
            >
              {/* Tooltip on hover */}
              <span
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-1.5 py-0.5 rounded bg-popover text-popover-foreground shadow-sm",
                  isRTL ? "right-full mr-2" : "left-full ml-2"
                )}
              >
                {station.emoji} {station.key.charAt(0).toUpperCase() + station.key.slice(1)}
              </span>
            </button>

            {/* Connecting line */}
            {!isLast && (
              <div
                className={cn(
                  "w-0.5 h-6 transition-colors duration-300",
                  idx < currentIdx ? BG[station.key] : "bg-muted-foreground/15"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
