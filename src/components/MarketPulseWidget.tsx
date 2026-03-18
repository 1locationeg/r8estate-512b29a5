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

function parseNumeric(val: string): { num: number; prefix: string; suffix: string } | null {
  const match = val.match(/^([^\d]*?)([\d,.]+)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], num: parseFloat(match[2].replace(/,/g, "")), suffix: match[3] };
}

function useCountUp(target: number, duration = 1200, trigger: number) {
  const [value, setValue] = useState(0);
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    if (trigger === prevTrigger.current && value !== 0) return;
    prevTrigger.current = trigger;

    let raf: number;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);

  return value;
}

function AnimatedValue({ raw, colorClass }: { raw: string; colorClass: string }) {
  const parsed = parseNumeric(raw);
  const [trigger, setTrigger] = useState(0);
  const prevRaw = useRef(raw);

  useEffect(() => {
    if (raw !== prevRaw.current) {
      prevRaw.current = raw;
      setTrigger((t) => t + 1);
    }
  }, [raw]);

  const animatedNum = useCountUp(parsed?.num ?? 0, 1200, trigger);

  if (!parsed) {
    return <span className={`text-2xl md:text-3xl font-black leading-none ${colorClass} tracking-tight`}>{raw}</span>;
  }

  const formatted = parsed.num >= 1000
    ? animatedNum.toLocaleString()
    : String(animatedNum);

  return (
    <span className={`text-2xl md:text-3xl font-black leading-none ${colorClass} tracking-tight`}>
      {parsed.prefix}{formatted}{parsed.suffix}
    </span>
  );
}

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

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      className={`relative flex flex-col items-center gap-1 p-3 md:p-4 rounded-xl border ${cfg.border} bg-gradient-to-br ${cfg.bg} hover:shadow-lg ${cfg.glow} transition-all text-center group overflow-hidden`}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Insights</span>
      </div>

      <div className={`transition-opacity duration-300 w-full flex flex-col items-center ${fading ? "opacity-0" : "opacity-100"}`}>
        <AnimatedValue raw={current.metric_value} colorClass={cfg.color} />
        <span className="text-[10px] text-muted-foreground leading-snug mt-1">
          {cfg.label}
        </span>
      </div>

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