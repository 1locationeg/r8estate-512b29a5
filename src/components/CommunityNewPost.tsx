import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, X, Building2, Plus, Trash2, Sparkles, Wand2, TrendingUp, Megaphone, Image as ImageIcon, Link2, Smile, Bold, Italic, List } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CommunityPostCategory } from "@/hooks/useCommunity";
import { useCommunityActions } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { developers } from "@/data/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeveloperMentionSuggestions } from "@/components/DeveloperMentionSuggestions";
import type { CommunityPost } from "@/hooks/useCommunity";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  prefillDeveloper?: string;
  editPost?: CommunityPost | null;
}

const EMOJI_GRID = [
  "😀", "😂", "😍", "🤔", "👍", "👎", "🔥", "💯",
  "❤️", "💪", "🎉", "⚠️", "✅", "❌", "🏠", "🏗️",
  "📊", "💰", "🤝", "👀", "🙏", "💡", "📢", "⭐",
  "🚀", "🎯", "💎", "🏆", "📝", "🔑", "📍", "🕐",
];

export const CommunityNewPost = ({ open, onOpenChange, onCreated, prefillDeveloper, editPost }: Props) => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const isEditing = !!editPost;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>("question");
  const [submitting, setSubmitting] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const { createPost, updatePost } = useCommunityActions();
  const prefillDev = prefillDeveloper ? developers.find(d => d.id === prefillDeveloper) : null;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Poll state
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [allowOther, setAllowOther] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [engagementTip, setEngagementTip] = useState("");

  // Populate fields when editing
  useEffect(() => {
    if (editPost && open) {
      setTitle(editPost.title);
      setBody(editPost.body);
      setCategory(editPost.category);
      setImageUrls((editPost as any).image_urls || []);
      setLinkUrl((editPost as any).link_url || "");
      setShowLinkInput(!!(editPost as any).link_url);
    } else if (!open) {
      resetForm();
    }
  }, [editPost, open]);

  const resetForm = () => {
    setTitle(""); setBody(""); setCategory("question");
    setPollOptions(["", ""]); setAllowOther(false);
    setTitleSuggestions([]); setEngagementTip("");
    setNotifyAll(false); setImageUrls([]); setLinkUrl("");
    setShowLinkInput(false);
  };

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

  // Insert text at cursor position in textarea
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBody(prev => prev + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = body.substring(0, start) + text + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Wrap selected text with formatting
  const wrapSelection = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end);
    const newBody = body.substring(0, start) + prefix + selected + suffix + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Only images are allowed", variant: "destructive" });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 5MB per image", variant: "destructive" });
        continue;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("community-images")
        .upload(path, file);

      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage.from("community-images").getPublicUrl(path);
      if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
    }

    setImageUrls(prev => [...prev, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

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

    if (isEditing && editPost) {
      const finalBody = isPoll
        ? JSON.stringify({
            question: title.trim(),
            options: pollOptions.filter(o => o.trim()).map(o => o.trim()),
            allowOther,
          })
        : body.trim();

      const result = await updatePost(editPost.id, {
        title: title.trim(),
        body: finalBody,
        category,
        image_urls: imageUrls,
        link_url: linkUrl.trim() || null,
      });
      if (result) {
        resetForm();
        onOpenChange(false);
        onCreated();
      }
    } else {
      const finalBody = isPoll
        ? JSON.stringify({
            question: title.trim(),
            options: pollOptions.filter(o => o.trim()).map(o => o.trim()),
            allowOther,
          })
        : body.trim();

      const result = await createPost(title.trim(), finalBody, category, prefillDev?.id, imageUrls, linkUrl.trim() || undefined);
      if (result) {
        if (isAdmin && notifyAll && result.id) {
          await supabase.rpc("broadcast_notification", {
            _title: `📢 ${title.trim()}`,
            _message: isPoll ? "New poll in community — share your vote!" : (body.trim().slice(0, 100) || "New discussion in community"),
            _type: "announcement",
            _metadata: JSON.stringify({ link: `/community?post=${result.id}` }),
          });
        }
        resetForm();
        onOpenChange(false);
        onCreated();
      }
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            {isEditing ? t("community.editPost", "Edit Post") : t("community.startDiscussion", "Start a Discussion")}
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 gap-1">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {prefillDev && !isEditing && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 text-sm">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{prefillDev.name}</span>
              </div>
            </div>
          )}

          {/* Category selector */}
          {!isEditing && (
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
          )}

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

            {titleSuggestions.length > 0 && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-medium text-primary flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Suggested titles
                </p>
                {titleSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setTitle(s); setTitleSuggestions([]); }}
                    className="block w-full text-start text-xs px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-foreground border border-primary/10 transition-colors"
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
              {/* Rich formatting toolbar */}
              <div className="flex items-center gap-1 flex-wrap border border-border rounded-t-md px-2 py-1.5 bg-secondary/30">
                <button
                  onClick={() => wrapSelection("**", "**")}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => wrapSelection("*", "*")}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertAtCursor("\n- ")}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Bullet list"
                >
                  <List className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Emoji picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJI_GRID.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertAtCursor(emoji)}
                          className="text-lg p-1 rounded hover:bg-secondary transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Image upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Attach image"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Link */}
                <button
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className={`p-1.5 rounded hover:bg-secondary transition-colors ${showLinkInput || linkUrl ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Add link"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-border mx-1" />

                {/* AI enhance */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAiEnhance}
                  disabled={aiLoading || !body.trim()}
                  className="h-7 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/5 px-2"
                >
                  <Wand2 className="w-3 h-3" />
                  {t("community.aiEnhance", "Enhance")}
                </Button>
              </div>

              <Textarea
                ref={textareaRef}
                placeholder={t("community.bodyPlaceholder", "Share the details...")}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[120px] text-sm rounded-t-none -mt-2 border-t-0"
              />

              {/* Link input */}
              {showLinkInput && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="text-sm flex-1"
                    type="url"
                  />
                  <button
                    onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Image previews */}
              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 end-1 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Engagement tip */}
          {engagementTip && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-accent/30 border border-accent/20 animate-in fade-in">
              <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-foreground leading-relaxed">{engagementTip}</p>
              <button onClick={() => setEngagementTip("")} className="ms-auto text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Admin: Notify all users toggle */}
          {isAdmin && !isEditing && (
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-xs font-medium text-foreground">{t("community.notifyAll", "Notify all users")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("community.notifyAllDesc", "Send a push notification with a link to this post")}</p>
                </div>
              </div>
              <Switch checked={notifyAll} onCheckedChange={setNotifyAll} />
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
              {isEditing
                ? t("community.saveChanges", "Save Changes")
                : notifyAll && isAdmin
                  ? t("community.postAndNotify", "Post & Notify")
                  : t("community.post", "Post")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
