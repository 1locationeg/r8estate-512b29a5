import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DealVotePollProps {
  dealId: string;
}

export const DealVotePoll = ({ dealId }: DealVotePollProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [myVote, setMyVote] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVotes();
  }, [dealId, user?.id]);

  const fetchVotes = async () => {
    const { data } = await supabase
      .from("deal_votes" as any)
      .select("vote, user_id")
      .eq("deal_id", dealId) as any;

    if (data) {
      setYesCount(data.filter((v: any) => v.vote === true).length);
      setNoCount(data.filter((v: any) => v.vote === false).length);
      if (user) {
        const mine = data.find((v: any) => v.user_id === user.id);
        setMyVote(mine ? mine.vote : null);
      }
    }
  };

  const handleVote = async (vote: boolean) => {
    if (!user) { navigate("/auth"); return; }
    if (loading) return;
    setLoading(true);

    try {
      if (myVote === vote) {
        // Remove vote
        await supabase
          .from("deal_votes" as any)
          .delete()
          .eq("deal_id", dealId)
          .eq("user_id", user.id);
        setMyVote(null);
      } else if (myVote !== null) {
        // Change vote
        await supabase
          .from("deal_votes" as any)
          .update({ vote } as any)
          .eq("deal_id", dealId)
          .eq("user_id", user.id);
        setMyVote(vote);
      } else {
        // New vote
        await supabase
          .from("deal_votes" as any)
          .insert({ deal_id: dealId, user_id: user.id, vote } as any);
        setMyVote(vote);
      }
      await fetchVotes();
    } finally {
      setLoading(false);
    }
  };

  const total = yesCount + noCount;
  const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0;

  return (
    <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5">
      <p className="text-[11px] font-semibold text-foreground">Would you take this deal?</p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs gap-1 rounded-full transition-all",
            myVote === true
              ? "bg-emerald-500/15 text-emerald-700 border border-emerald-300 hover:bg-emerald-500/25"
              : "hover:bg-emerald-500/10 text-muted-foreground"
          )}
          onClick={() => handleVote(true)}
          disabled={loading}
        >
          <ThumbsUp className="w-3 h-3" />
          Yes {yesCount > 0 && <span className="font-bold">{yesCount}</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs gap-1 rounded-full transition-all",
            myVote === false
              ? "bg-red-500/15 text-red-700 border border-red-300 hover:bg-red-500/25"
              : "hover:bg-red-500/10 text-muted-foreground"
          )}
          onClick={() => handleVote(false)}
          disabled={loading}
        >
          <ThumbsDown className="w-3 h-3" />
          No {noCount > 0 && <span className="font-bold">{noCount}</span>}
        </Button>
        {total > 0 && (
          <div className="flex-1 flex items-center gap-1.5 ms-1">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${yesPct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{yesPct}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
