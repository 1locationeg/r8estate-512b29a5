// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { Star, Share2, Eye, Rocket, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, GitCompare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LaunchCardProps {
  launch: any;
  phases?: any[];
  ratings?: any[];
  onRate?: () => void;
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
      });
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

const statusConfig: Record<string, { bg: string; label: string }> = {
  reservations_open: { bg: "bg-teal-600", label: "Reservations Open" },
  upcoming: { bg: "bg-amber-500", label: "Launching Soon" },
  active: { bg: "bg-primary", label: "Now Selling" },
  sold_out: { bg: "bg-muted-foreground", label: "Sold Out" },
};

export const LaunchCard = ({ launch, phases = [], ratings = [], onRate }: LaunchCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPhases, setShowPhases] = useState(false);
  const [showRatingBreakdown, setShowRatingBreakdown] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const countdown = useCountdown(launch.status === "upcoming" ? launch.launch_date : null);

  const biz = launch.business_profiles;
  const status = statusConfig[launch.status] || statusConfig.upcoming;
  const unitsSold = (launch.total_units || 0) - (launch.units_remaining || 0);
  const unitsPct = launch.total_units > 0 ? (unitsSold / launch.total_units) * 100 : 0;

  // Avg ratings
  const avgScores = useMemo(() => {
    if (!ratings.length) return null;
    const sum = { price: 0, transparency: 0, payment: 0, location: 0, overall: 0 };
    ratings.forEach((r: any) => {
      sum.price += r.stars_price_fairness;
      sum.transparency += r.stars_developer_transparency;
      sum.payment += r.stars_payment_terms;
      sum.location += r.stars_location_value;
      sum.overall += r.stars_overall;
    });
    const n = ratings.length;
    return {
      price: sum.price / n,
      transparency: sum.transparency / n,
      payment: sum.payment / n,
      location: sum.location / n,
      overall: sum.overall / n,
      avg: (sum.price + sum.transparency + sum.payment + sum.location + sum.overall) / (n * 5),
      count: n,
    };
  }, [ratings]);

  const r8Score = avgScores ? avgScores.avg : 0;

  // Phase price increase
  const sortedPhases = [...phases].sort((a, b) => a.phase_number - b.phase_number);
  const firstPrice = sortedPhases[0]?.price_per_m2;
  const currentPrice = launch.current_price_per_m2;
  const priceIncreasePct = firstPrice && currentPrice && firstPrice > 0
    ? (((currentPrice - firstPrice) / firstPrice) * 100).toFixed(0)
    : null;

  // Check watchlist
  useEffect(() => {
    if (!user) return;
    supabase
      .from("launch_watchlist" as any)
      .select("id")
      .eq("launch_id", launch.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setIsWatched(!!data));
  }, [user, launch.id]);

  const toggleWatch = async () => {
    if (!user) { navigate("/auth"); return; }
    setWatchLoading(true);
    try {
      if (isWatched) {
        await supabase.from("launch_watchlist" as any).delete().eq("launch_id", launch.id).eq("user_id", user.id);
        setIsWatched(false);
        toast.success("Removed from watchlist");
      } else {
        await supabase.from("launch_watchlist" as any).insert({ launch_id: launch.id, user_id: user.id } as any);
        setIsWatched(true);
        toast.success("Added to watchlist — you'll be notified of changes");
      }
    } catch { toast.error("Failed to update watchlist"); }
    setWatchLoading(false);
  };

  const subScoreLabels = [
    { key: "price", label: "Price fairness" },
    { key: "transparency", label: "Developer reputation" },
    { key: "payment", label: "Payment terms" },
    { key: "location", label: "Location value" },
    { key: "overall", label: "Transparency on launch day" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Status bar */}
      <div className={`${status.bg} text-white px-4 py-2 text-sm font-semibold flex items-center justify-between`}>
        <span>
          {launch.status === "active"
            ? `Now Selling — Phase ${launch.current_phase}`
            : status.label}
        </span>
        {launch.status === "upcoming" && (
          <span className="text-xs font-mono bg-white/20 rounded px-2 py-0.5">
            {countdown.days}d : {countdown.hours}h : {countdown.mins}m
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Avatar className="h-9 w-9 ring-2 ring-primary/10">
            {biz?.logo_url && <img src={biz.logo_url} alt="" className="w-full h-full object-cover rounded-full" />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {(biz?.company_name || "B")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground leading-tight">{launch.project_name}</h3>
            <p className="text-xs text-muted-foreground">
              {biz?.company_name || "Developer"} · {launch.location_district}
              {launch.location_compound ? ` · ${launch.location_compound}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {launch.is_verified && (
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-[10px]">
                ✓ Verified Launch
              </Badge>
            )}
            {!launch.is_verified && (
              <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">
                Unverified
              </Badge>
            )}
            <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 text-[10px]">
              Submitted by developer
            </Badge>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Price per m² */}
          <div className="bg-secondary/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground font-medium">Launch Price</p>
            <p className="text-sm font-bold text-foreground">
              EGP {launch.current_price_per_m2 ? Number(launch.current_price_per_m2).toLocaleString() : "—"} / m²
            </p>
          </div>

          {/* Payment */}
          <div className="bg-secondary/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground font-medium">Payment Plan</p>
            <p className="text-sm font-bold text-foreground">
              {launch.down_payment_pct ? `${Number(launch.down_payment_pct)}% down` : "—"}
              {launch.installment_years ? ` · ${launch.installment_years}y` : ""}
            </p>
          </div>

          {/* Delivery */}
          <div className="bg-secondary/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground font-medium">Delivery</p>
            <p className="text-sm font-bold text-foreground">
              {launch.delivery_date ? new Date(launch.delivery_date).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "—"}
            </p>
          </div>

          {/* Units */}
          <div className="bg-secondary/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground font-medium">Units</p>
            <p className="text-sm font-bold text-foreground">
              {launch.units_remaining ?? "—"} / {launch.total_units ?? "—"} remaining
            </p>
            {launch.total_units > 0 && (
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${unitsPct}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* R8 Launch Score */}
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">R8 Launch Score:</span>
          {avgScores ? (
            <>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(r8Score * 5) ? "text-accent fill-accent" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">{(r8Score * 5).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({avgScores.count} ratings)</span>
              <button onClick={() => setShowRatingBreakdown(!showRatingBreakdown)} className="text-xs text-primary font-medium ml-1">
                {showRatingBreakdown ? "Hide" : "Details"}
              </button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No ratings yet</span>
          )}
        </div>

        {/* Rating breakdown */}
        {showRatingBreakdown && avgScores && (
          <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
            {subScoreLabels.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-32 shrink-0">{s.label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${((avgScores as any)[s.key] / 5) * 100}%` }} />
                </div>
                <span className="text-[10px] font-bold text-foreground w-6 text-end">
                  {((avgScores as any)[s.key]).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Phase history */}
        {sortedPhases.length > 0 && (
          <Collapsible open={showPhases} onOpenChange={setShowPhases}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary font-medium w-full">
              {showPhases ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Phase History
              {priceIncreasePct && Number(priceIncreasePct) > 0 && (
                <Badge variant="outline" className="text-[9px] ml-1 border-red-300 text-red-600">
                  +{priceIncreasePct}% since reservation
                </Badge>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {sortedPhases.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-1 shrink-0">
                    <div className={`flex flex-col items-center ${p.phase_number === launch.current_phase ? "" : ""}`}>
                      <div className={`w-3 h-3 rounded-full ${p.phase_number === launch.current_phase ? "bg-amber-500 ring-2 ring-amber-200" : "bg-muted-foreground/30"}`} />
                      <span className="text-[9px] font-bold mt-0.5">EGP {Number(p.price_per_m2).toLocaleString()}</span>
                      <span className="text-[8px] text-muted-foreground">Phase {p.phase_number}</span>
                    </div>
                    {i < sortedPhases.length - 1 && <div className="h-px w-6 bg-border mt-[-8px]" />}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="text-xs bg-primary text-primary-foreground"
            onClick={() => {
              if (!user) { navigate("/auth"); return; }
              onRate?.();
            }}
          >
            <Rocket className="w-3 h-3 mr-1" />
            Rate this launch
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={toggleWatch}
            disabled={watchLoading}
          >
            {isWatched ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5" />}
            {isWatched ? "Watching" : "Watch this launch"}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto">
            <Share2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
