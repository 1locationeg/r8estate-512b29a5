import { Search, Building2, Wallet, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface JourneyStation {
  key: "research" | "choose" | "finance" | "protect";
  emoji: string;
  labelKey: string;
  icon: LucideIcon;
  colorClass: string;          // e.g. "journey-research"
  bgClass: string;             // e.g. "bg-journey-research"
  textClass: string;           // e.g. "text-journey-research"
  bgTintClass: string;         // e.g. "bg-journey-research/10"
  homeRoute: string;
  routePatterns: string[];
}

export const JOURNEY_STATIONS: JourneyStation[] = [
  {
    key: "research",
    emoji: "🔍",
    labelKey: "station.research",
    icon: Search,
    colorClass: "journey-research",
    bgClass: "bg-journey-research",
    textClass: "text-journey-research",
    bgTintClass: "bg-journey-research/10",
    homeRoute: "/categories",
    routePatterns: ["/", "/categories", "/directory", "/leaderboard"],
  },
  {
    key: "choose",
    emoji: "🏗️",
    labelKey: "station.choose",
    icon: Building2,
    colorClass: "journey-choose",
    bgClass: "bg-journey-choose",
    textClass: "text-journey-choose",
    bgTintClass: "bg-journey-choose/10",
    homeRoute: "/portfolio",
    routePatterns: ["/entity/", "/portfolio", "/launch-watch"],
  },
  {
    key: "finance",
    emoji: "💳",
    labelKey: "station.finance",
    icon: Wallet,
    colorClass: "journey-finance",
    bgClass: "bg-journey-finance",
    textClass: "text-journey-finance",
    bgTintClass: "bg-journey-finance/10",
    homeRoute: "/deal-watch",
    routePatterns: ["/deal-watch", "/insights"],
  },
  {
    key: "protect",
    emoji: "🛡️",
    labelKey: "station.protect",
    icon: ShieldCheck,
    colorClass: "journey-protect",
    bgClass: "bg-journey-protect",
    textClass: "text-journey-protect",
    bgTintClass: "bg-journey-protect/10",
    homeRoute: "/buyer",
    routePatterns: ["/buyer", "/community", "/reviews", "/messages"],
  },
];

export function getStationForRoute(pathname: string): JourneyStation | null {
  // Exact match first (homepage)
  if (pathname === "/") return JOURNEY_STATIONS[0];

  for (const station of JOURNEY_STATIONS) {
    for (const pattern of station.routePatterns) {
      if (pattern === "/") continue; // skip homepage pattern for non-"/" paths
      if (pathname === pattern || pathname.startsWith(pattern)) {
        return station;
      }
    }
  }
  return null;
}
