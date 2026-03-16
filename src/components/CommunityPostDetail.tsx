import { useState } from "react";
import { MessageCircle, ArrowLeft, Send, ThumbsUp, Flag, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserTierBadge } from "@/components/UserTierBadge";
import { ShareMenu } from "@/components/ShareMenu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useReactions, type ReactionSummary } from "@/hooks/useReactions";
import type { CommunityPost, CommunityReply } from "@/hooks/useCommunity";
import { useCommunityActions } from "@/hooks/useCommunity";

const categoryConfig: Record<string, { label: string; className: string }> = {
  question: { label: "Question", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  discussion: { label: "Discussion", className: "bg-primary/10 text-primary border-primary/20" },
  tip: { label: "Tip", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  experience: { label: "Experience", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  poll: { label: "Poll", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
};

const reactionEmojis = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
];

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

// Reaction pills display
const ReactionPills = ({ reactions, onToggle }: { reactions: ReactionSummary[]; onToggle: (emoji: string) => void }) => {
  if (!reactions.length) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap mt-1.5">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={(e) => { e.stopPropagation(); onToggle(r.emoji); }}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-colors ${
            r.user_reacted
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/20'
          }`}
        >
          <span>{r.emoji}</span>
          <span className="font-medium">{r.count}</span>
        </button>
      ))}
    </div>
  );
};

const EngagementToolbar = ({
  onReply,
  targetId,
  targetType,
  shareTitle,
  shareUrl,
  compact = false,
}: {
  onReply?: () => void;
  targetId: string;
  targetType: 'post' | 'reply';
  shareTitle: string;
  shareUrl?: string;
  compact?: boolean;
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const { reactions, toggleReaction } = useReactions(targetId, targetType);

  const handleFlag = () => {
    toast({ title: "Reported", description: "Thank you for helping keep our community safe.", duration: 2000 });
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const userHasReacted = reactions.some(r => r.user_reacted);

  return (
    <div className={compact ? 'mt-1.5' : 'mt-3 pt-3 border-t border-border'}>
      {/* Reaction pills */}
      <ReactionPills reactions={reactions} onToggle={toggleReaction} />

      {/* Action buttons */}
      <div className={`flex items-center gap-1 ${reactions.length ? 'mt-1.5' : ''}`}>
        {/* Like / React */}
        <div className="relative">
          <button
            onClick={() => toggleReaction("👍")}
            onMouseEnter={() => setShowEmojis(true)}
            onMouseLeave={() => setShowEmojis(false)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
              userHasReacted
                ? 'text-primary bg-primary/10 font-medium'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" fill={userHasReacted ? "currentColor" : "none"} />
            <span>{totalReactions > 0 ? totalReactions : 'Like'}</span>
          </button>
          {showEmojis && (
            <div
              onMouseEnter={() => setShowEmojis(true)}
              onMouseLeave={() => setShowEmojis(false)}
              className="absolute -top-10 left-0 z-50 flex items-center gap-0.5 bg-card border border-border rounded-full px-2 py-1 shadow-lg"
            >
              {reactionEmojis.map((r) => (
                <button
                  key={r.emoji}
                  onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); setShowEmojis(false); }}
                  className="hover:scale-125 transition-transform p-0.5 text-base"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        {onReply && (
          <button
            onClick={onReply}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Comment</span>
          </button>
        )}

        {/* Share */}
        <ShareMenu
          title={shareTitle}
          url={shareUrl}
          iconOnly={false}
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-primary gap-1 font-normal"
        />

        {/* Bookmark */}
        <button
          onClick={() => toast({ title: "Saved!", description: "Post bookmarked.", duration: 1500 })}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Flag */}
        <button
          onClick={handleFlag}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors ml-auto"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Report</span>
        </button>
      </div>
    </div>
  );
};

export const CommunityPostDetail = ({ post, replies, onBack, onVotePost, onVoteReply, onRefetch }: Props) => {
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { createReply } = useCommunityActions();
  const { user, profile } = useAuth();
  const cat = categoryConfig[post.category] || categoryConfig.discussion;

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Anonymous';

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

  const ReplyComposer = ({ parentReplyId }: { parentReplyId?: string | null }) => (
    <div className={`${parentReplyId ? 'ml-8 mt-2' : ''}`}>
      {user && (
        <div className="flex items-center gap-1.5 mb-2">
          <Avatar className="h-4 w-4">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-[7px] bg-secondary">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-muted-foreground">
            Commenting as <span className="font-medium text-muted-foreground/80">{displayName}</span>
          </span>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={parentReplyId ? "Write a reply..." : "Share your thoughts..."}
          className={`${parentReplyId ? 'min-h-[60px]' : 'min-h-[80px]'} text-sm`}
        />
        <Button size="sm" onClick={handleSubmitReply} disabled={submitting || !replyText.trim()} className="self-end">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  const ReplyItem = ({ reply, isNested }: { reply: CommunityReply; isNested?: boolean }) => (
    <div className={`${isNested ? 'ml-8 border-l-2 border-border pl-3' : ''} py-3`}>
      <div className="flex items-start gap-3">
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

          {/* Engagement toolbar for replies */}
          <EngagementToolbar
            onReply={!isNested ? () => setReplyingTo(replyingTo === reply.id ? null : reply.id) : undefined}
            targetId={reply.id}
            targetType="reply"
            shareTitle={reply.body.slice(0, 60)}
            compact
          />
        </div>
      </div>
      {reply.children?.map(child => <ReplyItem key={child.id} reply={child} isNested />)}
      {replyingTo === reply.id && <ReplyComposer parentReplyId={reply.id} />}
    </div>
  );

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </button>

      {/* Post */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-3">
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
                <UserTierBadge userId={post.user_id} />
              </div>
              <span>{timeAgo(post.created_at)}</span>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{post.reply_count} replies</span>
              </div>
            </div>

            {/* Post engagement toolbar */}
            <EngagementToolbar
              onReply={() => {
                setReplyingTo(null);
                document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
              }}
              targetId={post.id}
              targetType="post"
              shareTitle={post.title}
            />
          </div>
        </div>
      </div>

      {/* Reply composer (top-level) */}
      {!replyingTo && (
        <div className="bg-card border border-border rounded-xl p-4">
          <ReplyComposer />
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
