import { useState, useEffect, useRef } from "react";
import { Tag, Clock, Flame, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DealHighlight {
  headline: string;
  deal_type: string;
  rating_count: number;
  valid_until: string | null;
  created_at: string;
}

const typeIcons: Record<string, typeof Flame> = {
  payment_plan: Clock,
  discount: Zap,
  early_access: Flame,
  exclusive_units: Tag,
  other: Tag,
};

export const DealWatchWidget = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealHighlight[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from("deals" as any)
        .select("headline, deal_type, rating_count, valid_until, created_at")
        .eq("status", "verified")
        .order("created_at", { ascending: false })
        .limit(6);

      const items = ((data as unknown) as DealHighlight[]) || [];
      if (items.length === 0) {
        // Fallback showcase headlines
        setDeals([
          { headline: "0% Downpayment Available", deal_type: "payment_plan", rating_count: 0, valid_until: null, created_at: new Date().toISOString() },
          { headline: "15 Years Installment Plan", deal_type: "payment_plan", rating_count: 0, valid_until: null, created_at: new Date().toISOString() },
          { headline: "10% Loading Ratio Only", deal_type: "discount", rating_count: 0, valid_until: null, created_at: new Date().toISOString() },
        ]);
      } else {
        setDeals(items);
      }
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    if (deals.length <= 1) return;
    intervalRef.current = setInterval(() => {
      if (hoveredRef.current) return;
      setFading(true);
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % deals.length);
        setFading(false);
      }, 250);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [deals.length]);

  const current = deals[activeIdx];
  if (!current) return null;

  const Icon = typeIcons[current.deal_type] || Tag;
  const isNew = (Date.now() - new Date(current.created_at).getTime()) < 7 * 86400000;
  const isExpiring = current.valid_until && (new Date(current.valid_until).getTime() - Date.now()) < 14 * 86400000 && new Date(current.valid_until).getTime() > Date.now();
  const isPopular = (current.rating_count || 0) >= 10;

  // Urgency color: expiring > popular > new > default
  const urgencyRing = isExpiring
    ? "ring-destructive/40 border-destructive/50"
    : isPopular
    ? "ring-orange-400/30 border-orange-400/50"
    : isNew
    ? "ring-accent/40 border-accent/50"
    : "ring-accent/20 border-accent/40";

  const urgencyGlow = isExpiring
    ? "from-destructive/15 via-destructive/5 to-transparent"
    : isPopular
    ? "from-orange-400/15 via-orange-300/5 to-transparent"
    : "from-accent/15 via-accent/5 to-transparent";

  const iconColor = isExpiring
    ? "text-destructive"
    : isPopular
    ? "text-orange-500"
    : "text-accent";

  return (
    <button
      onClick={() => navigate("/deal-watch")}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      className={`relative flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl border ring-1 bg-gradient-to-br ${urgencyRing} ${urgencyGlow} hover:shadow-lg transition-all text-center group overflow-hidden`}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Pulse dot for urgency */}
      {(isExpiring || isPopular) && (
        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isExpiring ? "bg-destructive" : "bg-orange-500"} animate-pulse`} />
      )}

      {/* Icon + label */}
      <div className="flex items-center gap-1.5">
        <Icon className={`w-4 h-4 ${iconColor} transition-transform group-hover:scale-110`} />
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Deal Watch</span>
      </div>

      {/* Deal headline ticker */}
      <div className={`transition-all duration-300 w-full flex flex-col items-center ${fading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}>
        {(() => {
          const match = current.headline.match(/^([\d.,]+\s*%?)/);
          if (match) {
            const num = match[1].trim();
            const rest = current.headline.slice(match[0].length).trim();
            return (
              <>
                <span className={`text-2xl md:text-3xl font-black leading-none tracking-tight ${iconColor}`}>{num}</span>
                <span className="text-[10px] md:text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-1 px-1">{rest}</span>
              </>
            );
          }
          return (
            <>
              <span className={`text-lg md:text-xl font-black leading-tight tracking-tight ${iconColor}`}>{current.headline.split(" ").slice(0, 2).join(" ")}</span>
              <span className="text-[10px] md:text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-1 px-1">{current.headline.split(" ").slice(2).join(" ")}</span>
            </>
          );
        })()}
      </div>

      {/* Progress bar / dots */}
      {deals.length > 1 && (
        <div className="flex gap-1 mt-0.5">
          {deals.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeIdx
                  ? `w-4 ${isExpiring ? "bg-destructive" : isPopular ? "bg-orange-500" : "bg-accent"}`
                  : "w-1 bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
      )}
    </button>
  );
};
