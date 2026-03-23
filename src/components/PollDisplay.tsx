import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PollData {
  question: string;
  options: string[];
  allowOther?: boolean;
}

interface PollVote {
  option_index: number;
  user_id: string;
}

function parsePollData(body: string): PollData | null {
  try {
    const d = JSON.parse(body);
    if (d && Array.isArray(d.options) && d.options.length >= 2) return d;
    return null;
  } catch {
    return null;
  }
}

export const PollDisplay = ({ postId, body }: { postId: string; body: string }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(false);

  const pollData = parsePollData(body);

  useEffect(() => {
    if (!pollData) return;
    const fetchVotes = async () => {
      const { data } = await supabase
        .from("poll_votes")
        .select("option_index, user_id")
        .eq("post_id", postId);
      if (data) {
        setVotes(data);
        if (user) {
          const myVote = data.find((v: any) => v.user_id === user.id);
          setUserVote(myVote ? myVote.option_index : null);
        }
      }
    };
    fetchVotes();
  }, [postId, user?.id]);

  if (!pollData) {
    return <p className="text-sm text-muted-foreground">{body}</p>;
  }

  const totalVotes = votes.length;

  const handleVote = async (optionIndex: number) => {
    if (!user) {
      toast({ title: t("community.signInRequired", "Sign in to vote"), variant: "destructive" });
      return;
    }
    setLoading(true);

    if (userVote !== null) {
      await supabase
        .from("poll_votes")
        .update({ option_index: optionIndex })
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("poll_votes")
        .insert({ post_id: postId, user_id: user.id, option_index: optionIndex });
    }

    setUserVote(optionIndex);
    // Refetch
    const { data } = await supabase
      .from("poll_votes")
      .select("option_index, user_id")
      .eq("post_id", postId);
    if (data) setVotes(data);
    setLoading(false);
  };

  const hasVoted = userVote !== null;
  const otherIndex = pollData.options.length;

  return (
    <div className="space-y-2 py-1">
      {pollData.options.map((option, idx) => {
        const count = votes.filter(v => v.option_index === idx).length;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isSelected = userVote === idx;

        return (
          <button
            key={idx}
            onClick={() => !loading && handleVote(idx)}
            disabled={loading}
            className={`w-full relative overflow-hidden rounded-lg border text-left px-3 py-2.5 transition-all ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30 bg-card"
            }`}
          >
            {hasVoted && (
              <div
                className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            )}
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                <span className={`text-sm truncate ${isSelected ? "font-semibold text-primary" : "text-foreground"}`}>
                  {option}
                </span>
              </div>
              {hasVoted && (
                <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                  {pct}%
                </span>
              )}
            </div>
          </button>
        );
      })}

      {pollData.allowOther && (
        <div className={`rounded-lg border px-3 py-2.5 transition-all ${
          userVote === otherIndex ? "border-primary bg-primary/5" : "border-border bg-card"
        }`}>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t("community.otherOption", "Type your answer...")}
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              className="text-sm h-8 flex-1 border-0 bg-transparent p-0 focus-visible:ring-0"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              disabled={!otherText.trim() || loading}
              onClick={() => handleVote(otherIndex)}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground pt-0.5">
        {totalVotes} {totalVotes === 1 ? t("community.vote", "vote") : t("community.votes", "votes")}
        {hasVoted && <span className="ml-1">· {t("community.youVoted", "You voted")}</span>}
      </p>
    </div>
  );
};
