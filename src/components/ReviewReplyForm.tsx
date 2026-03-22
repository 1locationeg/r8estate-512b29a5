import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReviewReplyFormProps {
  reviewId: string;
  onReplySubmitted?: () => void;
}

export const ReviewReplyForm = ({ reviewId, onReplySubmitted }: ReviewReplyFormProps) => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user || (role !== "business" && role !== "admin")) return null;

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("review_replies").insert({
        review_id: reviewId,
        user_id: user.id,
        body: body.trim(),
      });
      if (error) throw error;
      toast.success("Reply posted successfully");
      setBody("");
      setIsOpen(false);
      onReplySubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="mt-3 space-y-2 p-3 bg-secondary/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquare className="w-3.5 h-3.5" />
        Replying as business
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your response..."
        className="min-h-[80px] text-sm"
        maxLength={500}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{body.length}/500</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setBody(""); }}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!body.trim() || submitting}>
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post Reply
          </Button>
        </div>
      </div>
    </div>
  );
};
