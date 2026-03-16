import { useState } from "react";
import { ArrowBigUp, MessageCircle, ArrowLeft, Send, CornerDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserTierBadge } from "@/components/UserTierBadge";
import type { CommunityPost, CommunityReply } from "@/hooks/useCommunity";
import { useCommunityActions } from "@/hooks/useCommunity";

const categoryConfig: Record<string, { label: string; className: string }> = {
  question: { label: "Question", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  discussion: { label: "Discussion", className: "bg-primary/10 text-primary border-primary/20" },
  tip: { label: "Tip", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  experience: { label: "Experience", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  poll: { label: "Poll", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  post: CommunityPost;
  replies: CommunityReply[];
  onBack: () => void;
  onVotePost: () => void;
  onVoteReply: (replyId: string) => void;
  onRefetch: () => void;
}

export const CommunityPostDetail = ({ post, replies, onBack, onVotePost, onVoteReply, onRefetch }: Props) => {
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { createReply } = useCommunityActions();
  const cat = categoryConfig[post.category] || categoryConfig.discussion;

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    const result = await createReply(post.id, replyText.trim(), replyingTo || undefined);
    if (result) {
      setReplyText("");
      setReplyingTo(null);
      onRefetch();
    }
    setSubmitting(false);
  };

  const ReplyItem = ({ reply, isNested }: { reply: CommunityReply; isNested?: boolean }) => (
    <div className={`${isNested ? 'ml-8 border-l-2 border-border pl-3' : ''} py-3`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onVoteReply(reply.id)}
          className={`flex flex-col items-center gap-0 pt-0.5 ${reply.user_voted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
        >
          <ArrowBigUp className="w-4 h-4" fill={reply.user_voted ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">{reply.upvotes}</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={reply.author_avatar} />
              <AvatarFallback className="text-[8px] bg-secondary">{reply.author_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-foreground">{reply.author_name}</span>
            <UserTierBadge userId={reply.user_id} />
            <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{reply.body}</p>
          {!isNested && (
            <button
              onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
              className="text-[11px] text-muted-foreground hover:text-primary mt-1 flex items-center gap-1"
            >
              <CornerDownRight className="w-3 h-3" /> Reply
            </button>
          )}
        </div>
      </div>
      {reply.children?.map(child => <ReplyItem key={child.id} reply={child} isNested />)}
      {replyingTo === reply.id && (
        <div className="ml-8 mt-2 flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-[60px] text-sm"
          />
          <Button size="sm" onClick={handleSubmitReply} disabled={submitting || !replyText.trim()}>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </button>

      {/* Post */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={onVotePost}
              className={`p-1.5 rounded-md transition-colors ${post.user_voted ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
            >
              <ArrowBigUp className="w-6 h-6" fill={post.user_voted ? "currentColor" : "none"} />
            </button>
            <span className={`text-sm font-bold ${post.user_voted ? 'text-primary' : 'text-muted-foreground'}`}>
              {post.upvotes}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cat.className}`}>
                {cat.label}
              </Badge>
            </div>
            <h1 className="text-lg font-bold text-foreground mb-2">{post.title}</h1>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.author_avatar} />
                  <AvatarFallback className="text-[8px] bg-secondary">{post.author_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{post.author_name}</span>
              </div>
              <span>{timeAgo(post.created_at)}</span>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{post.reply_count} replies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply composer (top-level) */}
      {!replyingTo && (
        <div className="bg-card border border-border rounded-xl p-4">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[80px] text-sm mb-3"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitReply} disabled={submitting || !replyText.trim()} size="sm" className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Reply
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">{post.reply_count} Replies</h3>
          </div>
          <div className="px-4">
            {replies.map(reply => <ReplyItem key={reply.id} reply={reply} />)}
          </div>
        </div>
      )}

      {replies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No replies yet. Be the first to respond!
        </div>
      )}
    </div>
  );
};
