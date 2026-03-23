import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, X, Building2, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { CommunityPostCategory } from "@/hooks/useCommunity";
import { useCommunityActions } from "@/hooks/useCommunity";
import { developers } from "@/data/mockData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  prefillDeveloper?: string;
}

export const CommunityNewPost = ({ open, onOpenChange, onCreated, prefillDeveloper }: Props) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>("question");
  const [submitting, setSubmitting] = useState(false);
  const { createPost } = useCommunityActions();
  const prefillDev = prefillDeveloper ? developers.find(d => d.id === prefillDeveloper) : null;

  // Poll state
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [allowOther, setAllowOther] = useState(false);

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
  const pollValid = isPoll
    ? pollOptions.filter(o => o.trim()).length >= 2
    : true;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (isPoll && !pollValid) return;
    if (!isPoll && !body.trim()) return;

    setSubmitting(true);

    // For polls, encode options as JSON in the body
    const finalBody = isPoll
      ? JSON.stringify({
          question: title.trim(),
          options: pollOptions.filter(o => o.trim()).map(o => o.trim()),
          allowOther,
        })
      : body.trim();

    const result = await createPost(title.trim(), finalBody, category, prefillDev?.id);
    if (result) {
      setTitle("");
      setBody("");
      setCategory("question");
      setPollOptions(["", ""]);
      setAllowOther(false);
      onOpenChange(false);
      onCreated();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{t("community.startDiscussion", "Start a Discussion")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {prefillDev && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 text-sm">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{prefillDev.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{t("community.taggedDeveloper", "Discussion will be tagged with this developer")}</span>
            </div>
          )}

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

          <Input
            placeholder={isPoll
              ? t("community.pollQuestion", "What do you want to ask?")
              : t("community.titlePlaceholder", "What do you want to know about a developer?")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm"
          />

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
                      <button
                        onClick={() => removeOption(idx)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("community.addOption", "Add Option")}
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
            <Textarea
              placeholder={t("community.bodyPlaceholder", "Share the details...")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          )}

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
