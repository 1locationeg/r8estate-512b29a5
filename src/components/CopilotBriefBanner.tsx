import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getStationForRoute } from "@/lib/journeyStations";

export const CopilotBriefBanner = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [briefLine, setBriefLine] = useState("");
  const [stats, setStats] = useState({ saved: 0, followed: 0, reviews: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchContext = async () => {
      const [savedRes, followedRes, reviewsRes] = await Promise.all([
        supabase.from("saved_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("followed_businesses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      const s = savedRes.count || 0;
      const f = followedRes.count || 0;
      const r = reviewsRes.count || 0;
      setStats({ saved: s, followed: f, reviews: r });

      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
      const name = profile?.full_name?.split(" ")[0] || "";
      
      const lines: string[] = [];
      if (f > 0) lines.push(`You're tracking ${f} ${f === 1 ? "company" : "companies"}.`);
      if (s > 0) lines.push(`${s} saved ${s === 1 ? "item" : "items"} in your shortlist.`);
      if (r > 0) lines.push(`${r} new verified reviews this week.`);
      if (lines.length === 0) lines.push("Start by searching for a developer or exploring categories.");

      setBriefLine(`${greeting}${name ? `, ${name}` : ""}. ${lines[0]}`);
    };
    fetchContext();
  }, [user, profile]);

  if (!user) return null;

  const station = getStationForRoute(window.location.pathname);

  return (
    <div className="w-full max-w-[1100px] mx-auto mb-2">
      <button
        onClick={() => navigate("/copilot")}
        className="w-full flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-accent/[0.04] to-transparent backdrop-blur-sm px-4 py-3 text-start group hover:border-primary/40 transition-all"
      >
        <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary/80 tracking-wide uppercase mb-0.5">
            R8 Copilot
          </p>
          <p className="text-sm text-foreground/80 truncate">
            {briefLine || "Loading your personalized brief..."}
          </p>
        </div>
        {station && (
          <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${station.bgTintClass} ${station.textClass}`}>
            {station.emoji} {t(station.labelKey)}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </button>
    </div>
  );
};
