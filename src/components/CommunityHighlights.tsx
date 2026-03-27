import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowBigUp, MessageCircle, ArrowRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCommunityPosts } from "@/hooks/useCommunity";

export const CommunityHighlights = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { posts, loading } = useCommunityPosts(undefined, 'trending');

  const categoryConfig: Record<string, { labelKey: string; className: string }> = {
    question: { labelKey: "community.question", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
    discussion: { labelKey: "community.discussion", className: "bg-primary/10 text-primary border-primary/20" },
    tip: { labelKey: "community.tip", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    experience: { labelKey: "community.experience", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
    poll: { labelKey: "community.poll", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  };

  const topPosts = posts.slice(0, 4);

  if (loading || topPosts.length === 0) return null;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">{t("widgets.communityTitle")}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/community")}
          className="text-xs text-primary h-7 px-2 gap-1"
        >
          {t("widgets.joinConversation")} <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {topPosts.map(post => {
          const cat = categoryConfig[post.category] || categoryConfig.discussion;
          return (
            <button
              key={post.id}
              onClick={() => navigate(`/community?post=${post.id}`)}
              className="min-w-[240px] max-w-[280px] bg-card border border-border rounded-xl p-3 text-start hover:border-primary/30 transition-all flex-shrink-0"
            >
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 mb-1.5 ${cat.className}`}>
                {t(cat.labelKey)}
              </Badge>
              <h4 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{post.title}</h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">{post.body}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <ArrowBigUp className="w-3 h-3" /> {post.upvotes}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="w-3 h-3" /> {post.reply_count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
