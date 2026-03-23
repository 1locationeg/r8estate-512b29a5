import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Star, Tag, MessageSquare, TrendingUp, Users } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "review" | "deal" | "community" | "signup";
  text: string;
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
          text: `${r.author_name} rated ${r.developer_name || "a business"} ${r.rating}/5`,
          icon: <Star className="w-3.5 h-3.5 text-accent fill-accent" />,
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
          text: `New deal: "${d.headline.slice(0, 40)}${d.headline.length > 40 ? "..." : ""}"`,
          icon: <Tag className="w-3.5 h-3.5 text-verified" />,
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
          text: `New discussion: "${p.title.slice(0, 40)}${p.title.length > 40 ? "..." : ""}"`,
          icon: <MessageSquare className="w-3.5 h-3.5 text-primary" />,
          timestamp: p.created_at,
          link: "/community",
        });
      });
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (items.length === 0) {
      items.push(
        { id: "f1", type: "signup", text: "New buyers are joining the platform", icon: <Users className="w-3.5 h-3.5 text-primary" />, timestamp: new Date().toISOString() },
        { id: "f2", type: "review", text: "Reviews are being submitted daily", icon: <Star className="w-3.5 h-3.5 text-accent fill-accent" />, timestamp: new Date().toISOString(), link: "/reviews" },
        { id: "f3", type: "deal", text: "New deals from verified businesses", icon: <TrendingUp className="w-3.5 h-3.5 text-verified" />, timestamp: new Date().toISOString(), link: "/deal-watch" },
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

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-full bg-secondary/50 border border-border overflow-hidden cursor-pointer hover:bg-secondary/70 transition-colors"
        onClick={() => current.link && navigate(current.link)}
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verified opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-verified" />
        </span>
        <div 
          key={current.id} 
          className="flex items-center gap-2 flex-1 min-w-0 animate-fade-in"
        >
          {current.icon}
          <span className="text-xs text-foreground truncate">{current.text}</span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(current.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
