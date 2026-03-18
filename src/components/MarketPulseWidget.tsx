import { useState, useEffect, useRef } from "react";
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
  up: { Icon: TrendingUp, label: "Rising", color: "text-trust-excellent", border: "border-trust-excellent/40", bg: "from-trust-excellent/20 to-trust-excellent/5", glow: "shadow-trust-excellent/20", iconColor: "text-trust-excellent" },
  down: { Icon: TrendingDown, label: "Cooling", color: "text-destructive", border: "border-destructive/40", bg: "from-destructive/20 to-destructive/5", glow: "shadow-destructive/20", iconColor: "text-destructive" },
  stable: { Icon: Minus, label: "Steady", color: "text-muted-foreground", border: "border-border", bg: "from-secondary/40 to-secondary/10", glow: "shadow-muted/10", iconColor: "text-muted-foreground" },
  alert: { Icon: AlertTriangle, label: "Watch", color: "text-accent", border: "border-accent/40", bg: "from-accent/20 to-accent/5", glow: "shadow-accent/20", iconColor: "text-accent" },
};

export const MarketPulseWidget = ({ onClick }: { onClick: () => void }) => {
  const { user, role } = useAuth();
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoveredRef = useRef(false);

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

  useEffect(() => {
    if (insights.length <= 1) return;
    intervalRef.current = setInterval(() => {
      if (hoveredRef.current) return;
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
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      className={`relative flex items-center gap-3 p-3 md:p-4 rounded-xl border ${cfg.border} bg-gradient-to-br ${cfg.bg} hover:shadow-lg ${cfg.glow} transition-all text-start group overflow-hidden col-span-2 md:col-span-1`}
    >
      {/* Icon on the side */}
      <div className="w-10 h-10 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
        <Sparkles className={`w-5 h-5 ${cfg.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Insights</span>

        <div className={`transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
          <span className={`text-xl font-black leading-none ${cfg.color} tracking-tight block mt-0.5`}>
            {current.metric_value}
          </span>

          <div className="flex items-center gap-1 mt-1">
            <TrendIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              · {current.metric_label}
            </span>
          </div>
        </div>

        {/* Dot indicators */}
        {insights.length > 1 && (
          <div className="flex gap-0.5 mt-1.5">
            {insights.map((_, i) => (
              <span
                key={i}
                className={`w-1 h-1 rounded-full transition-colors ${i === activeIdx ? "bg-primary" : "bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
