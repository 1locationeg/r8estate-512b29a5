import { useLocation } from "react-router-dom";
import { getStationForRoute } from "@/lib/journeyStations";
import { cn } from "@/lib/utils";

const BG_MAP: Record<string, string> = {
  research: "bg-journey-research",
  choose: "bg-journey-choose",
  finance: "bg-journey-finance",
  protect: "bg-journey-protect",
};

export const JourneyStripe = () => {
  const { pathname } = useLocation();

  // Hide on homepage (has its own journey strip), auth, embed routes
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/embed/") ||
    pathname.startsWith("/review") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  )
    return null;

  const station = getStationForRoute(pathname);
  if (!station) return null;

  return (
    <div className={cn("h-1 w-full", BG_MAP[station.key])} aria-hidden="true" />
  );
};
