import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Star, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TrustAlert {
  id: string;
  icon: "up" | "down" | "review" | "price";
  title: string;
  description: string;
  time: string;
}

export const TrustRadarAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<TrustAlert[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAlerts = async () => {
      // Fetch recent reviews on followed businesses
      const { data: followed } = await supabase
        .from("followed_businesses")
        .select("business_id, business_name")
        .eq("user_id", user.id)
        .limit(10);

      if (!followed?.length) {
        setAlerts([{
          id: "empty",
          icon: "review",
          title: "No alerts yet",
          description: "Follow some companies to get proactive trust alerts.",
          time: "now",
        }]);
        return;
      }

      const businessIds = followed.map(f => f.business_id);
      const { data: recentReviews } = await supabase
        .from("reviews")
        .select("id, developer_name, rating, created_at")
        .in("developer_id", businessIds)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);

      const generated: TrustAlert[] = (recentReviews || []).map(r => ({
        id: r.id,
        icon: r.rating >= 4 ? "up" : r.rating <= 2 ? "down" : "review",
        title: `${r.developer_name || "A company you follow"} — ${r.rating}★ review`,
        description: r.rating >= 4
          ? "Positive review boosting trust score"
          : r.rating <= 2
          ? "Low rating may impact trust score"
          : "New review submitted",
        time: new Date(r.created_at).toLocaleDateString(),
      }));

      setAlerts(generated.length ? generated : [{
        id: "none",
        icon: "review",
        title: "All clear",
        description: "No new activity on your tracked companies.",
        time: "now",
      }]);
    };
    fetchAlerts();
  }, [user]);

  const iconMap = {
    up: <TrendingUp className="w-4 h-4 text-trust-excellent" />,
    down: <TrendingDown className="w-4 h-4 text-destructive" />,
    review: <Star className="w-4 h-4 text-amber-500" />,
    price: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Trust Radar</h3>
      </div>
      <div className="space-y-2.5">
        {alerts.map(a => (
          <div key={a.id} className="flex items-start gap-2.5 text-sm">
            <div className="mt-0.5 shrink-0">{iconMap[a.icon]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.description}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
