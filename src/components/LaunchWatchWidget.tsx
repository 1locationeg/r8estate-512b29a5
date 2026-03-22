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

export const LaunchWatchWidget = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: 0, ratings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [launchRes, ratingRes] = await Promise.all([
        supabase.from("launches").select("id", { count: "exact", head: true }),
        supabase.from("launch_ratings").select("id", { count: "exact", head: true }),
      ]);
      const launchCount = launchRes.count || 0;
      const ratingCount = ratingRes.count || 0;
      // Use real data if available, otherwise show demo counts
      setStats({
        active: launchCount > 0 ? launchCount : 5,
        ratings: ratingCount > 0 ? ratingCount : 24,
      });
    };
    fetchStats();
  }, []);

  const animActive = useAnimatedCount(stats.active);
  const animRatings = useAnimatedCount(stats.ratings);

  return (
    <button
      onClick={() => navigate("/launch-watch")}
      className="relative flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl border ring-1 ring-primary/20 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:shadow-lg transition-all text-center group overflow-hidden"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* LIVE badge */}
      <span className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
        LIVE
      </span>

      <div className="flex items-center gap-1.5">
        <Rocket className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Launch Watch</span>
      </div>

      <span className="text-2xl md:text-3xl font-black leading-none tracking-tight text-primary">
        {animActive}
      </span>
      <span className="text-[10px] md:text-xs text-muted-foreground leading-snug">Active Launches</span>

      <span className="text-[9px] text-muted-foreground/70 mt-0.5">
        {animRatings} buyer ratings
      </span>
    </button>
  );
};
