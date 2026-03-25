import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Star, Tag, MessageSquare, TrendingUp, Users, Zap } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "review" | "deal" | "community" | "signup";
  text: string;
  keyword: string;
  icon: React.ReactNode;
  timestamp: string;
  link?: string;
}

export const LiveActivityFeed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  useEffect(() => {
    if (activities.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setVisibleIdx((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activities.length]);

  const fetchRecentActivity = async () => {
    const items: ActivityItem[] = [];

    const { data: reviews } = await supabase
      .from("reviews")
      .select("id, author_name, developer_name, rating, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5);

    if (reviews) {
      reviews.forEach((r) => {
        items.push({
          id: `review-${r.id}`,
          type: "review",
          keyword: "REVIEW",
          text: `${r.author_name} rated ${r.developer_name || "a business"} ${r.rating}/5`,
          icon: <Star className="w-3.5 h-3.5 text-accent" />,
          timestamp: r.created_at,
          link: "/reviews",
        });
      });
    }

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
          text: `${d.headline.slice(0, 40)}${d.headline.length > 40 ? "..." : ""}`,
          icon: <Zap className="w-3.5 h-3.5 text-accent" />,
          timestamp: d.created_at,
          link: "/deal-watch",
        });
      });
    }

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
          text: `${p.title.slice(0, 40)}${p.title.length > 40 ? "..." : ""}`,
          icon: <MessageSquare className="w-3.5 h-3.5 text-primary" />,
          timestamp: p.created_at,
          link: "/community",
        });
      });
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (items.length === 0) {
      items.push(
        { id: "f1", type: "signup", keyword: "LIVE", text: "New buyers are joining the platform", icon: <Users className="w-3.5 h-3.5 text-primary" />, timestamp: new Date().toISOString() },
        { id: "f2", type: "review", keyword: "REVIEW", text: "Reviews are being submitted daily", icon: <Star className="w-3.5 h-3.5 text-accent" />, timestamp: new Date().toISOString(), link: "/reviews" },
        { id: "f3", type: "deal", keyword: "HOT DEAL", text: "New deals from verified businesses", icon: <Zap className="w-3.5 h-3.5 text-accent" />, timestamp: new Date().toISOString(), link: "/deal-watch" },
      );
    }

    setActivities(items.slice(0, 10));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (activities.length === 0) return null;

  const current = activities[visibleIdx];

  const keywordColor = current.type === "deal"
    ? "bg-accent/20 text-accent-foreground"
    : current.type === "review"
      ? "bg-destructive/10 text-destructive"
      : "bg-primary/10 text-primary";

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Outer wrapper with animated conic-gradient border */}
      <div className="relative rounded-2xl p-[2px] overflow-hidden live-feed-border">
        {/* Animated gradient border layer */}
        <div className="absolute inset-0 rounded-2xl live-feed-gradient-spin" />

        {/* Inner content with glassmorphism */}
        <div
          className="relative flex items-center gap-2.5 py-3 px-4 rounded-[14px] bg-white/70 dark:bg-background/70 backdrop-blur-md cursor-pointer hover:bg-white/80 dark:hover:bg-background/80 transition-all duration-200 min-h-[48px]"
          onClick={() => current.link && navigate(current.link)}
        >
          {/* Live pulse icon */}
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full border-2 border-destructive/60 animate-ping" />
            <span className="absolute inline-flex h-full w-full rounded-full border-2 border-destructive/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" style={{ transform: 'scale(1.3)' }} />
            <span className="relative inline-flex rounded-full h-3 w-3 border-2 border-destructive shadow-[0_0_6px_2px_hsl(var(--destructive)/0.4)]" />
          </span>

          <div
            key={current.id}
            className="flex items-center gap-2 flex-1 min-w-0 animate-fade-in"
          >
            {/* Keyword badge with pulse */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 live-feed-keyword ${keywordColor}`}>
              {current.icon}
              {current.keyword}
            </span>

            <span className="text-xs font-medium text-foreground truncate">{current.text}</span>
          </div>

          {/* Tap indicator on mobile */}
          <span className="text-muted-foreground/50 flex-shrink-0 md:hidden">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
      </div>
    </div>
  );
};
