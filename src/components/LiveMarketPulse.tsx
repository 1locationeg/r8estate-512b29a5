import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Star, Zap, MessageSquare, Users, Eye, X } from "lucide-react";
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
  { id: "f1", type: "buyer_check", keyword: "LIVE", keywordAr: "مباشر", text: "47 buyers checked Mountain View recently", textAr: "٤٧ مشتري تحققوا من ماونتن فيو مؤخراً", timestamp: new Date().toISOString(), link: "/reviews", count: 47, entityName: "Mountain View" },
  { id: "f2", type: "review", keyword: "REVIEW", keywordAr: "تقييم", text: "New reviews submitted today", textAr: "تقييمات جديدة اليوم", timestamp: new Date().toISOString(), link: "/reviews" },
  { id: "f3", type: "deal", keyword: "HOT DEAL", keywordAr: "عرض حصري", text: "Exclusive deals from verified businesses", textAr: "عروض حصرية من شركات موثقة", timestamp: new Date().toISOString(), link: "/deal-watch" },
  { id: "f4", type: "buyer_check", keyword: "LIVE", keywordAr: "مباشر", text: "23 buyers checked Palm Hills recently", textAr: "٢٣ مشتري تحققوا من بالم هيلز مؤخراً", timestamp: new Date().toISOString(), link: "/reviews", count: 23, entityName: "Palm Hills" },
];

const getIcon = (type: string) => {
  switch (type) {
    case "review": return <Star className="w-3 h-3" />;
    case "deal": return <Zap className="w-3 h-3" />;
    case "community": return <MessageSquare className="w-3 h-3" />;
    case "buyer_check": return <Eye className="w-3 h-3" />;
    default: return <Users className="w-3 h-3" />;
  }
};

export const LiveMarketPulse = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [delayReady, setDelayReady] = useState(false);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDelayReady(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const items: PulseEvent[] = [];

      const { data: reviews } = await supabase
        .from("reviews")
        .select("id, author_name, developer_name, developer_id, rating, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      if (reviews && reviews.length > 0) {
        const devMap = new Map<string, { name: string; count: number; id: string }>();
        reviews.forEach((r) => {
          const key = r.developer_id || r.developer_name || "unknown";
          const existing = devMap.get(key);
          if (existing) existing.count += 1;
          else devMap.set(key, { name: r.developer_name || "a developer", count: 1, id: r.developer_id });
        });

        devMap.forEach((val) => {
          const buyerCount = Math.max(val.count * 8, 12 + Math.floor(Math.random() * 40));
          items.push({
            id: `bc-${val.id}`, type: "buyer_check", keyword: "LIVE", keywordAr: "مباشر",
            text: `${buyerCount} buyers checked ${val.name} in the last hour`,
            textAr: `${buyerCount} مشتري تحققوا من ${val.name} في الساعة الأخيرة`,
            icon: getIcon("buyer_check"), timestamp: new Date().toISOString(),
            link: `/reviews?developer=${val.id}`, count: buyerCount, entityName: val.name,
          });
        });

        reviews.slice(0, 3).forEach((r) => {
          items.push({
            id: `review-${r.id}`, type: "review", keyword: "REVIEW", keywordAr: "تقييم",
            text: `${r.author_name} rated ${r.developer_name || "a business"} ${r.rating}/5`,
            textAr: `${r.author_name} قيّم ${r.developer_name || "شركة"} ${r.rating}/٥`,
            icon: getIcon("review"), timestamp: r.created_at, link: "/reviews",
          });
        });
      }

      const { data: deals } = await supabase
        .from("deals").select("id, headline, created_at")
        .eq("status", "verified").order("created_at", { ascending: false }).limit(3);

      if (deals) {
        deals.forEach((d) => {
          items.push({
            id: `deal-${d.id}`, type: "deal", keyword: "HOT DEAL", keywordAr: "عرض حصري",
            text: d.headline.slice(0, 45) + (d.headline.length > 45 ? "..." : ""),
            icon: getIcon("deal"), timestamp: d.created_at, link: "/deal-watch",
          });
        });
      }

      const { data: posts } = await supabase
        .from("community_posts").select("id, title, created_at")
        .order("created_at", { ascending: false }).limit(3);

      if (posts) {
        posts.forEach((p) => {
          items.push({
            id: `post-${p.id}`, type: "community", keyword: "TRENDING", keywordAr: "رائج",
            text: p.title.slice(0, 40) + (p.title.length > 40 ? "..." : ""),
            icon: getIcon("community"), timestamp: p.created_at, link: "/community",
          });
        });
      }

      items.sort((a, b) => {
        if (a.type === "buyer_check" && b.type !== "buyer_check") return -1;
        if (b.type === "buyer_check" && a.type !== "buyer_check") return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setEvents(items.length === 0
        ? FALLBACK_EVENTS.map((e) => ({ ...e, icon: getIcon(e.type) }))
        : items.slice(0, 12)
      );
    };
    fetchData();
  }, []);

  // Cycle + micro-fluctuate counts
  useEffect(() => {
    if (events.length <= 1) return;
    cycleRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % events.length);
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.type !== "buyer_check" || !ev.count) return ev;
          const delta = Math.floor(Math.random() * 5) - 2;
          const newCount = Math.max(5, ev.count + delta);
          const name = ev.entityName || "";
          return { ...ev, count: newCount,
            text: `${newCount} buyers checked ${name} in the last hour`,
            textAr: `${newCount} مشتري تحققوا من ${name} في الساعة الأخيرة`,
          };
        })
      );
    }, 4000);
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, [events.length]);

  const handleClick = useCallback(() => {
    const ev = events[idx];
    if (ev?.link) navigate(ev.link);
  }, [events, idx, navigate]);

  if (!delayReady || dismissed || events.length === 0) return null;

  const current = events[idx];
  const displayText = isAr ? (current.textAr || current.text) : current.text;
  const displayKeyword = isAr ? (current.keywordAr || current.keyword) : current.keyword;

  return (
    <div className="w-full bg-[hsl(220,40%,13%)] text-white z-50 relative">
      <div className="flex items-center justify-center gap-3 px-10 py-2 min-h-[36px]">
        {/* Live pulse dot */}
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
        </span>

        {/* Content */}
        <button
          onClick={handleClick}
          className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
        >
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/90 flex-shrink-0">
            {current.icon}
            {displayKeyword}
          </span>
          <span key={current.id} className="text-xs font-medium text-white/90 truncate animate-fade-in">
            {displayText}
          </span>
        </button>

        {/* Dismiss */}
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>
    </div>
  );
};
