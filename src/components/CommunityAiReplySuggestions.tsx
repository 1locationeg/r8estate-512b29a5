import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  postTitle: string;
  postBody: string;
  onSelectReply: (text: string) => void;
}

export const CommunityAiReplySuggestions = ({ postTitle, postBody, onSelectReply }: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("community-ai-assist", {
        body: { action: "suggest_reply", title: postTitle, body: postBody },
      });
      if (error) throw error;
      setSuggestions(data.replies || []);
    } catch {
      toast({ title: "AI unavailable", description: "Try again shortly", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      {suggestions.length === 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSuggestions}
          disabled={loading}
          className="h-6 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/5 px-2"
        >
          {loading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
          {t("community.aiSuggestReply", "AI suggestions")}
        </Button>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
          <p className="text-[10px] font-medium text-primary flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> {t("community.pickSuggestion", "Tap to use")}
          </p>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { onSelectReply(s); setSuggestions([]); }}
              className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-foreground border border-primary/10 transition-colors leading-relaxed"
            >
              {s}
            </button>
          ))}
          <button onClick={() => setSuggestions([])} className="text-[10px] text-muted-foreground hover:text-foreground">
            {t("community.dismiss", "Dismiss")}
          </button>
        </div>
      )}
    </div>
  );
};
