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

  return (
    <div
      className={cn(
        isCompact
          ? "bg-card border border-border rounded-xl p-3 shadow-sm"
          : darkMode
            ? "mx-3 mb-2 bg-white/5 border border-white/10 rounded-xl p-3"
            : "mx-3 mb-2 bg-secondary/50 border border-border rounded-xl p-3",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-accent" />
          <span className={cn(
            "text-[11px] font-semibold",
            darkMode ? "text-sidebar-foreground" : "text-foreground"
          )}>Leaderboard</span>
        </div>
        <button
          onClick={() => {
            navigate("/leaderboard");
            onNavigate?.();
          }}
          className={cn(
            "text-[10px] font-medium flex items-center gap-0.5 hover:underline",
            darkMode ? "text-sidebar-active" : "text-primary"
          )}
        >
          {isCompact ? "See More" : "View All"} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Period toggle */}
      <div className={cn("flex gap-1", isCompact ? "mb-2" : "mb-2.5")}>
        <button
          onClick={() => setPeriod("week")}
          className={cn(
            "flex items-center gap-1 rounded-md text-[10px] font-medium transition-colors",
            isCompact ? "px-1.5 py-1" : "px-2 py-1",
            period === "week"
              ? darkMode ? "bg-sidebar-active text-white" : "bg-primary text-primary-foreground"
              : darkMode ? "bg-white/5 text-sidebar-muted hover:text-sidebar-foreground" : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="w-2.5 h-2.5" /> This Week
        </button>
        <button
          onClick={() => setPeriod("alltime")}
          className={cn(
            "flex items-center gap-1 rounded-md text-[10px] font-medium transition-colors",
            isCompact ? "px-1.5 py-1" : "px-2 py-1",
            period === "alltime"
              ? darkMode ? "bg-sidebar-active text-white" : "bg-primary text-primary-foreground"
              : darkMode ? "bg-white/5 text-sidebar-muted hover:text-sidebar-foreground" : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="w-2.5 h-2.5" /> All Time
        </button>
      </div>

      {isEmpty ? (
        <p className={cn(
          "text-[10px] text-center py-2",
          darkMode ? "text-sidebar-muted" : "text-muted-foreground"
        )}>
          {period === "week" ? "No activity this week yet" : "No contributors yet"}
        </p>
      ) : (
        <div className={cn("space-y-1.5", isCompact && "space-y-1")}>
          {topEntries.map((entry, i) => {
            const tier = getBuyerTier(entry.total_points);
            const isCurrentUser = user?.id === entry.user_id;
            return (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-2 rounded-lg transition-colors",
                  isCurrentUser
                    ? darkMode ? "bg-sidebar-active/15 border border-sidebar-active/25" : "bg-primary/10 border border-primary/20"
                    : "",
                  isCompact ? "px-2 py-1" : "px-2 py-1.5"
                )}
              >
                <span className={cn(
                  "text-center text-[11px] font-bold",
                  isCompact ? "w-4" : "w-5",
                  i === 0 ? "text-accent" : darkMode ? "text-sidebar-muted" : "text-muted-foreground"
                )}>
                  {i + 1}
                </span>
                <Avatar className={isCompact ? "h-5 w-5" : "h-6 w-6"}>
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className={cn(
                    "text-[9px]",
                    darkMode ? "bg-sidebar-active text-white" : "bg-primary text-primary-foreground"
                  )}>
                    {entry.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "flex-1 text-[11px] font-medium truncate",
                  darkMode ? "text-sidebar-foreground" : "text-foreground"
                )}>
                  {entry.full_name}
                  {isCurrentUser && <span className={cn("ms-1", darkMode ? "text-sidebar-active" : "text-primary")}>(You)</span>}
                </span>
                <span className={cn("text-[10px]", darkMode ? "text-sidebar-muted" : "text-muted-foreground")}>{tier.emoji}</span>
                <span className={cn("text-[10px] font-semibold", darkMode ? "text-sidebar-active" : "text-primary")}>{entry.total_points}</span>
              </div>
            );
          })}

          {isCompact && (
            <button
              onClick={() => {
                navigate("/leaderboard");
                onNavigate?.();
              }}
              className="w-full rounded-lg border border-dashed border-border bg-secondary/40 px-2 py-1.5 text-start"
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
              <div className="flex items-center gap-1 px-2">
                <div className={cn("flex-1 border-t border-dashed", darkMode ? "border-white/10" : "border-border")} />
                <span className={cn("text-[9px]", darkMode ? "text-sidebar-muted" : "text-muted-foreground")}>···</span>
                <div className={cn("flex-1 border-t border-dashed", darkMode ? "border-white/10" : "border-border")} />
              </div>
              <div className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg",
                darkMode ? "bg-sidebar-active/15 border border-sidebar-active/25" : "bg-primary/10 border border-primary/20"
              )}>
                <span className={cn("w-5 text-center text-[11px] font-bold", darkMode ? "text-sidebar-muted" : "text-muted-foreground")}>
                  {userRank}
                </span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={userEntry.avatar_url || undefined} />
                  <AvatarFallback className={cn(
                    "text-[9px]",
                    darkMode ? "bg-sidebar-active text-white" : "bg-primary text-primary-foreground"
                  )}>
                    {userEntry.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "flex-1 text-[11px] font-medium truncate",
                  darkMode ? "text-sidebar-foreground" : "text-foreground"
                )}>
                  {userEntry.full_name}
                  <span className={cn("ms-1", darkMode ? "text-sidebar-active" : "text-primary")}>(You)</span>
                </span>
                <span className={cn("text-[10px]", darkMode ? "text-sidebar-muted" : "text-muted-foreground")}>
                  {getBuyerTier(userEntry.total_points).emoji}
                </span>
                <span className={cn("text-[10px] font-semibold", darkMode ? "text-sidebar-active" : "text-primary")}>{userEntry.total_points}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
