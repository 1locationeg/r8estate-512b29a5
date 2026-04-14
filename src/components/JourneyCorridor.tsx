import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { JOURNEY_STATIONS, getStationForRoute } from "@/lib/journeyStations";
import { useCorridorEngagement } from "@/hooks/useCorridorEngagement";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, X, Search, GitCompare, Banknote, Shield, Circle, CheckCircle2 } from "lucide-react";

const STATION_COLORS = [
  "hsl(var(--journey-research))",
  "hsl(var(--journey-choose))",
  "hsl(var(--journey-finance))",
  "hsl(var(--journey-protect))",
];

const STATION_ICONS = [Search, GitCompare, Banknote, Shield];

type TipItem = { label: string; action: string; route: string; scrollTo?: string; domAction?: string };

const STATION_TIP_ITEMS: Record<number, TipItem[]> = {
  1: [
    { label: "Search for a developer or project", action: "search", route: "/", scrollTo: "#journey-section-0", domAction: "focus-search" },
    { label: "Click a suggestion", action: "suggestion_click", route: "/", scrollTo: "#journey-section-0", domAction: "focus-search" },
    { label: "Try AI assistant", action: "ai_ask", route: "/", scrollTo: "#journey-section-0", domAction: "open-ai-chat" },
  ],
  2: [
    { label: "View a company profile", action: "entity_view", route: "/reviews" },
    { label: "Open the comparison tool", action: "compare_open", route: "/reviews" },
    { label: "Check a spotlight card", action: "spotlight_click", route: "/", scrollTo: "#journey-section-1" },
  ],
  3: [
    { label: "Explore a deal or launch", action: "deal_click", route: "/deals" },
    { label: "View pricing plans", action: "pricing_view", route: "/", scrollTo: "#journey-section-2" },
    { label: "Read 'How We Work'", action: "how_we_work", route: "/", scrollTo: "#journey-section-2" },
  ],
  4: [
    { label: "Visit the community", action: "community_click", route: "/community" },
    { label: "Submit feedback", action: "feedback_submit", route: "/community" },
    { label: "Write a review", action: "review_click", route: "/reviews" },
  ],
};

const STATION_HINTS: Record<number, string> = {
  1: "Search & explore developers",
  2: "Compare & shortlist options",
  3: "Review deals & financing",
  4: "Join community & protect",
};

/** Returns a red→yellow→green gradient string based on how far along progress is */
const getProgressGradient = (pct: number) => {
  if (pct <= 0) return "transparent";
  if (pct <= 25) return "linear-gradient(to right, hsl(0,72%,51%), hsl(15,80%,50%))";
  if (pct <= 50) return "linear-gradient(to right, hsl(0,72%,51%), hsl(30,90%,50%), hsl(45,93%,47%))";
  if (pct <= 75) return "linear-gradient(to right, hsl(0,72%,51%), hsl(35,90%,48%), hsl(45,93%,47%), hsl(80,60%,45%))";
  return "linear-gradient(to right, hsl(0,72%,51%), hsl(35,90%,48%), hsl(45,93%,47%), hsl(100,60%,42%), hsl(142,71%,45%))";
};

const EXCLUDED_ROUTES = ["/auth", "/embed/", "/review", "/forgot-password", "/reset-password"];

