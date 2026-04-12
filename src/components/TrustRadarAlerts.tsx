import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Star, Bell, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TrustAlert {
  id: string;
  icon: "up" | "down" | "review" | "price";
  title: string;
  description: string;
  time: string;
  severity?: "high" | "medium" | "low";
  askQuery?: string;
}

interface RiskFlag {
  business: string;
  business_id: string;
  risk: "High" | "Medium" | "Low";
  reason: string;
  delta: number;
  current_avg: number | null;
  prior_avg: number | null;
}

interface Props {
  riskFlags?: RiskFlag[];
  onAskCopilot?: (query: string) => void;
}

export const TrustRadarAlerts = ({ riskFlags, onAskCopilot }: Props) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<TrustAlert[]>([]);

  useEffect(() => {
    // If we have real risk flags from the proactive scan, use those
    if (riskFlags?.length) {
      const mapped: TrustAlert[] = riskFlags.map((f, i) => ({
        id: `risk-${i}`,
        icon: f.delta < 0 ? "down" : f.delta > 0 ? "up" : "review",
        title: `${f.business} — ${Math.abs(f.delta)}% ${f.delta < 0 ? "drop" : "rise"}`,
        description: f.reason,
        time: "30d",
        severity: f.risk.toLowerCase() as "high" | "medium" | "low",
        askQuery: `Tell me more about ${f.business} trust score changes`,
      }));
      setAlerts(mapped);
      return;
    }

    // Fallback: fetch from DB
    if (!user) return;
    const fetchAlerts = async () => {
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
  }, [user, riskFlags]);

  const iconMap = {
    up: <TrendingUp className="w-4 h-4 text-primary" />,
    down: <TrendingDown className="w-4 h-4 text-destructive" />,
    review: <Star className="w-4 h-4 text-amber-500" />,
    price: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  };

  const severityBorder = (s?: string) => {
    if (s === "high") return "border-s-2 border-s-destructive";
    if (s === "medium") return "border-s-2 border-s-amber-500";
    return "";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Trust Radar</h3>
        {riskFlags?.length ? (
          <span className="ms-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
            Live
          </span>
        ) : null}
      </div>
      <div className="space-y-2.5">
        {alerts.map(a => (
          <div key={a.id} className={`flex items-start gap-2.5 text-sm rounded-md px-1.5 py-1 ${severityBorder(a.severity)}`}>
            <div className="mt-0.5 shrink-0">{iconMap[a.icon]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.description}</p>
              {a.askQuery && onAskCopilot && (
                <button
                  onClick={() => onAskCopilot(a.askQuery!)}
                  className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5 mt-0.5 transition-colors"
                >
                  Ask Agent <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
