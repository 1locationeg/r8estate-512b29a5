import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, ArrowLeft, Send, ThumbsUp, Flag, Bookmark, BookmarkCheck, Globe, MoreHorizontal, CornerDownRight, Forward, Smile, Image as ImageIcon, Sticker, Type, Link2, Pencil, BellPlus, BellOff, EyeOff, UserX, AlertTriangle, Pin, X, Check, Loader2, Bold, Italic, List, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserTierBadge } from "@/components/UserTierBadge";
import { ShareMenu } from "@/components/ShareMenu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useReactions } from "@/hooks/useReactions";
import type { CommunityPost, CommunityReply } from "@/hooks/useCommunity";
import { useCommunityActions } from "@/hooks/useCommunity";
import { CommunityAiReplySuggestions } from "@/components/CommunityAiReplySuggestions";
import { DeveloperBridgeCard } from "@/components/DeveloperBridgeCard";
import { supabase } from "@/integrations/supabase/client";

const EMOJI_GRID = [
  "😀", "😂", "😍", "🤔", "👍", "👎", "🔥", "💯",
  "❤️", "💪", "🎉", "⚠️", "✅", "❌", "🏠", "🏗️",
  "📊", "💰", "🤝", "👀", "🙏", "💡", "📢", "⭐",
  "🚀", "🎯", "💎", "🏆", "📝", "🔑", "📍", "🕐",
];

const reactionEmojis = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
];

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

// ── Extracted stable components ──

