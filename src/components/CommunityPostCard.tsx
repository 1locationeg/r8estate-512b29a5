import { useState, useMemo } from "react";
import { ArrowBigUp, MessageCircle, Pin, ThumbsUp, Flag, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserTierBadge } from "@/components/UserTierBadge";
import { ShareMenu } from "@/components/ShareMenu";
import { toast } from "@/hooks/use-toast";
import { useReactions, useBulkReactions, type ReactionSummary } from "@/hooks/useReactions";
import type { CommunityPost } from "@/hooks/useCommunity";

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

// Reaction pills
const ReactionPills = ({ reactions, onToggle }: { reactions: ReactionSummary[]; onToggle: (emoji: string) => void }) => {
  if (!reactions.length) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={(e) => { e.stopPropagation(); onToggle(r.emoji); }}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${
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

interface Props {
  post: CommunityPost;
  onClick: () => void;
  onVote: () => void;
}

export const CommunityPostCard = ({ post, onClick, onVote }: Props) => {
  const cat = categoryConfig[post.category] || categoryConfig.discussion;
  const [showEmojis, setShowEmojis] = useState(false);
  const { reactions, toggleReaction } = useReactions(post.id, 'post');

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const userHasReacted = reactions.some(r => r.user_reacted);

  return (
    <div className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group">
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start gap-3">
          {/* Vote column */}
          <div className="flex flex-col items-center gap-0.5 pt-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); onVote(); }}
              className={`p-1 rounded-md transition-colors ${post.user_voted ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
            >
              <ArrowBigUp className="w-5 h-5" fill={post.user_voted ? "currentColor" : "none"} />
            </button>
            <span className={`text-xs font-bold ${post.user_voted ? 'text-primary' : 'text-muted-foreground'}`}>
              {post.upvotes}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cat.className}`}>
                {cat.label}
              </Badge>
              {post.is_pinned && (
                <Pin className="w-3 h-3 text-primary" />
              )}
            </div>

            <h3 className="font-semibold text-sm text-foreground leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {post.body}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={post.author_avatar} />
                  <AvatarFallback className="text-[8px] bg-secondary">{post.author_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{post.author_name}</span>
                <UserTierBadge userId={post.user_id} />
              </div>
              <span>{timeAgo(post.created_at)}</span>
              {post.reply_count === 0 && post.category === 'question' && (
                <span className="text-primary font-medium">Be the first to answer!</span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Reaction pills */}
      <div className="ml-10">
        <ReactionPills reactions={reactions} onToggle={toggleReaction} />
      </div>

      {/* Engagement toolbar */}
      <div className="flex items-center gap-1 mt-2 pt-2.5 border-t border-border ml-10">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); toggleReaction("👍"); }}
            onMouseEnter={() => setShowEmojis(true)}
            onMouseLeave={() => setShowEmojis(false)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors ${
              userHasReacted
                ? 'text-primary bg-primary/10 font-medium'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            <ThumbsUp className="w-3 h-3" fill={userHasReacted ? "currentColor" : "none"} />
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

        <button
          onClick={onClick}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <MessageCircle className="w-3 h-3" />
          <span>{post.reply_count} Comment{post.reply_count !== 1 ? 's' : ''}</span>
        </button>

        <ShareMenu
          title={post.title}
          iconOnly
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-[11px] text-muted-foreground hover:text-primary"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            toast({ title: "Saved!", description: "Post bookmarked.", duration: 1500 });
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Bookmark className="w-3 h-3" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toast({ title: "Reported", description: "Thank you for helping keep our community safe.", duration: 2000 });
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors ml-auto"
        >
          <Flag className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
