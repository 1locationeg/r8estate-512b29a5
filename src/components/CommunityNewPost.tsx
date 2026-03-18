import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, X, Building2 } from "lucide-react";
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

  const categories: { value: CommunityPostCategory; label: string }[] = [
    { value: "question", label: `❓ ${t("community.question", "Question")}` },
    { value: "discussion", label: `💬 ${t("community.discussion", "Discussion")}` },
    { value: "tip", label: `💡 ${t("community.tip", "Tip")}` },
    { value: "experience", label: `📖 ${t("community.experience", "Experience")}` },
    { value: "poll", label: `📊 ${t("community.poll", "Poll")}` },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const result = await createPost(title.trim(), body.trim(), category, prefillDev?.id);
    if (result) {
      setTitle("");
      setBody("");
      setCategory("question");
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
            placeholder={t("community.titlePlaceholder", "What do you want to know about a developer?")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm"
          />

          <Textarea
            placeholder={t("community.bodyPlaceholder", "Share the details...")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[120px] text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">{t("community.cancel", "Cancel")}</Button>
            <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !body.trim()} size="sm" className="gap-1.5">
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {t("community.post", "Post")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
