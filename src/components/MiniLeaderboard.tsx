import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ChevronRight, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBuyerTier } from "@/lib/buyerGamification";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
}

interface MiniLeaderboardProps {
  onNavigate?: () => void;
  variant?: "default" | "compact";
  className?: string;
  darkMode?: boolean;
}

export const MiniLeaderboard = ({ onNavigate, variant = "default", className, darkMode }: MiniLeaderboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "alltime">("week");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const rpcName = period === "week" ? "get_weekly_leaderboard" : "get_leaderboard";
      const { data } = await supabase.rpc(rpcName, { _limit: 50 });
      if (data) {
        setEntries(data as LeaderboardEntry[]);
        if (user) {
          const idx = (data as LeaderboardEntry[]).findIndex((e) => e.user_id === user.id);
          setUserRank(idx >= 0 ? idx + 1 : 0);
        }
      } else {
        setEntries([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, period]);

  if (loading) return null;

  const isCompact = variant === "compact";
  const topEntries = entries.slice(0, isCompact ? 2 : 3);
  const userEntry = user ? entries.find((e) => e.user_id === user.id) : null;
  const showUserSeparately = userRank > 3 && userEntry;
  const isEmpty = entries.length === 0;

  const rankColors = ["text-coin", "text-muted-foreground", "text-orange-400"];

  const renderRow = (entry: LeaderboardEntry, i: number, isUserRow = false) => {
    const tier = getBuyerTier(entry.total_points);
    const isCurrentUser = user?.id === entry.user_id;
    const rankIdx = isUserRow ? userRank - 1 : i;

    return (
      <div
        key={entry.user_id}
        className={cn(
          "flex items-center gap-2.5 py-2",
          !isUserRow && "border-b last:border-b-0",
          darkMode ? "border-white/5" : "border-border",
          (isCurrentUser || isUserRow) && (
            darkMode
              ? "bg-sidebar-active/10 rounded-lg px-2.5 py-2 -mx-1 border-none"
              : "bg-primary/5 rounded-lg px-2.5 py-2 -mx-1 border-none"
          )
        )}
      >
        {/* Rank */}
        <span className={cn(
          "w-[18px] text-center text-[13px] font-extrabold flex-shrink-0",
          rankIdx < 3 ? rankColors[rankIdx] : (darkMode ? "text-sidebar-muted" : "text-muted-foreground"),
          isUserRow && "text-[11px]"
        )}>
          {isUserRow ? userRank : i + 1}
        </span>

        {/* Avatar with tier badge + status dot */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-[34px] w-[34px]">
            <AvatarImage src={entry.avatar_url || undefined} />
            <AvatarFallback className={cn(
              "text-[11px] font-bold text-white",
              i === 0 ? "bg-coin" : darkMode ? "bg-sidebar-active" : "bg-primary"
            )}>
              {entry.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* Tier badge — top-end */}
          <span className={cn(
            "absolute -top-[3px] -end-[3px] w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center text-[7px] leading-none",
            darkMode ? "border-sidebar-bg" : "border-card",
            tier.id === 'newcomer' ? "bg-muted-foreground" : "bg-coin"
          )}>
            {tier.emoji}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-[13px] font-semibold truncate",
            darkMode ? "text-sidebar-foreground" : "text-foreground"
          )}>
            {entry.full_name}
            {isCurrentUser && (
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0 rounded-full ms-1.5 align-middle",
                darkMode ? "bg-sidebar-active/20 text-sidebar-active" : "bg-primary/10 text-primary"
              )}>You</span>
            )}
          </div>
          <div className={cn(
            "text-[10.5px] mt-0.5",
            darkMode ? "text-sidebar-muted" : "text-muted-foreground"
          )}>
            {tier.name} · {entry.total_points} pts
          </div>
        </div>

        {/* Points */}
        <div className={cn(
          "text-[13px] font-bold flex items-center gap-1 flex-shrink-0",
          i === 0 && !isUserRow ? "text-coin" : (darkMode ? "text-sidebar-active" : "text-primary")
        )}>
          <Trophy className="w-[11px] h-[11px]" />
          {entry.total_points}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        isCompact
          ? "bg-card border border-border rounded-xl p-3 shadow-sm"
          : darkMode
            ? "mx-3 mb-2 bg-white/[.04] border border-white/10 rounded-2xl overflow-hidden"
            : "mx-3 mb-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-3.5 py-3",
        darkMode ? "border-b border-white/10" : "border-b border-border"
      )}>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-coin" />
          <span className={cn(
            "text-xs font-bold uppercase tracking-wide",
            darkMode ? "text-sidebar-foreground" : "text-foreground"
          )}>Top Reviewers</span>
        </div>
        <button
          onClick={() => {
            navigate("/leaderboard");
            onNavigate?.();
          }}
          className={cn(
            "text-xs font-semibold flex items-center gap-0.5 hover:underline",
            darkMode ? "text-sidebar-active" : "text-primary"
          )}
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Period toggle */}
      <div className={cn(
        "flex mx-3.5 mt-2.5 rounded-full p-0.5 gap-0.5",
        darkMode ? "bg-white/5 border border-white/10" : "bg-secondary border border-border"
      )}>
        <button
          onClick={() => setPeriod("week")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 rounded-full text-[11px] font-semibold py-1.5 transition-all",
            period === "week"
              ? darkMode ? "bg-sidebar-active text-white shadow-sm" : "bg-card text-foreground shadow-sm"
              : darkMode ? "text-sidebar-muted hover:text-sidebar-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="w-2.5 h-2.5" /> This Week
        </button>
        <button
          onClick={() => setPeriod("alltime")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 rounded-full text-[11px] font-semibold py-1.5 transition-all",
            period === "alltime"
              ? darkMode ? "bg-sidebar-active text-white shadow-sm" : "bg-card text-foreground shadow-sm"
              : darkMode ? "text-sidebar-muted hover:text-sidebar-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="w-2.5 h-2.5" /> All Time
        </button>
      </div>

      {isEmpty ? (
        <p className={cn(
          "text-[10px] text-center py-4",
          darkMode ? "text-sidebar-muted" : "text-muted-foreground"
        )}>
          {period === "week" ? "No activity this week yet" : "No contributors yet"}
        </p>
      ) : (
        <div className="px-3.5 py-1.5">
          {topEntries.map((entry, i) => renderRow(entry, i))}

          {isCompact && (
            <button
              onClick={() => {
                navigate("/leaderboard");
                onNavigate?.();
              }}
              className="w-full rounded-lg border border-dashed border-border bg-secondary/40 px-2 py-1.5 text-start mt-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-foreground">
                    {userRank > 0 ? `You're #${userRank} right now` : "Track the full ranking live"}
                  </p>
                  <p className="text-[9px] text-muted-foreground">Open the full board to compare trends and weekly movement.</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              </div>
            </button>
          )}

          {!isCompact && showUserSeparately && (
            <>
              <div className="flex items-center gap-1 px-2 py-1">
                <div className={cn("flex-1 border-t border-dashed", darkMode ? "border-white/10" : "border-border")} />
                <span className={cn("text-[9px]", darkMode ? "text-sidebar-muted" : "text-muted-foreground")}>···</span>
                <div className={cn("flex-1 border-t border-dashed", darkMode ? "border-white/10" : "border-border")} />
              </div>
              {renderRow(userEntry!, userRank - 1, true)}
            </>
          )}
        </div>
      )}
    </div>
  );
};
