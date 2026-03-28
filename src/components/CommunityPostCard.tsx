import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowBigUp, MessageCircle, Pin, ThumbsUp, Flag, Bookmark, BookmarkCheck, Globe, MoreHorizontal, Link2, BellPlus, BellOff, EyeOff, UserX, AlertTriangle, Copy, Pencil, Image as ImageIcon, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserTierBadge } from "@/components/UserTierBadge";
import { VerifiedBuyerBadge } from "@/components/VerifiedBuyerBadge";
import { ShareMenu } from "@/components/ShareMenu";
import { PollDisplay } from "@/components/PollDisplay";
import { toast } from "@/hooks/use-toast";
import { useReactions, type ReactionSummary } from "@/hooks/useReactions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { ReportButton } from "@/components/ReportButton";
import { sanitizeDisplayText } from "@/lib/contentSanitizer";
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
  onEdit?: (post: CommunityPost) => void;
}

export const CommunityPostCard = ({ post, onClick, onVote, onTogglePin, onEdit }: Props) => {
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
    <div className={`bg-card border rounded-lg overflow-hidden shadow-sm ${post.is_pinned ? 'border-primary/40 ring-1 ring-primary/20' : (post as any).moderation_status === 'warning' ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-border'}`}>
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/5 text-primary text-xs font-medium border-b border-primary/10">
          <Pin className="w-3 h-3" />
          {t("community.pinnedPost", "Pinned post")}
        </div>
      )}
      {/* Warning banner for moderation_status === 'warning' */}
      {(post as any).moderation_status === 'warning' && (post as any).flagged_at && (() => {
        const elapsed = Date.now() - new Date((post as any).flagged_at).getTime();
        const remainingMins = Math.max(0, Math.ceil((100 * 60 * 1000 - elapsed) / 60000));
        return (
          <div className="flex flex-col gap-1 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                {t("contentGuard.warningBanner", "⚠️ This content is under review for objectivity. The author has {{minutes}} minutes to edit with evidence and polite language.", { minutes: remainingMins })}
              </p>
            </div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80 ps-5">
              {t("contentGuard.businessRights", "Businesses have the right to take legal action against defamatory content.")}
            </p>
          </div>
        );
      })()}
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
            <VerifiedBuyerBadge userId={post.user_id} compact />
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
              {isSaved ? <BookmarkCheck className="w-4 h-4 me-2 text-primary" /> : <Bookmark className="w-4 h-4 me-2" />}
              {isSaved ? t("community.unsavePost", "Unsave post") : t("community.savePost", "Save post")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`); toast({ title: t("community.linkCopied", "Link copied!") }); }}>
              <Link2 className="w-4 h-4 me-2" />
              {t("community.copyLink", "Copy link")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsFollowing(!isFollowing); toast({ title: isFollowing ? t("community.unfollowed", "Notifications off for this post") : t("community.followed", "You'll be notified of new comments") }); }}>
              {isFollowing ? <BellOff className="w-4 h-4 me-2" /> : <BellPlus className="w-4 h-4 me-2" />}
              {isFollowing ? t("community.turnOffNotifications", "Turn off notifications") : t("community.turnOnNotifications", "Turn on notifications")}
            </DropdownMenuItem>
            {isAdmin && onTogglePin && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(post.id, post.is_pinned); }}>
                <Pin className="w-4 h-4 me-2" />
                {post.is_pinned ? t("community.unpinPost", "Unpin post") : t("community.pinPost", "Pin to top")}
              </DropdownMenuItem>
            )}
            {isOwnPost && onEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}>
                <Pencil className="w-4 h-4 me-2" />
                {t("community.editPost", "Edit post")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {!isOwnPost && (
              <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: t("community.postHidden", "Post hidden from your feed") }); }}>
                  <EyeOff className="w-4 h-4 me-2" />
                  {t("community.hidePost", "Hide post")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: t("community.userMuted", "You won't see posts from this user") }); }}>
                  <UserX className="w-4 h-4 me-2" />
                  {t("community.muteUser", "Mute this user")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: t("community.reported", "Thanks for reporting. We'll review this.") }); }} className="text-destructive focus:text-destructive">
                  <AlertTriangle className="w-4 h-4 me-2" />
                  {t("community.reportPost", "Report post")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post body */}
      <div className="px-4 pb-3">
        <button onClick={onClick} className="w-full text-start">
          <h3 className="font-semibold text-[15px] text-foreground leading-snug mb-1">
            {post.title}
          </h3>
        </button>
        {post.category === "poll" ? (
          <PollDisplay postId={post.id} body={post.body} />
        ) : (
          <button onClick={onClick} className="w-full text-start">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {sanitizeDisplayText(post.body)}
            </p>
            {post.reply_count === 0 && post.category === 'question' && (
              <p className="text-xs text-primary font-medium mt-2">{t("community.beFirstAnswer", "Be the first to answer!")}</p>
            )}
          </button>
        )}
        {/* Attached images */}
        {(post as any).image_urls?.length > 0 && (
          <div className={`mt-2 grid gap-1 ${(post as any).image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {((post as any).image_urls as string[]).slice(0, 4).map((url, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-border cursor-pointer" onClick={onClick}>
                <img src={url} alt="" className="w-full h-40 object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
        {/* Attached link */}
        {(post as any).link_url && (
          <a
            href={(post as any).link_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs text-primary hover:underline truncate"
          >
            <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{(post as any).link_url}</span>
          </a>
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
              <span className="ms-1">{totalReactions}</span>
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
              className="absolute -top-11 start-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5 shadow-xl"
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
            description={`${post.upvotes > 0 ? `👍 ${post.upvotes} upvotes` : ""}${post.reply_count > 0 ? ` · 💬 ${post.reply_count} replies` : ""} — Join the discussion on R8ESTATE Community`}
            url={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-community?post=${post.id}`}
            iconOnly={false}
            variant="ghost"
            size="sm"
            className="w-full justify-center h-auto py-2 text-sm font-medium text-muted-foreground hover:bg-secondary gap-1.5"
          />
        </div>

        {/* Report */}
        {!isOwnPost && (
          <div className="flex items-center justify-center px-2">
            <ReportButton contentType="post" contentId={post.id} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};
