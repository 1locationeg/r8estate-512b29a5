import { useState } from "react";
import { MessageCircle, ArrowLeft, Send, ThumbsUp, Flag, Bookmark, Globe, MoreHorizontal, CornerDownRight } from "lucide-react";
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
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
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

// Shared engagement bar for post and replies
const EngagementBar = ({
  targetId,
  targetType,
  onReply,
  shareTitle,
}: {
  targetId: string;
  targetType: 'post' | 'reply';
  onReply?: () => void;
  shareTitle: string;
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const { reactions, toggleReaction } = useReactions(targetId, targetType);

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const userHasReacted = reactions.some(r => r.user_reacted);

  return (
    <div>
      {/* Reaction summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 px-1 py-1 text-xs text-muted-foreground">
          <div className="flex -space-x-0.5">
            {reactions.slice(0, 3).map((r) => (
              <span key={r.emoji} className="text-sm">{r.emoji}</span>
            ))}
          </div>
          <span>{totalReactions}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center border-t border-border">
        {/* Like */}
        <div className="relative flex-1">
          <button
            onClick={() => toggleReaction("👍")}
            onMouseEnter={() => setShowEmojis(true)}
            onMouseLeave={() => setShowEmojis(false)}
            className={`flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium transition-colors rounded-md ${
              userHasReacted ? 'text-primary' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" fill={userHasReacted ? "currentColor" : "none"} />
            <span>{userHasReacted ? 'Liked' : 'Like'}</span>
          </button>
          {showEmojis && (
            <div
              onMouseEnter={() => setShowEmojis(true)}
              onMouseLeave={() => setShowEmojis(false)}
              className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 bg-card border border-border rounded-full px-2 py-1 shadow-xl"
            >
              {reactionEmojis.map((r) => (
                <button
                  key={r.emoji}
                  onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); setShowEmojis(false); }}
                  className="hover:scale-125 transition-transform text-base p-0.5"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply */}
        {onReply && (
          <button
            onClick={onReply}
            className="flex items-center justify-center gap-1.5 flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary rounded-md transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        )}
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
  const avatarUrl = profile?.avatar_url || undefined;

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

  // Facebook-style comment composer
  const CommentComposer = ({ parentReplyId, autoFocus }: { parentReplyId?: string | null; autoFocus?: boolean }) => (
    <div className={`flex items-start gap-2 ${parentReplyId ? 'ml-12 mt-2' : 'px-4 py-3'}`}>
      <Avatar className="h-8 w-8 mt-0.5 flex-shrink-0">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-[10px] bg-secondary font-semibold">{displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {user && (
          <p className="text-[11px] text-muted-foreground mb-1">
            Commenting as <span className="font-medium">{displayName}</span>
          </p>
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a comment..."
              autoFocus={autoFocus}
              className="min-h-[40px] max-h-[120px] text-sm rounded-2xl bg-secondary border-0 resize-none py-2 px-3 focus-visible:ring-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitReply();
                }
              }}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSubmitReply}
            disabled={submitting || !replyText.trim()}
            className="h-10 w-10 rounded-full text-primary self-end flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Facebook-style comment item
  const CommentItem = ({ reply, isNested }: { reply: CommunityReply; isNested?: boolean }) => (
    <div className={`${isNested ? 'ml-12' : ''} py-1`}>
      <div className="flex items-start gap-2">
        <Avatar className={`${isNested ? 'h-6 w-6' : 'h-8 w-8'} mt-0.5 flex-shrink-0`}>
          <AvatarImage src={reply.author_avatar} />
          <AvatarFallback className="text-[8px] bg-secondary font-semibold">{reply.author_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {/* Comment bubble */}
          <div className="bg-secondary rounded-2xl px-3 py-2 inline-block max-w-full">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-semibold text-foreground">{reply.author_name}</span>
              <UserTierBadge userId={reply.user_id} />
            </div>
            <p className="text-sm text-foreground leading-relaxed break-words">{reply.body}</p>
          </div>
          
          {/* Comment actions — Facebook style */}
          <div className="flex items-center gap-3 px-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
            
            {/* Like with inline reactions */}
            <InlineReactionButton targetId={reply.id} targetType="reply" />

            {!isNested && (
              <button
                onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {reply.children?.map(child => <CommentItem key={child.id} reply={child} isNested />)}
      
      {/* Inline reply composer */}
      {replyingTo === reply.id && <CommentComposer parentReplyId={reply.id} autoFocus />}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </button>

      {/* Post card — Facebook style */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Author header */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <Avatar className="h-10 w-10 ring-2 ring-border">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback className="text-sm bg-secondary font-semibold">{post.author_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{post.author_name}</span>
              <UserTierBadge userId={post.user_id} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{timeAgo(post.created_at)}</span>
              <span>·</span>
              <Globe className="w-3 h-3" />
              <span>·</span>
              <Badge variant="outline" className={`text-[9px] px-1 py-0 leading-tight ${cat.className}`}>
                {cat.label}
              </Badge>
            </div>
          </div>
          <button className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post content */}
        <div className="px-4 pb-3">
          <h1 className="text-base font-bold text-foreground mb-1.5">{post.title}</h1>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p>
        </div>

        {/* Reaction + comment count summary */}
        <PostReactionSummary postId={post.id} replyCount={post.reply_count} />

        {/* Divider */}
        <div className="mx-4 border-t border-border" />

        {/* Action bar */}
        <div className="flex items-center px-2 py-1">
          <PostLikeButton postId={post.id} />
          <button
            onClick={() => {
              setReplyingTo(null);
              document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
            }}
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </button>
          <div className="flex-1 flex justify-center">
            <ShareMenu
              title={post.title}
              iconOnly={false}
              variant="ghost"
              size="sm"
              className="w-full justify-center h-auto py-2 text-sm font-medium text-muted-foreground hover:bg-secondary gap-1.5"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-border" />

        {/* Comment composer */}
        {!replyingTo && <CommentComposer />}
      </div>

      {/* Comments section */}
      {replies.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              {post.reply_count} Comment{post.reply_count !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="px-4 py-2 space-y-1">
            {replies.map(reply => <CommentItem key={reply.id} reply={reply} />)}
          </div>
        </div>
      )}

      {replies.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm">
          <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

// Extracted components to avoid hooks-in-loops issues

const PostReactionSummary = ({ postId, replyCount }: { postId: string; replyCount: number }) => {
  const { reactions } = useReactions(postId, 'post');
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  if (totalReactions === 0 && replyCount === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-1.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        {totalReactions > 0 && (
          <>
            <div className="flex -space-x-0.5">
              {reactions.slice(0, 3).map((r) => (
                <span key={r.emoji} className="text-sm">{r.emoji}</span>
              ))}
            </div>
            <span>{totalReactions}</span>
          </>
        )}
      </div>
      {replyCount > 0 && (
        <span>{replyCount} comment{replyCount !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

const PostLikeButton = ({ postId }: { postId: string }) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const { reactions, toggleReaction } = useReactions(postId, 'post');
  const userHasReacted = reactions.some(r => r.user_reacted);

  return (
    <div className="relative flex-1">
      <button
        onClick={() => toggleReaction("👍")}
        onMouseEnter={() => setShowEmojis(true)}
        onMouseLeave={() => setShowEmojis(false)}
        className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-md text-sm font-medium transition-colors ${
          userHasReacted ? 'text-primary' : 'text-muted-foreground hover:bg-secondary'
        }`}
      >
        <ThumbsUp className="w-4 h-4" fill={userHasReacted ? "currentColor" : "none"} />
        <span>{userHasReacted ? 'Liked' : 'Like'}</span>
      </button>
      {showEmojis && (
        <div
          onMouseEnter={() => setShowEmojis(true)}
          onMouseLeave={() => setShowEmojis(false)}
          className="absolute -top-11 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5 shadow-xl"
        >
          {reactionEmojis.map((r) => (
            <button
              key={r.emoji}
              onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); setShowEmojis(false); }}
              className="hover:scale-[1.3] transition-transform text-lg p-0.5"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InlineReactionButton = ({ targetId, targetType }: { targetId: string; targetType: 'post' | 'reply' }) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const { reactions, toggleReaction } = useReactions(targetId, targetType);
  const userHasReacted = reactions.some(r => r.user_reacted);
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="relative">
      <button
        onClick={() => toggleReaction("👍")}
        onMouseEnter={() => setShowEmojis(true)}
        onMouseLeave={() => setShowEmojis(false)}
        className={`text-[11px] font-semibold transition-colors ${
          userHasReacted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Like{totalReactions > 0 ? ` · ${totalReactions}` : ''}
      </button>
      {showEmojis && (
        <div
          onMouseEnter={() => setShowEmojis(true)}
          onMouseLeave={() => setShowEmojis(false)}
          className="absolute -top-9 left-0 z-50 flex items-center gap-0.5 bg-card border border-border rounded-full px-2 py-1 shadow-xl"
        >
          {reactionEmojis.map((r) => (
            <button
              key={r.emoji}
              onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); setShowEmojis(false); }}
              className="hover:scale-125 transition-transform text-sm p-0.5"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
