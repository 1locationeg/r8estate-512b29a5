import { ArrowBigUp, MessageCircle, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommunityPost } from "@/hooks/useCommunity";

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
  onClick: () => void;
  onVote: () => void;
}

export const CommunityPostCard = ({ post, onClick, onVote }: Props) => {
  const cat = categoryConfig[post.category] || categoryConfig.discussion;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
    >
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
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{post.reply_count}</span>
            </div>
            <span>{timeAgo(post.created_at)}</span>
            {post.reply_count === 0 && post.category === 'question' && (
              <span className="text-primary font-medium">Be the first to answer!</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
