import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, X, Building2, Plus, Trash2, Sparkles, Wand2, Zap, TrendingUp, Megaphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CommunityPostCategory } from "@/hooks/useCommunity";
import { useCommunityActions } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { developers } from "@/data/mockData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  prefillDeveloper?: string;
}

export const CommunityNewPost = ({ open, onOpenChange, onCreated, prefillDeveloper }: Props) => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>("question");
  const [submitting, setSubmitting] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const { createPost } = useCommunityActions();
  const prefillDev = prefillDeveloper ? developers.find(d => d.id === prefillDeveloper) : null;

  // Poll state
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [allowOther, setAllowOther] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [engagementTip, setEngagementTip] = useState("");

  const categories: { value: CommunityPostCategory; label: string }[] = [
    { value: "question", label: `❓ ${t("community.question", "Question")}` },
    { value: "discussion", label: `💬 ${t("community.discussion", "Discussion")}` },
    { value: "tip", label: `💡 ${t("community.tip", "Tip")}` },
    { value: "experience", label: `📖 ${t("community.experience", "Experience")}` },
    { value: "poll", label: `📊 ${t("community.poll", "Poll")}` },
  ];

  const addOption = () => {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, ""]);
  };

  const removeOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, value: string) => {
    const updated = [...pollOptions];
    updated[idx] = value;
    setPollOptions(updated);
  };

  const isPoll = category === "poll";
  const pollValid = isPoll ? pollOptions.filter(o => o.trim()).length >= 2 : true;

  const handleAiSuggestTitles = async () => {
    setAiLoading(true);
    setTitleSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("community-ai-assist", {
        body: { action: "suggest_titles", title, body, category },
      });
      if (error) throw error;
      setTitleSuggestions(data.titles || []);
      if (data.tips?.[0]) setEngagementTip(data.tips[0]);
    } catch {
      toast({ title: "AI unavailable", description: "Try again shortly", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const handleAiEnhance = async () => {
    if (!body.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("community-ai-assist", {
        body: { action: "enhance_post", title, body, category },
      });
      if (error) throw error;
      if (data.enhanced_body) setBody(data.enhanced_body);
      if (data.engagement_tip) setEngagementTip(data.engagement_tip);
      toast({ title: "✨ Post enhanced", description: data.changes || "Improved clarity & engagement" });
    } catch {
      toast({ title: "AI unavailable", description: "Try again shortly", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (isPoll && !pollValid) return;
    if (!isPoll && !body.trim()) return;

    setSubmitting(true);
    const finalBody = isPoll
      ? JSON.stringify({
          question: title.trim(),
          options: pollOptions.filter(o => o.trim()).map(o => o.trim()),
          allowOther,
        })
      : body.trim();

    const result = await createPost(title.trim(), finalBody, category, prefillDev?.id);
    if (result) {
      setTitle(""); setBody(""); setCategory("question");
      setPollOptions(["", ""]); setAllowOther(false);
      setTitleSuggestions([]); setEngagementTip("");
      onOpenChange(false);
      onCreated();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            {t("community.startDiscussion", "Start a Discussion")}
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 gap-1">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {prefillDev && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 text-sm">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{prefillDev.name}</span>
              </div>
            </div>
          )}

          {/* Category selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">{t("community.category", "Category")}</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    category === cat.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title with AI suggest */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder={isPoll
                  ? t("community.pollQuestion", "What do you want to ask?")
                  : t("community.titlePlaceholder", "What do you want to know about a developer?")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAiSuggestTitles}
                disabled={aiLoading}
                className="h-9 w-9 flex-shrink-0 border-primary/20 hover:bg-primary/5"
                title="AI suggest titles"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
              </Button>
            </div>

            {/* Title suggestions */}
            {titleSuggestions.length > 0 && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-medium text-primary flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Suggested titles
                </p>
                {titleSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setTitle(s); setTitleSuggestions([]); }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-foreground border border-primary/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Poll or Body */}
          {isPoll ? (
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground block">
                {t("community.pollOptions", "Poll Options")}
              </label>
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <Input
                      placeholder={`${t("community.option", "Option")} ${idx + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="text-sm flex-1"
                    />
                    {pollOptions.length > 2 && (
                      <button onClick={() => removeOption(idx)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 6 && (
                <Button variant="outline" size="sm" onClick={addOption} className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> {t("community.addOption", "Add Option")}
                </Button>
              )}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/40 border border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">{t("community.allowOther", "Allow 'Other' answer")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("community.allowOtherDesc", "Voters can type their own option")}</p>
                </div>
                <Switch checked={allowOther} onCheckedChange={setAllowOther} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder={t("community.bodyPlaceholder", "Share the details...")}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[120px] text-sm"
              />
              {/* AI toolbar */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAiEnhance}
                  disabled={aiLoading || !body.trim()}
                  className="h-7 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/5"
                >
                  <Wand2 className="w-3 h-3" />
                  {t("community.aiEnhance", "Enhance with AI")}
                </Button>
              </div>
            </div>
          )}

          {/* Engagement tip */}
          {engagementTip && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-accent/30 border border-accent/20 animate-in fade-in">
              <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-foreground leading-relaxed">{engagementTip}</p>
              <button onClick={() => setEngagementTip("")} className="ml-auto text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">{t("community.cancel", "Cancel")}</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || (!isPoll && !body.trim()) || (isPoll && !pollValid)}
              size="sm"
              className="gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {t("community.post", "Post")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
