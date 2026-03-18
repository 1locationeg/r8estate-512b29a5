import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface InsightData {
  metric_value: string;
  trend: "up" | "down" | "stable" | "alert";
  category: string;
  metric_label: string;
}

const trendConfig = {
  up: { Icon: TrendingUp, label: "Rising", color: "text-trust-excellent", border: "border-trust-excellent/40", bg: "from-trust-excellent/20 to-trust-excellent/5", glow: "shadow-trust-excellent/20" },
  down: { Icon: TrendingDown, label: "Cooling", color: "text-destructive", border: "border-destructive/40", bg: "from-destructive/20 to-destructive/5", glow: "shadow-destructive/20" },
  stable: { Icon: Minus, label: "Steady", color: "text-muted-foreground", border: "border-border", bg: "from-secondary/40 to-secondary/10", glow: "shadow-muted/10" },
  alert: { Icon: AlertTriangle, label: "Watch", color: "text-accent", border: "border-accent/40", bg: "from-accent/20 to-accent/5", glow: "shadow-accent/20" },
};

export const MarketPulseWidget = ({ onClick }: { onClick: () => void }) => {
  const { user, role } = useAuth();
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const effectiveRole = role === "admin" ? "admin" : role === "business" ? "business" : "buyer";
        const { data: res } = await supabase.functions.invoke("platform-insights", {
          body: { role: effectiveRole },
        });
        if (res?.insights?.length) {
          setInsights(res.insights.map((i: any) => ({
            metric_value: i.metric_value || "—",
            trend: i.trend || "stable",
            category: i.category || "market",
            metric_label: i.metric_label || "Insight",
          })));
        }
      } catch {
        // keep defaults
      }
    };
    fetchData();
  }, [user, role]);

  // Cycle through insights every 4s
  useEffect(() => {
    if (insights.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % insights.length);
        setFading(false);
      }, 300);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [insights.length]);

  const current: InsightData = insights[activeIdx] || {
    metric_value: "—",
    trend: "stable" as const,
    category: "market",
    metric_label: "AI Insights",
  };

  const cfg = trendConfig[current.trend];
  const TrendIcon = cfg.Icon;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border ${cfg.border} bg-gradient-to-br ${cfg.bg} hover:shadow-lg ${cfg.glow} transition-all text-center group overflow-hidden col-span-2 md:col-span-1`}
    >
      {/* Big bold AI icon */}
      <Sparkles className={`w-5 h-5 ${cfg.color} drop-shadow-sm`} strokeWidth={2.5} />

      {/* Cycling content */}
      <div className={`flex flex-col items-center transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
        {/* Big metric number */}
        <span className={`text-lg font-black leading-none ${cfg.color} tracking-tight`}>
          {current.metric_value}
        </span>

        {/* Trend icon + compact word */}
        <div className="flex items-center gap-1 mt-0.5">
          <TrendIcon className={`w-3 h-3 ${cfg.color}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>

        {/* Label */}
        <span className="text-[8px] text-muted-foreground leading-tight truncate max-w-full">
          {current.metric_label}
        </span>
      </div>

      {/* Dot indicators */}
      {insights.length > 1 && (
        <div className="flex gap-0.5 mt-0.5">
          {insights.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${i === activeIdx ? "bg-primary" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      )}
    </button>
  );
};
