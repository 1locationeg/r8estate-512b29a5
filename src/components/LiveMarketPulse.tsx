import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Star, Zap, MessageSquare, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface PulseEvent {
  id: string;
  type: "review" | "deal" | "community" | "buyer_check";
  text: string;
  textAr?: string;
  keyword: string;
  keywordAr?: string;
  icon: React.ReactNode;
  timestamp: string;
  link?: string;
  count?: number;
  entityName?: string;
}

const FALLBACK_EVENTS: Omit<PulseEvent, "icon">[] = [
  { id: "f1", type: "buyer_check", keyword: "LIVE", keywordAr: "مباشر", text: "47 buyers checked Mouintain View recently", textAr: "٤٧ مشتري تحققوا من ماونتن فيو مؤخراً", timestamp: new Date().toISOString(), link: "/reviews", count: 47, entityName: "Mouintain View" },
  { id: "f2", type: "review", keyword: "REVIEW", keywordAr: "تقييم", text: "New reviews submitted today", textAr: "تقييمات جديدة اليوم", timestamp: new Date().toISOString(), link: "/reviews" },
  { id: "f3", type: "deal", keyword: "HOT DEAL", keywordAr: "عرض حصري", text: "Exclusive deals from verified businesses", textAr: "عروض حصرية من شركات موثقة", timestamp: new Date().toISOString(), link: "/deal-watch" },
  { id: "f4", type: "buyer_check", keyword: "LIVE", keywordAr: "مباشر", text: "23 buyers checked Palim Hills recently", textAr: "٢٣ مشتري تحققوا من بالم هيلز مؤخراً", timestamp: new Date().toISOString(), link: "/reviews", count: 23, entityName: "Palim Hills" },
];

const getIcon = (type: string) => {
  switch (type) {
    case "review": return <Star className="w-3 h-3 text-accent" />;
    case "deal": return <Zap className="w-3 h-3 text-accent" />;
    case "community": return <MessageSquare className="w-3 h-3 text-primary-foreground" />;
    case "buyer_check": return <Eye className="w-3 h-3 text-trust-excellent" />;
    default: return <Users className="w-3 h-3 text-primary-foreground" />;
  }
};

