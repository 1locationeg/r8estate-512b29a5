import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2, Bold, Italic, Underline, List, ListOrdered, Link2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ReviewReplyFormProps {
  reviewId: string;
  onReplySubmitted?: () => void;
}

export const ReviewReplyForm = ({ reviewId, onReplySubmitted }: ReviewReplyFormProps) => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const getContent = () => editorRef.current?.innerHTML?.trim() ?? "";
  const getTextContent = () => editorRef.current?.textContent?.trim() ?? "";

  const checkEmpty = useCallback(() => {
    setIsEmpty(!getTextContent());
  }, []);

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    checkEmpty();
  };

  const handleLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const handleSubmit = async () => {
    const html = getContent();
    const text = getTextContent();
    if (!text) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("review_replies").insert({
        review_id: reviewId,
        user_id: user!.id,
        body: html,
      });
      if (error) throw error;
      toast.success("Reply posted successfully");
      if (editorRef.current) editorRef.current.innerHTML = "";
      setIsEmpty(true);
      setIsOpen(false);
      onReplySubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || (role !== "business" && role !== "admin")) return null;

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-primary gap-1.5"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Reply to this review
      </Button>
    );
  }

  const ToolBtn = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onClick(); }}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="mt-3 space-y-2 p-3 bg-secondary/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquare className="w-3.5 h-3.5" />
        Replying as business
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border border-border rounded-t-md bg-muted/40 px-1.5 py-1">
        <ToolBtn icon={Bold} label="Bold" onClick={() => exec("bold")} />
        <ToolBtn icon={Italic} label="Italic" onClick={() => exec("italic")} />
        <ToolBtn icon={Underline} label="Underline" onClick={() => exec("underline")} />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolBtn icon={List} label="Bullet list" onClick={() => exec("insertUnorderedList")} />
        <ToolBtn icon={ListOrdered} label="Numbered list" onClick={() => exec("insertOrderedList")} />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolBtn icon={Link2} label="Insert link" onClick={handleLink} />
        <ToolBtn icon={Undo2} label="Undo" onClick={() => exec("undo")} />
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={checkEmpty}
        data-placeholder="Write your response..."
        className="min-h-[100px] max-h-[200px] overflow-y-auto text-sm p-3 border border-border border-t-0 rounded-b-md bg-background focus:outline-none focus:ring-1 focus:ring-ring empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Rich text supported</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); if (editorRef.current) editorRef.current.innerHTML = ""; setIsEmpty(true); }}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isEmpty || submitting}>
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post Reply
          </Button>
        </div>
      </div>
    </div>
  );
};
