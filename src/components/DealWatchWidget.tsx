import { useState, useEffect, useRef } from "react";
import { Tag, TrendingUp, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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

interface DealStat {
  value: string;
  label: string;
}

export const DealWatchWidget = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DealStat[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, count } = await supabase
        .from("deals" as any)
        .select("avg_rating, rating_count", { count: "exact" })
        .eq("status", "verified");

      const deals = (data as any[]) || [];
      const totalDeals = count || deals.length;
      const totalRatings = deals.reduce((s: number, d: any) => s + (Number(d.rating_count) || 0), 0);
      const avgRating = deals.length > 0
        ? (deals.reduce((s: number, d: any) => s + (Number(d.avg_rating) || 0), 0) / deals.length)
        : 0;

      const items: DealStat[] = [
        { value: String(totalDeals), label: "Verified Deals" },
        { value: String(totalRatings), label: "Buyer Ratings" },
      ];
      if (avgRating > 0) {
        items.push({ value: avgRating.toFixed(1), label: "Avg Deal Rating" });
      }
      setStats(items.length > 0 ? items : [{ value: "0", label: "Deals Live" }]);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats.length <= 1) return;
    intervalRef.current = setInterval(() => {
      if (hoveredRef.current) return;
      setFading(true);
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % stats.length);
        setFading(false);
      }, 300);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [stats.length]);

  const current = stats[activeIdx] || { value: "—", label: "Deal Watch" };
  const numVal = parseInt(current.value) || 0;
  const animatedNum = useCountUp(numVal, 1200, activeIdx);
  const isDecimal = current.value.includes(".");

  return (
    <button
      onClick={() => navigate("/deal-watch")}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      className="relative flex flex-col items-center gap-1 p-3 md:p-4 rounded-xl border border-accent/40 bg-gradient-to-br from-accent/20 to-accent/5 hover:shadow-lg shadow-accent/20 transition-all text-center group overflow-hidden"
    >
      <div className="flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-accent" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Deal Watch</span>
      </div>

      <div className={`transition-opacity duration-300 w-full flex flex-col items-center ${fading ? "opacity-0" : "opacity-100"}`}>
        <span className="text-2xl md:text-3xl font-black leading-none text-accent tracking-tight">
          {isDecimal ? current.value : animatedNum}
        </span>
        <span className="text-[10px] text-muted-foreground leading-snug mt-1">
          {current.label}
        </span>
      </div>

      {stats.length > 1 && (
        <div className="flex gap-0.5 mt-0.5">
          {stats.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${i === activeIdx ? "bg-accent" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      )}
    </button>
  );
};
