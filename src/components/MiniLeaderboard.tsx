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
}

export const MiniLeaderboard = ({ onNavigate, variant = "default", className }: MiniLeaderboardProps) => {
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

  // Show top 3 + current user if not in top 3
  const topEntries = entries.slice(0, isCompact ? 2 : 3);
  const userEntry = user ? entries.find((e) => e.user_id === user.id) : null;
  const showUserSeparately = userRank > 3 && userEntry;
  const isEmpty = entries.length === 0;

  return (
    <div
      className={cn(
        isCompact
          ? "bg-card border border-border rounded-xl p-3 shadow-sm"
          : "mx-3 mb-2 bg-secondary/50 border border-border rounded-xl p-3",
        className
      )}
    >
      <div className={cn("flex items-center justify-between", isCompact ? "mb-2" : "mb-2")}>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] font-semibold text-foreground">Leaderboard</span>
        </div>
        <button
          onClick={() => {
            navigate("/leaderboard");
            onNavigate?.();
          }}
          className="text-[10px] text-primary font-medium flex items-center gap-0.5 hover:underline"
        >
          {isCompact ? "See More" : "View All"} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Period toggle */}
      <div className={cn("flex gap-1", isCompact ? "mb-2" : "mb-2.5")}>
        <button
          onClick={() => setPeriod("week")}
          className={`flex items-center gap-1 rounded-md text-[10px] font-medium transition-colors ${
            period === "week"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground"
          } ${isCompact ? "px-1.5 py-1" : "px-2 py-1"}`}
        >
          <Calendar className="w-2.5 h-2.5" /> This Week
        </button>
        <button
          onClick={() => setPeriod("alltime")}
          className={`flex items-center gap-1 rounded-md text-[10px] font-medium transition-colors ${
            period === "alltime"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground"
          } ${isCompact ? "px-1.5 py-1" : "px-2 py-1"}`}
        >
          <Clock className="w-2.5 h-2.5" /> All Time
        </button>
      </div>

      {isEmpty ? (
        <p className="text-[10px] text-muted-foreground text-center py-2">
          {period === "week" ? "No activity this week yet" : "No contributors yet"}
        </p>
      ) : (
        <div className={cn("space-y-1.5", isCompact && "space-y-1") }>
          {topEntries.map((entry, i) => {
            const tier = getBuyerTier(entry.total_points);
            const isCurrentUser = user?.id === entry.user_id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-2 rounded-lg transition-colors ${
                  isCurrentUser ? "bg-primary/10 border border-primary/20" : ""
                } ${isCompact ? "px-2 py-1" : "px-2 py-1.5"}`}
              >
                <span className={`text-center text-[11px] font-bold ${isCompact ? "w-4" : "w-5"} ${
                  i === 0 ? "text-accent" : "text-muted-foreground"
                }`}>
                  {i + 1}
                </span>
                <Avatar className={isCompact ? "h-5 w-5" : "h-6 w-6"}>
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[9px]">
                    {entry.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-[11px] font-medium text-foreground truncate">
                  {entry.full_name}
                  {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                </span>
                <span className="text-[10px] text-muted-foreground">{tier.emoji}</span>
                <span className="text-[10px] font-semibold text-primary">{entry.total_points}</span>
              </div>
            );
          })}

          {isCompact && (
            <button
              onClick={() => {
                navigate("/leaderboard");
                onNavigate?.();
              }}
              className="w-full rounded-lg border border-dashed border-border bg-secondary/40 px-2 py-1.5 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-foreground">
                    {userRank > 0 ? `You’re #${userRank} right now` : "Track the full ranking live"}
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
                <div className="flex-1 border-t border-dashed border-border" />
                <span className="text-[9px] text-muted-foreground">···</span>
                <div className="flex-1 border-t border-dashed border-border" />
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <span className="w-5 text-center text-[11px] font-bold text-muted-foreground">
                  {userRank}
                </span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={userEntry.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[9px]">
                    {userEntry.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-[11px] font-medium text-foreground truncate">
                  {userEntry.full_name}
                  <span className="text-primary ml-1">(You)</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {getBuyerTier(userEntry.total_points).emoji}
                </span>
                <span className="text-[10px] font-semibold text-primary">{userEntry.total_points}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