export const JourneyCorridor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { zoneEngagement, completedActions } = useCorridorEngagement();
  const { user } = useAuth();
  const [activeZone, setActiveZone] = useState(0);
  const [zoneScrollProgress, setZoneScrollProgress] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const isHomePage = pathname === "/";

  // Hide on excluded routes
  const isExcluded = EXCLUDED_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/") || (r.endsWith("/") && pathname.startsWith(r)));
  
  // On inner pages, determine active station from route
  const routeStation = useMemo(() => getStationForRoute(pathname), [pathname]);
  const routeStationIdx = routeStation ? JOURNEY_STATIONS.findIndex(s => s.key === routeStation.key) : -1;

  const getZoneElements = useCallback(() => {
    return [1, 2, 3, 4].map(z => document.querySelector(`[data-zone="${z}"]`) as HTMLElement | null);
  }, []);

  // Close breakdown on outside click
  useEffect(() => {
    if (!showBreakdown) return;
    const handler = (e: MouseEvent) => {
      if (breakdownRef.current && !breakdownRef.current.contains(e.target as Node)) {
        setShowBreakdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBreakdown]);

  useEffect(() => {
    if (!isHomePage) return; // Only track scroll on homepage
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const zones = getZoneElements();
        const viewMid = window.scrollY + window.innerHeight * 0.4;
        let current = 0;
        const progArr: [number, number, number, number] = [0, 0, 0, 0];

        for (let i = 0; i < zones.length; i++) {
          const el = zones[i];
          if (!el) continue;
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (viewMid >= top) {
            if (viewMid <= bottom) {
              current = i + 1;
              progArr[i] = Math.min(1, Math.max(0, (viewMid - top) / (bottom - top)));
            } else {
              progArr[i] = 1;
              current = i + 1;
            }
          }
        }

        setActiveZone(current);
        setZoneScrollProgress(progArr);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, [getZoneElements, isHomePage]);

  // 5% bonus for visiting (cookie/localStorage), +5% if signed up
  const baseBonus = useMemo(() => {
    const VISIT_KEY = "r8_visited";
    try { localStorage.setItem(VISIT_KEY, "1"); } catch {}
    const visited = (() => { try { return !!localStorage.getItem(VISIT_KEY); } catch { return false; } })();
    const visitBonus = visited ? 5 : 0;
    const signupBonus = user ? 5 : 0;
    return visitBonus + signupBonus;
  }, [user]);

  const combinedZone = useMemo(() => {
    return zoneScrollProgress.map((sp, i) =>
      Math.min(1, sp * 0.5 + zoneEngagement[i] * 0.5)
    ) as [number, number, number, number];
  }, [zoneScrollProgress, zoneEngagement]);

  const overallProgress = useMemo(() => {
    const total = combinedZone.reduce((a, b) => a + b, 0);
    return Math.min(100, Math.round((total / 4) * 100) + baseBonus);
  }, [combinedZone, baseBonus]);

  const scrollToZone = (zone: number) => {
    const sectionEl = document.getElementById(`journey-section-${zone - 1}`);
    const fallbackEl = document.querySelector(`[data-zone="${zone}"]`);
    const el = sectionEl || fallbackEl;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStationClick = (zone: number) => {
    if (isHomePage) {
      scrollToZone(zone);
    } else {
      const station = JOURNEY_STATIONS[zone - 1];
      if (station) navigate(station.homeRoute);
    }
    setShowBreakdown(false);
  };

  // Determine effective active zone: scroll-based on homepage, route-based on inner pages
  const effectiveActiveZone = isHomePage ? activeZone : (routeStationIdx >= 0 ? routeStationIdx + 1 : 0);

  

  const handleTipClick = (e: React.MouseEvent, tip: TipItem) => {
    e.stopPropagation();
    e.preventDefault();
    setShowBreakdown(false);

    const currentPath = window.location.pathname;
    const isCurrentPage = tip.route === "/" && (currentPath === "/" || currentPath === "");

    // Handle DOM actions first
    if (tip.domAction === "focus-search") {
      if (!isCurrentPage) {
        navigate(tip.route);
        return;
      }
      // Scroll to search and focus it
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"], input[placeholder*="ابحث"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => searchInput.focus(), 400);
        return;
      }
      // Fallback: scroll to journey section
      const fallback = document.getElementById("journey-section-0") || document.querySelector("[data-zone='1']");
      if (fallback) fallback.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (tip.domAction === "open-ai-chat") {
      if (!isCurrentPage) {
        navigate(tip.route);
        return;
      }
      // Try to open the AI chat FAB
      const chatFab = document.querySelector('[aria-label*="chat"], [aria-label*="Chat"], [data-ai-chat]') as HTMLButtonElement;
      if (chatFab) {
        chatFab.click();
        return;
      }
      // Fallback: scroll to journey section 0
      const fallback = document.getElementById("journey-section-0") || document.querySelector("[data-zone='1']");
      if (fallback) fallback.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Navigate to a different page
    if (!isCurrentPage) {
      navigate(tip.route);
      return;
    }

    // Same page — scroll to section
    if (tip.scrollTo) {
      document.querySelector(tip.scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const nextIncomplete = useMemo(() => {
    for (let i = 0; i < 4; i++) {
      if (combinedZone[i] < 1) return i + 1;
    }
    return null;
  }, [combinedZone]);

  if (isExcluded) return null;

  return (
    <div className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1100px] mx-auto px-3 md:px-4">
        {/* Single compact row */}
        <div className="flex items-center gap-2 py-1.5 md:py-2">
          {/* Left: percentage ring */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="relative w-[28px] h-[28px] md:w-[32px] md:h-[32px] cursor-pointer hover:scale-110 transition-transform"
              aria-label="View journey progress breakdown"
            >
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
                    <stop offset="50%" stopColor="hsl(45, 93%, 47%)" />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" />
                  </linearGradient>
                </defs>
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${overallProgress * 0.9425} 94.25`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-foreground tabular-nums">
                {overallProgress}%
              </span>
            </button>

            {/* Breakdown popover */}
            {showBreakdown && (
              <div
                ref={breakdownRef}
                className="absolute top-full left-0 mt-2 w-[280px] md:w-[320px] bg-card border border-border rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">Your Journey Progress</h3>
                  <button onClick={() => setShowBreakdown(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Overall bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Overall</span>
                    <span className="font-bold text-foreground">{overallProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%`, background: getProgressGradient(overallProgress) }}
                    />
                  </div>
                </div>

                {/* Per-station breakdown */}
                <div className="space-y-3">
                  {JOURNEY_STATIONS.map((station, idx) => {
                    const pct = Math.round(combinedZone[idx] * 100);
                    const Icon = STATION_ICONS[idx];
                    const isComplete = pct >= 100;
                    const tips = STATION_TIP_ITEMS[idx + 1];
                    const zoneCompleted = completedActions[idx + 1] || [];

                    return (
                      <div key={station.key}>
                        <button
                          onClick={() => { handleStationClick(idx + 1); setShowBreakdown(false); }}
                          className="w-full text-start group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `color-mix(in srgb, ${STATION_COLORS[idx]} 15%, transparent)` }}
                            >
                              {isComplete
                                ? <Check className="w-3 h-3" style={{ color: STATION_COLORS[idx] }} />
                                : <Icon className="w-3 h-3" style={{ color: STATION_COLORS[idx] }} />
                              }
                            </div>
                            <span className="text-xs font-semibold text-foreground flex-1 group-hover:underline">
                              {t(station.labelKey)}
                            </span>
                            <span
                              className="text-[10px] font-bold tabular-nums"
                              style={{ color: STATION_COLORS[idx] }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="ml-7">
                            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: STATION_COLORS[idx],
                                }}
                              />
                            </div>
                          </div>
                        </button>

                        {/* Tips - always show, with green/grey status */}
                        <div className="ml-7 mt-1.5 space-y-0.5">
                          {tips.map((tip, tIdx) => {
                            const isDone = zoneCompleted.includes(tip.action);
                            return (
                              <button
                                key={tIdx}
                                onClick={(e) => handleTipClick(e, tip)}
                                className={cn(
                                  "flex items-center gap-1.5 text-[10px] w-full text-start rounded-sm px-1 py-0.5 -mx-1 transition-colors",
                                  isDone
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                                ) : (
                                  <Circle className="w-2.5 h-2.5 flex-shrink-0 opacity-40" />
                                )}
                                <span className={isDone ? "line-through opacity-70" : ""}>
                                  {tip.label}
                                </span>
                                {!isDone && (
                                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  {overallProgress >= 100 ? (
                    <p className="text-xs text-center font-semibold text-primary">
                      🎉 Journey complete! You've explored everything.
                    </p>
                  ) : (
                    <p className="text-[10px] text-center text-muted-foreground">
                      Tap any tip to jump there. Progress is saved automatically.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center: station track with unified progress bar */}
          <div className="flex-1 flex items-center relative">
            {/* Unified grey progress track behind station dots */}
            <div
              className="absolute top-[12px] md:top-[14px] h-[4px] rounded-full bg-muted overflow-hidden"
              style={{ left: "12.5%", right: "12.5%", zIndex: 0 }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${overallProgress}%`,
                  background: getProgressGradient(overallProgress),
                }}
              />
            </div>

            {JOURNEY_STATIONS.map((station, idx) => {
              const zone = idx + 1;
              const isPast = effectiveActiveZone > zone;
              const isActive = effectiveActiveZone === zone;
              const color = STATION_COLORS[idx];
              const stationComplete = combinedZone[idx] >= 1;

              return (
                <div key={station.key} className="flex-1 flex flex-col items-center relative" style={{ zIndex: 1 }}>
                  <button
                    onClick={() => handleStationClick(zone)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer group min-w-[44px] min-h-[44px] justify-center relative"
                  >
                    {/* Station dot */}
                    <div
                      className={cn(
                        "w-[24px] h-[24px] md:w-[28px] md:h-[28px] rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black transition-all duration-300 border-2",
                      )}
                      style={{
                        backgroundColor: isPast || isActive || stationComplete
                          ? color
                          : `color-mix(in srgb, ${color} 12%, hsl(var(--background)))`,
                        borderColor: isPast || isActive || stationComplete
                          ? color
                          : `color-mix(in srgb, ${color} 30%, transparent)`,
                        color: isPast || isActive || stationComplete ? "white" : color,
                        boxShadow: isActive ? `0 0 12px ${color}, 0 0 4px ${color}` : "none",
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {isPast || stationComplete ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : zone}
                    </div>

                    {/* Pulsing ring on active */}
                    {isActive && (
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[24px] h-[24px] md:w-[28px] md:h-[28px] rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: color }}
                      />
                    )}

                    {/* Active underline accent */}
                    {isActive && (
                      <div
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )}

                    {/* Label */}
                    <span
                      className={cn(
                        "text-[10px] md:text-[11px] font-bold leading-tight whitespace-nowrap transition-all duration-300",
                        isPast || stationComplete ? "opacity-70" : isActive ? "opacity-100" : "opacity-50",
                      )}
                      style={{ color }}
                    >
                      {t(station.labelKey)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
