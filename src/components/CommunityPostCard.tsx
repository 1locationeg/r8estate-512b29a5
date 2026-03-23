import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowBigUp, MessageCircle, Pin, ThumbsUp, Flag, Bookmark, BookmarkCheck, Globe, MoreHorizontal, Link2, BellPlus, BellOff, EyeOff, UserX, AlertTriangle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserTierBadge } from "@/components/UserTierBadge";
import { ShareMenu } from "@/components/ShareMenu";
import { PollDisplay } from "@/components/PollDisplay";
import { toast } from "@/hooks/use-toast";
import { useReactions, type ReactionSummary } from "@/hooks/useReactions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import type { CommunityPost } from "@/hooks/useCommunity";

function timeAgo(dateStr: string, t: (key: string, fallback: string) => string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("community.justNow", "Just now");
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  return new Date(dateStr).toLocaleDateString();
}

const reactionEmojis = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
];

interface Props {
  post: CommunityPost;
  onClick: () => void;
  onVote: () => void;
  onTogglePin?: (postId: string, currentlyPinned: boolean) => void;
}

export const CommunityPostCard = ({ post, onClick, onVote, onTogglePin }: Props) => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwnPost = user?.id === post.user_id;
  const isAdmin = role === 'admin';
  const categoryConfig: Record<string, { label: string; className: string }> = {
    question: { label: t("community.question", "Question"), className: "bg-blue-500/10 text-blue-600 border-blue-200" },
    discussion: { label: t("community.discussion", "Discussion"), className: "bg-primary/10 text-primary border-primary/20" },
    tip: { label: t("community.tip", "Tip"), className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    experience: { label: t("community.experience", "Experience"), className: "bg-amber-500/10 text-amber-600 border-amber-200" },
    poll: { label: t("community.poll", "Poll"), className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  };

  const cat = categoryConfig[post.category] || categoryConfig.discussion;
  const [showEmojis, setShowEmojis] = useState(false);
  const { reactions, toggleReaction } = useReactions(post.id, 'post');

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const userHasReacted = reactions.some(r => r.user_reacted);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Author header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <Avatar className="h-10 w-10 ring-2 ring-border">
          <AvatarImage src={post.author_avatar} />
          <AvatarFallback className="text-sm bg-secondary font-semibold">{post.author_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground truncate">{post.author_name}</span>
            <UserTierBadge userId={post.user_id} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{timeAgo(post.created_at, t)}</span>
            <span>·</span>
            <Globe className="w-3 h-3" />
            <span>·</span>
            <Badge variant="outline" className={`text-[9px] px-1 py-0 leading-tight ${cat.className}`}>
              {cat.label}
            </Badge>
            {post.is_pinned && (
              <>
                <span>·</span>
                <Pin className="w-3 h-3 text-primary" />
              </>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); toast({ title: isSaved ? t("community.unsaved", "Post unsaved") : t("community.saved", "Post saved") }); }}>
              {isSaved ? <BookmarkCheck className="w-4 h-4 mr-2 text-primary" /> : <Bookmark className="w-4 h-4 mr-2" />}
              {isSaved ? t("community.unsavePost", "Unsave post") : t("community.savePost", "Save post")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`); toast({ title: t("community.linkCopied", "Link copied!") }); }}>
              <Link2 className="w-4 h-4 mr-2" />
              {t("community.copyLink", "Copy link")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsFollowing(!isFollowing); toast({ title: isFollowing ? t("community.unfollowed", "Notifications off for this post") : t("community.followed", "You'll be notified of new comments") }); }}>
              {isFollowing ? <BellOff className="w-4 h-4 mr-2" /> : <BellPlus className="w-4 h-4 mr-2" />}
              {isFollowing ? t("community.turnOffNotifications", "Turn off notifications") : t("community.turnOnNotifications", "Turn on notifications")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!isOwnPost && (
              <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: t("community.postHidden", "Post hidden from your feed") }); }}>
                  <EyeOff className="w-4 h-4 mr-2" />
                  {t("community.hidePost", "Hide post")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: t("community.userMuted", "You won't see posts from this user") }); }}>
                  <UserX className="w-4 h-4 mr-2" />
                  {t("community.muteUser", "Mute this user")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: t("community.reported", "Thanks for reporting. We'll review this.") }); }} className="text-destructive focus:text-destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t("community.reportPost", "Report post")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post body */}
      <div className="px-4 pb-3">
        <button onClick={onClick} className="w-full text-left">
          <h3 className="font-semibold text-[15px] text-foreground leading-snug mb-1">
            {post.title}
          </h3>
        </button>
        {post.category === "poll" ? (
          <PollDisplay postId={post.id} body={post.body} />
        ) : (
          <button onClick={onClick} className="w-full text-left">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {post.body}
            </p>
            {post.reply_count === 0 && post.category === 'question' && (
              <p className="text-xs text-primary font-medium mt-2">{t("community.beFirstAnswer", "Be the first to answer!")}</p>
            )}
          </button>
        )}
      </div>

      {/* Reaction + comment count summary */}
      <div className="flex items-center justify-between px-4 py-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {totalReactions > 0 && (
            <>
              <div className="flex -space-x-0.5">
                {reactions.slice(0, 3).map((r) => (
                  <span key={r.emoji} className="text-sm">{r.emoji}</span>
                ))}
              </div>
              <span className="ml-1">{totalReactions}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {post.reply_count > 0 && (
            <button onClick={onClick} className="hover:underline">
              {t("community.commentCount", "{{count}} comment", { count: post.reply_count })}{post.reply_count !== 1 ? 's' : ''}
            </button>
          )}
          {post.upvotes > 0 && (
            <span>{t("community.upvoteCount", "{{count}} upvote", { count: post.upvotes })}{post.upvotes !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Action bar */}
      <div className="flex items-center px-2 py-1">
        {/* Like with emoji picker */}
        <div className="relative flex-1">
          <button
            onClick={(e) => { e.stopPropagation(); toggleReaction("👍"); }}
            onMouseEnter={() => setShowEmojis(true)}
            onMouseLeave={() => setShowEmojis(false)}
            className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-md text-sm font-medium transition-colors ${
              userHasReacted
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ThumbsUp className="w-4 h-4" fill={userHasReacted ? "currentColor" : "none"} />
            <span>{userHasReacted ? t("community.liked", "Liked") : t("community.like", "Like")}</span>
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

        {/* Comment */}
        <button
          onClick={onClick}
          className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t("community.comment", "Comment")}</span>
        </button>

        {/* Share */}
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
    </div>
  );
};