const CommentComposer = ({
  parentReplyId,
  autoFocus,
  replyText,
  onReplyTextChange,
  onSubmit,
  submitting,
  displayName,
  avatarUrl,
  user,
  postTitle,
  postBody,
}: {
  parentReplyId?: string | null;
  autoFocus?: boolean;
  replyText: string;
  onReplyTextChange: (val: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  displayName: string;
  avatarUrl?: string;
  user: any;
  postTitle: string;
  postBody: string;
}) => {
  const { t } = useTranslation();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const quickEmojis = ["😀", "😂", "❤️", "🔥", "👏", "💯", "🙌", "😍", "🤔", "👀", "🎉", "💪", "😎", "🏠", "🏗️", "📍"];

  const insertEmoji = (emoji: string) => {
    onReplyTextChange(replyText + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`flex items-start gap-2 ${parentReplyId ? 'ms-12 mt-2' : 'px-4 py-3'}`}>
      <Avatar className="h-8 w-8 mt-0.5 flex-shrink-0">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-[10px] bg-secondary font-semibold">{displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {user && (
          <p className="text-[11px] text-muted-foreground mb-1">
            {t("community.commentingAs", "Commenting as")} <span className="font-medium">{displayName}</span>
          </p>
        )}
        {!parentReplyId && user && (
          <CommunityAiReplySuggestions
            postTitle={postTitle}
            postBody={postBody}
            onSelectReply={(text) => onReplyTextChange(text)}
          />
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              placeholder={t("community.writeComment", "Write a comment...")}
              autoFocus={autoFocus}
              className="min-h-[40px] max-h-[120px] text-sm rounded-2xl bg-secondary border-0 resize-none py-2 px-3 pe-10 focus-visible:ring-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={onSubmit}
              disabled={submitting || !replyText.trim()}
              className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-primary flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {/* Emoji toolbar */}
        <div className="flex items-center gap-0.5 mt-1 relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title={t("community.emoji", "Emoji")}
          >
            <Smile className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed"
            title={t("community.photo", "Photo")}
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed"
            title={t("community.gif", "GIF")}
          >
            <span className="text-[10px] font-bold leading-none">GIF</span>
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed"
            title={t("community.sticker", "Sticker")}
          >
            <Sticker className="w-4 h-4" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full start-0 mb-1 z-50 bg-card border border-border rounded-xl shadow-xl p-2 grid grid-cols-8 gap-1 w-[220px]">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="text-lg hover:scale-125 transition-transform p-0.5 rounded hover:bg-secondary"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({
  reply,
  isNested,
  replyingTo,
  setReplyingTo,
  replyText,
  onReplyTextChange,
  onSubmit,
  submitting,
  displayName,
  avatarUrl,
  user,
  postTitle,
  postBody,
}: {
  reply: CommunityReply;
  isNested?: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  onReplyTextChange: (val: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  displayName: string;
  avatarUrl?: string;
  user: any;
  postTitle: string;
  postBody: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className={`${isNested ? 'ms-12' : ''} py-1`}>
      <div className="flex items-start gap-2">
        <Avatar className={`${isNested ? 'h-6 w-6' : 'h-8 w-8'} mt-0.5 flex-shrink-0`}>
          <AvatarImage src={reply.author_avatar} />
          <AvatarFallback className="text-[8px] bg-secondary font-semibold">{reply.author_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-secondary rounded-2xl px-3 py-2 inline-block max-w-full">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-semibold text-foreground">{reply.author_name}</span>
              <UserTierBadge userId={reply.user_id} />
            </div>
            <p className="text-sm text-foreground leading-relaxed break-words">{reply.body}</p>
          </div>

          <div className="flex items-center gap-3 px-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{timeAgo(reply.created_at, t)}</span>
            <InlineReactionButton targetId={reply.id} targetType="reply" />
            {!isNested && (
              <button
                onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("community.reply", "Reply")}
              </button>
            )}
          </div>
        </div>
      </div>

      {reply.children?.map(child => (
        <CommentItem
          key={child.id}
          reply={child}
          isNested
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          onSubmit={onSubmit}
          submitting={submitting}
          displayName={displayName}
          avatarUrl={avatarUrl}
          user={user}
          postTitle={postTitle}
          postBody={postBody}
        />
      ))}
      {replyingTo === reply.id && (
        <CommentComposer
          parentReplyId={reply.id}
          autoFocus
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          onSubmit={onSubmit}
          submitting={submitting}
          displayName={displayName}
          avatarUrl={avatarUrl}
          user={user}
          postTitle={postTitle}
          postBody={postBody}
        />
      )}
    </div>
  );
};

const PostReactionSummary = ({ postId, replyCount }: { postId: string; replyCount: number }) => {
  const { t } = useTranslation();
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
        <span>{t("community.commentCount", "{{count}} comment", { count: replyCount })}{replyCount !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

const PostLikeButton = ({ postId }: { postId: string }) => {
  const { t } = useTranslation();
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
  );
};

const InlineReactionButton = ({ targetId, targetType }: { targetId: string; targetType: 'post' | 'reply' }) => {
  const { t } = useTranslation();
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
        {t("community.like", "Like")}{totalReactions > 0 ? ` · ${totalReactions}` : ''}
      </button>
      {showEmojis && (
        <div
          onMouseEnter={() => setShowEmojis(true)}
          onMouseLeave={() => setShowEmojis(false)}
          className="absolute -top-9 start-0 z-50 flex items-center gap-0.5 bg-card border border-border rounded-full px-2 py-1 shadow-xl"
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
  );
};

const PostDropdownMenu = ({ post, user, onEdit }: { post: CommunityPost; user: any; onEdit?: (post: CommunityPost) => void }) => {
  const { t } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwnPost = user?.id === post.user_id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => { setIsSaved(!isSaved); toast({ title: isSaved ? t("community.unsaved", "Post unsaved") : t("community.saved", "Post saved") }); }}>
          {isSaved ? <BookmarkCheck className="w-4 h-4 me-2 text-primary" /> : <Bookmark className="w-4 h-4 me-2" />}
          {isSaved ? t("community.unsavePost", "Unsave post") : t("community.savePost", "Save post")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`); toast({ title: t("community.linkCopied", "Link copied!") }); }}>
          <Link2 className="w-4 h-4 me-2" />
          {t("community.copyLink", "Copy link")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setIsFollowing(!isFollowing); toast({ title: isFollowing ? t("community.unfollowed", "Notifications off for this post") : t("community.followed", "You'll be notified of new comments") }); }}>
          {isFollowing ? <BellOff className="w-4 h-4 me-2" /> : <BellPlus className="w-4 h-4 me-2" />}
          {isFollowing ? t("community.turnOffNotifications", "Turn off notifications") : t("community.turnOnNotifications", "Turn on notifications")}
        </DropdownMenuItem>
        {isOwnPost && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(post)}>
            <Pencil className="w-4 h-4 me-2" />
            {t("community.editPost", "Edit post")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!isOwnPost && (
          <>
            <DropdownMenuItem onClick={() => toast({ title: t("community.postHidden", "Post hidden from your feed") })}>
              <EyeOff className="w-4 h-4 me-2" />
              {t("community.hidePost", "Hide post")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: t("community.userMuted", "You won't see posts from this user") })}>
              <UserX className="w-4 h-4 me-2" />
              {t("community.muteUser", "Mute this user")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: t("community.reported", "Thanks for reporting. We'll review this.") })} className="text-destructive focus:text-destructive">
              <AlertTriangle className="w-4 h-4 me-2" />
              {t("community.reportPost", "Report post")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── Main component ──

interface Props {
  post: CommunityPost;
  replies: CommunityReply[];
  onBack: () => void;
  onVotePost: () => void;
  onVoteReply: (replyId: string) => void;
  onRefetch: () => void;
  onEdit?: (post: CommunityPost) => void;
}

export const CommunityPostDetail = ({ post, replies, onBack, onVotePost, onVoteReply, onRefetch, onEdit }: Props) => {
  const { t } = useTranslation();
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { createReply, updatePost } = useCommunityActions();
  const { user, profile } = useAuth();

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [editImageUrls, setEditImageUrls] = useState<string[]>((post as any).image_urls || []);
  const [editLinkUrl, setEditLinkUrl] = useState<string>((post as any).link_url || "");
  const [showEditLink, setShowEditLink] = useState(!!(post as any).link_url);
  const [editSaving, setEditSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editBodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnPost = user?.id === post.user_id;

  const startEditing = () => {
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditImageUrls((post as any).image_urls || []);
    setEditLinkUrl((post as any).link_url || "");
    setShowEditLink(!!(post as any).link_url);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const insertAtCursor = (text: string) => {
    const textarea = editBodyRef.current;
    if (!textarea) { setEditBody(prev => prev + text); return; }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = editBody.slice(0, start) + text + editBody.slice(end);
    setEditBody(newBody);
    setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + text.length; textarea.focus(); }, 0);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const textarea = editBodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editBody.slice(start, end);
    const newBody = editBody.slice(0, start) + prefix + selected + suffix + editBody.slice(end);
    setEditBody(newBody);
    setTimeout(() => { textarea.selectionStart = start + prefix.length; textarea.selectionEnd = end + prefix.length; textarea.focus(); }, 0);
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) continue;
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("community-images").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("community-images").getPublicUrl(path);
        if (urlData?.publicUrl) setEditImageUrls(prev => [...prev, urlData.publicUrl]);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    setEditSaving(true);
    const result = await updatePost(post.id, {
      title: editTitle.trim(),
      body: editBody.trim(),
      image_urls: editImageUrls,
      link_url: editLinkUrl.trim() || null,
    });
    if (result) {
      setIsEditing(false);
      onRefetch();
    }
    setEditSaving(false);
  };

  const categoryConfig: Record<string, { label: string; className: string }> = {
    question: { label: t("community.question", "Question"), className: "bg-blue-500/10 text-blue-600 border-blue-200" },
    discussion: { label: t("community.discussion", "Discussion"), className: "bg-primary/10 text-primary border-primary/20" },
    tip: { label: t("community.tip", "Tip"), className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    experience: { label: t("community.experience", "Experience"), className: "bg-amber-500/10 text-amber-600 border-amber-200" },
    poll: { label: t("community.poll", "Poll"), className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  };

  const cat = categoryConfig[post.category] || categoryConfig.discussion;
  const displayName = profile?.full_name || user?.email?.split('@')[0] || t("community.anonymous", "Anonymous");
  const avatarUrl = profile?.avatar_url || undefined;

  const handleSubmitReply = useCallback(async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    const result = await createReply(post.id, replyText.trim(), replyingTo || undefined);
    if (result) {
      setReplyText("");
      setReplyingTo(null);
      onRefetch();
    }
    setSubmitting(false);
  }, [replyText, replyingTo, post.id, createReply, onRefetch]);

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t("community.backToCommunity", "Back to Community")}
      </button>

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
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
              <span>{timeAgo(post.created_at, t)}</span>
              <span>·</span>
              <Globe className="w-3 h-3" />
              <span>·</span>
              <Badge variant="outline" className={`text-[9px] px-1 py-0 leading-tight ${cat.className}`}>
                {cat.label}
              </Badge>
            </div>
          </div>
          {!isEditing && (
            <PostDropdownMenu post={post} user={user} onEdit={isOwnPost ? () => startEditing() : undefined} />
          )}
        </div>

        <div className="px-4 pb-3">
          {isEditing ? (
            <div className="space-y-3">
              {/* Editable title */}
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-base font-bold"
                placeholder={t("community.postTitle", "Post title")}
              />

              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1 bg-secondary/30">
                <button onClick={() => wrapSelection("**", "**")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => wrapSelection("_", "_")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => insertAtCursor("\n- ")} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="List">
                  <List className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Emoji">
                      <Smile className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2" align="start">
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJI_GRID.map((emoji) => (
                        <button key={emoji} onClick={() => insertAtCursor(emoji)} className="text-lg p-1 rounded hover:bg-secondary transition-colors">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Image">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setShowEditLink(!showEditLink)} className={`p-1.5 rounded hover:bg-secondary transition-colors ${showEditLink ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} title="Link">
                  <Link2 className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageUpload} />
              </div>

              {/* Editable body */}
              <Textarea
                ref={editBodyRef}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="min-h-[120px] text-sm"
                placeholder={t("community.writePost", "Write your post...")}
              />

              {/* Image previews */}
              {editImageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {editImageUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-border group">
                      <img src={url} alt="" className="w-full h-24 object-cover" />
                      <button
                        onClick={() => setEditImageUrls(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 end-1 p-1 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                </div>
              )}

              {/* Link input */}
              {showEditLink && (
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    value={editLinkUrl}
                    onChange={(e) => setEditLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="text-sm"
                  />
                  <button onClick={() => { setShowEditLink(false); setEditLinkUrl(""); }} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Save / Cancel */}
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={editSaving}>
                  <X className="w-4 h-4 me-1" /> {t("community.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={saveEdit} disabled={editSaving || !editTitle.trim() || !editBody.trim()}>
                  {editSaving ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Check className="w-4 h-4 me-1" />}
                  {t("community.saveChanges", "Save changes")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-base font-bold text-foreground mb-1.5">{post.title}</h1>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p>
              {(post as any).image_urls?.length > 0 && (
                <div className={`mt-3 grid gap-1.5 ${(post as any).image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {((post as any).image_urls as string[]).map((url: string, idx: number) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full max-h-80 object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
              {(post as any).link_url && (
                <a
                  href={(post as any).link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-primary hover:underline"
                >
                  <Link2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{(post as any).link_url}</span>
                </a>
              )}
            </>
          )}
        </div>

        <div className="px-4">
          <DeveloperBridgeCard post={post} />
        </div>

        <PostReactionSummary postId={post.id} replyCount={post.reply_count} />
        <div className="mx-4 border-t border-border" />

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
            <span>{t("community.comment", "Comment")}</span>
          </button>
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
        </div>

        <div className="mx-4 border-t border-border" />
        {!replyingTo && (
          <CommentComposer
            replyText={replyText}
            onReplyTextChange={setReplyText}
            onSubmit={handleSubmitReply}
            submitting={submitting}
            displayName={displayName}
            avatarUrl={avatarUrl}
            user={user}
            postTitle={post.title}
            postBody={post.body}
          />
        )}

        {replies.length > 0 && (
          <>
            <div className="mx-4 border-t border-border" />
            <div className="px-4 py-2 space-y-1">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  reply={reply}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  onReplyTextChange={setReplyText}
                  onSubmit={handleSubmitReply}
                  submitting={submitting}
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  user={user}
                  postTitle={post.title}
                  postBody={post.body}
                />
              ))}
            </div>
          </>
        )}

        {replies.length === 0 && (
          <div className="px-4 pb-4 pt-2 text-center">
            <p className="text-muted-foreground text-xs">{t("community.noComments", "No comments yet. Be the first to comment!")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
