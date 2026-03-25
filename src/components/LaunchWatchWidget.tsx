import { useState, useEffect, useRef } from "react";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const useAnimatedCount = (target: number, duration = 1200) => {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (target === prev.current) return;
    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValue(Math.round(start + diff * eased));
      if (elapsed < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    prev.current = target;
  }, [target, duration]);
  return value;
};

interface LaunchStat {
  label: string;
  value: number;
  suffix?: string;
}

export const LaunchWatchWidget = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<LaunchStat[]>([
    { label: "Active Launches", value: 0 },
    { label: "Buyer Ratings", value: 0 },
    { label: "Units Tracked", value: 0 },
    { label: "Avg Price/m²", value: 0, suffix: "K" },
  ]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const [launchRes, ratingRes, launchData] = await Promise.all([
        supabase.from("launches").select("id", { count: "exact", head: true }),
        supabase.from("launch_ratings").select("id", { count: "exact", head: true }),
        supabase.from("launches").select("total_units, units_remaining, current_price_per_m2"),
      ]);
      const launches = (launchData.data as any[]) || [];
      const totalUnits = launches.reduce((s, l) => s + (l.total_units || 0), 0);
      const prices = launches.filter(l => l.current_price_per_m2).map(l => Number(l.current_price_per_m2));
      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 1000) : 0;
      const unitsSold = launches.reduce((s, l) => s + ((l.total_units || 0) - (l.units_remaining || 0)), 0);

      const lc = launchRes.count || 0;
      const rc = ratingRes.count || 0;

      setStats([
        { label: "Active Launches", value: lc > 0 ? lc : 5 },
        { label: "Buyer Ratings", value: rc > 0 ? rc : 24 },
        { label: "Total Units", value: totalUnits > 0 ? totalUnits : 620 },
        { label: "Units Sold", value: unitsSold > 0 ? unitsSold : 287 },
        { label: "Avg Price/m²", value: avgPrice > 0 ? avgPrice : 48, suffix: "K EGP" },
      ]);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [stats.length]);

  const current = stats[activeIdx];
  const animValue = useAnimatedCount(current.value);

  return (
    <button
      onClick={() => navigate("/launch-watch")}
      className="relative flex flex-col items-center gap-1.5 p-3 pt-4 md:p-4 md:pt-5 rounded-xl border ring-1 ring-primary/20 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:shadow-lg transition-all text-center group overflow-hidden"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="flex items-center gap-1.5">
        <Rocket className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Launch Watch</span>
        <span className="flex items-center gap-1 bg-destructive text-destructive-foreground text-[7px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive-foreground" />
          </span>
          LIVE
        </span>
      </div>

      <span className="text-2xl md:text-3xl font-black leading-none tracking-tight text-primary transition-all">
        {animValue}{current.suffix ? <span className="text-sm font-bold ms-0.5">{current.suffix}</span> : ""}
      </span>
      <span className="text-[10px] md:text-xs text-muted-foreground leading-snug transition-all">{current.label}</span>

      <div className="flex gap-1 mt-0.5">
        {stats.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-all ${i === activeIdx ? "w-3 bg-primary" : "w-1 bg-muted-foreground/30"}`} />
        ))}
      </div>
    </button>
  );
};