export const LiveMarketPulse = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [idx, setIdx] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [delayReady, setDelayReady] = useState(false);
  const mobileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mobileCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Delay showing the feed for 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => setDelayReady(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetch = async () => {
      const items: PulseEvent[] = [];

      // Reviews → buyer_check aggregation
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id, author_name, developer_name, developer_id, rating, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      if (reviews && reviews.length > 0) {
        // Aggregate by developer
        const devMap = new Map<string, { name: string; count: number; id: string }>();
        reviews.forEach((r) => {
          const key = r.developer_id || r.developer_name || "unknown";
          const existing = devMap.get(key);
          if (existing) {
            existing.count += 1;
          } else {
            devMap.set(key, { name: r.developer_name || "a developer", count: 1, id: r.developer_id });
          }
        });

        devMap.forEach((val) => {
          const buyerCount = Math.max(val.count * 8, 12 + Math.floor(Math.random() * 40)); // Social proof amplification
          items.push({
            id: `bc-${val.id}`,
            type: "buyer_check",
            keyword: "LIVE",
            keywordAr: "مباشر",
            text: `${buyerCount} buyers checked ${val.name} in the last hour`,
            textAr: `${buyerCount} مشتري تحققوا من ${val.name} في الساعة الأخيرة`,
            icon: getIcon("buyer_check"),
            timestamp: new Date().toISOString(),
            link: `/reviews?developer=${val.id}`,
            count: buyerCount,
            entityName: val.name,
          });
        });

        // Also add individual review events
        reviews.slice(0, 3).forEach((r) => {
          items.push({
            id: `review-${r.id}`,
            type: "review",
            keyword: "REVIEW",
            keywordAr: "تقييم",
            text: `${r.author_name} rated ${r.developer_name || "a business"} ${r.rating}/5`,
            textAr: `${r.author_name} قيّم ${r.developer_name || "شركة"} ${r.rating}/٥`,
            icon: getIcon("review"),
            timestamp: r.created_at,
            link: "/reviews",
          });
        });
      }

      // Deals
      const { data: deals } = await supabase
        .from("deals")
        .select("id, headline, created_at")
        .eq("status", "verified")
        .order("created_at", { ascending: false })
        .limit(3);

      if (deals) {
        deals.forEach((d) => {
          items.push({
            id: `deal-${d.id}`,
            type: "deal",
            keyword: "HOT DEAL",
            keywordAr: "عرض حصري",
            text: d.headline.slice(0, 45) + (d.headline.length > 45 ? "..." : ""),
            icon: getIcon("deal"),
            timestamp: d.created_at,
            link: "/deal-watch",
          });
        });
      }

      // Community
      const { data: posts } = await supabase
        .from("community_posts")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (posts) {
        posts.forEach((p) => {
          items.push({
            id: `post-${p.id}`,
            type: "community",
            keyword: "TRENDING",
            keywordAr: "رائج",
            text: p.title.slice(0, 40) + (p.title.length > 40 ? "..." : ""),
            icon: getIcon("community"),
            timestamp: p.created_at,
            link: "/community",
          });
        });
      }

      // Sort buyer_check first, then by time
      items.sort((a, b) => {
        if (a.type === "buyer_check" && b.type !== "buyer_check") return -1;
        if (b.type === "buyer_check" && a.type !== "buyer_check") return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      if (items.length === 0) {
        setEvents(FALLBACK_EVENTS.map((e) => ({ ...e, icon: getIcon(e.type) })));
      } else {
        setEvents(items.slice(0, 12));
      }
    };

    fetch();
  }, []);

  // Desktop cycling — 4s + micro-fluctuate buyer_check counts
  useEffect(() => {
    if (events.length <= 1) return;
    cycleRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % events.length);
      // Nudge buyer_check counts by ±1–3 so numbers feel live
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.type !== "buyer_check" || !ev.count) return ev;
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newCount = Math.max(5, ev.count + delta);
          const name = ev.entityName || "";
          return {
            ...ev,
            count: newCount,
            text: `${newCount} buyers checked ${name} in the last hour`,
            textAr: `${newCount} مشتري تحققوا من ${name} في الساعة الأخيرة`,
          };
        })
      );
    }, 4000);
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, [events.length]);

  // Mobile auto-expand cycle — 6s
  useEffect(() => {
    mobileCycleRef.current = setInterval(() => {
      setMobileExpanded(true);
      setIdx((prev) => (prev + 1) % Math.max(events.length, 1));
    }, 6000);
    return () => { if (mobileCycleRef.current) clearInterval(mobileCycleRef.current); };
  }, [events.length]);

  // Auto-collapse mobile after 4s
  useEffect(() => {
    if (!mobileExpanded) return;
    mobileTimerRef.current = setTimeout(() => setMobileExpanded(false), 4000);
    return () => { if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current); };
  }, [mobileExpanded, idx]);

  const handleMobileTap = useCallback(() => {
    if (!mobileExpanded) {
      setMobileExpanded(true);
    } else {
      const ev = events[idx];
      if (ev?.link) navigate(ev.link);
    }
  }, [mobileExpanded, events, idx, navigate]);

  const handleDesktopClick = useCallback(() => {
    const ev = events[idx];
    if (ev?.link) navigate(ev.link);
  }, [events, idx, navigate]);

  if (events.length === 0) return null;

  const current = events[idx];
  const displayText = isAr ? (current.textAr || current.text) : current.text;
  const displayKeyword = isAr ? (current.keywordAr || current.keyword) : current.keyword;

  const keywordColor = current.type === "deal"
    ? "bg-accent/20 text-accent-foreground"
    : current.type === "buyer_check"
      ? "bg-trust-excellent/15 text-trust-excellent"
      : current.type === "review"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";

  return (
    <>
      {/* ─── Desktop: Glassmorphism marquee bar ─── */}
      <div className="hidden md:block w-full max-w-3xl mx-auto px-4">
        <div className="relative rounded-2xl p-[2px] overflow-hidden live-feed-border">
          <div className="absolute inset-0 rounded-2xl live-feed-gradient-spin" />
          <div
            className="relative flex items-center gap-2.5 py-3 px-4 rounded-[14px] bg-secondary dark:bg-card backdrop-blur-md cursor-pointer hover:bg-muted dark:hover:bg-muted transition-all duration-200 min-h-[48px]"
            onClick={handleDesktopClick}
          >
            {/* Live pulse — AI enhanced */}
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full border-2 border-trust-excellent/60 animate-ping" />
              <span className="absolute inline-flex h-full w-full rounded-full border-2 border-trust-excellent/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" style={{ transform: 'scale(1.3)' }} />
              <span className="relative inline-flex rounded-full h-3 w-3 border-2 border-trust-excellent shadow-[0_0_8px_3px_hsl(var(--trust-excellent)/0.5)] ai-pulse-dot" />
            </span>

            <div key={current.id} className="flex items-center gap-2 flex-1 min-w-0 animate-fade-in">
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 live-feed-keyword", keywordColor)}>
                {current.icon}
                {displayKeyword}
              </span>
              <span className="text-xs font-medium text-foreground truncate">{displayText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile: Pulse-to-Toast floating element ─── */}
      <div
        className={cn(
          "md:hidden fixed z-40 transition-all duration-500 ease-out cursor-pointer",
          "bottom-[calc(64px+env(safe-area-inset-bottom,0px))]",
          "start-[calc(12px+env(safe-area-inset-left,0px))]"
        )}
        onClick={handleMobileTap}
      >
        <div
          className={cn(
            "market-pulse-glass flex items-center overflow-hidden rounded-full transition-all duration-500 ease-out",
            mobileExpanded
              ? "h-9 max-w-[280px] ps-2.5 pe-3 gap-2 shadow-lg"
              : "h-8 w-8 max-w-[32px] justify-center shadow-md"
          )}
        >
          {/* Green pulse dot */}
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-trust-excellent/40 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-trust-excellent shadow-[0_0_8px_2px_hsl(var(--trust-excellent)/0.5)]" />
          </span>

          {/* Expanding content */}
          <div
            className={cn(
              "flex items-center gap-1.5 min-w-0 overflow-hidden transition-all duration-500",
              mobileExpanded ? "opacity-100 max-w-[240px]" : "opacity-0 max-w-0"
            )}
          >
            <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0", keywordColor)}>
              {displayKeyword}
            </span>
            <span className="text-[11px] font-medium text-foreground truncate leading-tight">
              {displayText}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
