import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface InsightData {
  metric_value: string;
  trend: "up" | "down" | "stable" | "alert";
  category: string;
  title: string;
}

const trendConfig = {
  up: { Icon: TrendingUp, label: "Rising", color: "text-trust-excellent", border: "border-trust-excellent/40", bg: "from-trust-excellent/20 to-trust-excellent/5", glow: "shadow-trust-excellent/20" },
  down: { Icon: TrendingDown, label: "Cooling", color: "text-destructive", border: "border-destructive/40", bg: "from-destructive/20 to-destructive/5", glow: "shadow-destructive/20" },
  stable: { Icon: Minus, label: "Steady", color: "text-muted-foreground", border: "border-border", bg: "from-secondary/40 to-secondary/10", glow: "shadow-muted/10" },
  alert: { Icon: AlertTriangle, label: "Watch", color: "text-accent", border: "border-accent/40", bg: "from-accent/20 to-accent/5", glow: "shadow-accent/20" },
};

export const MarketPulseWidget = ({ onClick }: { onClick: () => void }) => {
  const { user, role } = useAuth();
  const [data, setData] = useState<InsightData>({
    metric_value: "—",
    trend: "stable",
    category: "market",
    title: "Insights",
  });

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const effectiveRole = role === "admin" ? "admin" : role === "business" ? "business" : "buyer";
        const { data: res } = await supabase.functions.invoke("platform-insights", {
          body: { role: effectiveRole },
        });
        if (res?.insights?.length) {
          const top = res.insights[0];
          setData({
            metric_value: top.metric_value || "—",
            trend: top.trend || "stable",
            category: top.category || "market",
            title: top.metric_label || "Insight",
          });
        }
      } catch {
        // keep defaults
      }
    };
    fetch();
  }, [user, role]);

  const cfg = trendConfig[data.trend];
  const TrendIcon = cfg.Icon;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border ${cfg.border} bg-gradient-to-br ${cfg.bg} hover:shadow-lg ${cfg.glow} transition-all text-center group overflow-hidden col-span-2 md:col-span-1`}
    >
      {/* Big metric number */}
      <span className={`text-xl font-black leading-none ${cfg.color} tracking-tight`}>
        {data.metric_value}
      </span>

      {/* Trend icon + compact word */}
      <div className="flex items-center gap-1">
        <TrendIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Label */}
      <span className="text-[9px] text-muted-foreground leading-tight truncate max-w-full">
        {data.title}
      </span>

      <Sparkles className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
    </button>
  );
};
