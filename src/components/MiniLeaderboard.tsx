import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBuyerTier } from "@/lib/buyerGamification";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
}

export const MiniLeaderboard = ({ onNavigate }: { onNavigate?: () => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc("get_leaderboard", { _limit: 50 });
      if (data) {
        setEntries(data as LeaderboardEntry[]);
        if (user) {
          const idx = (data as LeaderboardEntry[]).findIndex((e) => e.user_id === user.id);
          setUserRank(idx >= 0 ? idx + 1 : 0);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading || entries.length === 0) return null;

  // Show top 3 + current user if not in top 3
  const top3 = entries.slice(0, 3);
  const userEntry = user ? entries.find((e) => e.user_id === user.id) : null;
  const showUserSeparately = userRank > 3 && userEntry;

  return (
    <div className="mx-3 mb-2 bg-secondary/50 border border-border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2.5">
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
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1.5">
        {top3.map((entry, i) => {
          const tier = getBuyerTier(entry.total_points);
          const isCurrentUser = user?.id === entry.user_id;
          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                isCurrentUser ? "bg-primary/10 border border-primary/20" : ""
              }`}
            >
              <span className={`w-5 text-center text-[11px] font-bold ${
                i === 0 ? "text-accent" : "text-muted-foreground"
              }`}>
                {i + 1}
              </span>
              <Avatar className="h-6 w-6">
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

        {showUserSeparately && (
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
    </div>
  );
};
