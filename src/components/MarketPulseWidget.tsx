import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PulseData {
  score: number;
  trend: "up" | "down" | "stable" | "alert";
  label: string;
  detail: string;
}

const getScoreStyle = (score: number) => {
  if (score >= 80) return { bg: "from-trust-excellent/20 to-trust-excellent/5", border: "border-trust-excellent/40", text: "text-trust-excellent", glow: "shadow-trust-excellent/20" };
  if (score >= 60) return { bg: "from-trust-good/20 to-trust-good/5", border: "border-trust-good/40", text: "text-trust-good", glow: "shadow-trust-good/20" };
  if (score >= 40) return { bg: "from-accent/20 to-accent/5", border: "border-accent/40", text: "text-accent", glow: "shadow-accent/20" };
  return { bg: "from-destructive/20 to-destructive/5", border: "border-destructive/40", text: "text-destructive", glow: "shadow-destructive/20" };
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
  alert: AlertTriangle,
};

const trendLabels = {
  up: "Rising",
  down: "Cooling",
  stable: "Steady",
  alert: "Watch",
};

export const MarketPulseWidget = ({ onClick }: { onClick: () => void }) => {
  const { user } = useAuth();
  const [pulse, setPulse] = useState<PulseData>({
    score: 72,
    trend: "up",
    label: "Market Pulse",
    detail: "Active & growing",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        // Fetch real counts to derive a "market pulse" score
        const [reviewsRes, guestRes, businessRes] = await Promise.all([
          supabase.from("reviews").select("id", { count: "exact", head: true }),
          supabase.from("guest_reviews").select("id", { count: "exact", head: true }),
          supabase.from("business_profiles").select("id", { count: "exact", head: true }),
        ]);

        const totalReviews = (reviewsRes.count || 0) + (guestRes.count || 0);
        const totalBiz = businessRes.count || 0;

        // Derive a pulse score from activity (simple heuristic)
        const activityScore = Math.min(99, Math.max(10,
          Math.round((totalReviews * 2 + totalBiz * 5) / 3)
        ));

        let trend: PulseData["trend"] = "stable";
        let detail = "Market is steady";
        if (activityScore >= 70) { trend = "up"; detail = "Active & growing"; }
        else if (activityScore >= 40) { trend = "stable"; detail = "Moderate activity"; }
        else if (activityScore >= 20) { trend = "down"; detail = "Low activity"; }
        else { trend = "alert"; detail = "Needs attention"; }

        setPulse({
          score: activityScore,
          trend,
          label: "Market Pulse",
          detail,
        });
        setLoaded(true);
      } catch {
        setLoaded(true);
      }
    };

    fetchSnapshot();
  }, [user]);

  const style = getScoreStyle(pulse.score);
  const TrendIcon = trendIcons[pulse.trend];

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0 p-2 rounded-xl border ${style.border} bg-gradient-to-br ${style.bg} hover:shadow-lg ${style.glow} transition-all text-center group overflow-hidden col-span-2 md:col-span-1`}
    >
      {/* Subtle animated background pulse */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${style.bg} opacity-50 animate-pulse pointer-events-none`} />

      {/* Icon + label */}
      <div className="relative z-10 flex items-center gap-1.5">
        <Activity className={`w-4 h-4 ${style.text}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {pulse.label}
        </span>
      </div>

      {/* Trend icon + label */}
      <div className="relative z-10 flex items-center gap-1 mt-0.5">
        <TrendIcon className={`w-4 h-4 ${style.text}`} />
        <span className={`text-xs font-bold ${style.text}`}>
          {trendLabels[pulse.trend]}
        </span>
      </div>

      {/* Descriptive text */}
      <span className="relative z-10 text-[10px] text-muted-foreground leading-tight mt-0.5">
        {pulse.detail}
      </span>

      {/* Sparkle decoration */}
      <Sparkles className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
    </button>
  );
};
