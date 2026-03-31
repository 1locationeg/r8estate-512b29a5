import { useLocation } from "react-router-dom";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";

const BG_FILLED: Record<string, string> = {
  research: "bg-journey-research",
  choose: "bg-journey-choose",
  finance: "bg-journey-finance",
  protect: "bg-journey-protect",
};

const BG_DIMMED: Record<string, string> = {
  research: "bg-journey-research/15",
  choose: "bg-journey-choose/15",
  finance: "bg-journey-finance/15",
  protect: "bg-journey-protect/15",
};

export const JourneyStripe = () => {
  const { pathname } = useLocation();

  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/embed/") ||
    pathname.startsWith("/review") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  )
    return null;

  const current = getStationForRoute(pathname);
  const currentIdx = current
    ? JOURNEY_STATIONS.findIndex((s) => s.key === current.key)
    : -1;

  return (
    <div className="flex w-full gap-px" aria-hidden="true">
      {JOURNEY_STATIONS.map((station, idx) => (
        <div
          key={station.key}
          className={cn(
            "h-1 flex-1 transition-colors duration-500",
            idx <= currentIdx ? BG_FILLED[station.key] : BG_DIMMED[station.key]
          )}
        />
      ))}
    </div>
  );
};
