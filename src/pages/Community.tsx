import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, TrendingUp, Clock, MessageCircle, Users, X, Trophy, Edit3, ImageIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommunityPostCard } from "@/components/CommunityPostCard";
import { CommunityPostDetail } from "@/components/CommunityPostDetail";
import { CommunityNewPost } from "@/components/CommunityNewPost";
import { useCommunityPosts, useCommunityPost, useCommunityActions, type CommunityPostCategory } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { developers } from "@/data/mockData";
import { Loader2 } from "lucide-react";

const categoryFilters: { value: CommunityPostCategory | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "question", label: "❓ Questions" },
  { value: "discussion", label: "💬 Discussions" },
  { value: "tip", label: "💡 Tips" },
  { value: "experience", label: "📖 Experiences" },
  { value: "poll", label: "📊 Polls" },
];

const sortOptions = [
  { value: 'trending' as const, label: "Trending", icon: TrendingUp },
  { value: 'newest' as const, label: "Newest", icon: Clock },
  { value: 'discussed' as const, label: "Most Discussed", icon: MessageCircle },
];

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [category, setCategory] = useState<CommunityPostCategory | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'discussed'>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(searchParams.get("post"));
  const developerFilter = searchParams.get("developer") || undefined;

  const { posts, loading, refetch } = useCommunityPosts(category, sortBy, developerFilter);
  const { post: detailPost, replies, loading: detailLoading, refetch: refetchDetail } = useCommunityPost(selectedPostId);
  const { toggleVote } = useCommunityActions();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const postParam = searchParams.get("post");
    if (postParam) setSelectedPostId(postParam);
  }, [searchParams]);

  useEffect(() => {
    const shouldOpenNewPost = searchParams.get("newPost") === "true";
    const devParam = searchParams.get("developer");
    if (shouldOpenNewPost && !showNewPost) {
      if (!user) { navigate("/auth"); return; }
      setShowNewPost(true);
      const p = new URLSearchParams(searchParams);
      p.delete("newPost");
      p.delete("developer");
      if (devParam) p.set("developer", devParam);
      setSearchParams(p, { replace: true });
    }
  }, [searchParams, showNewPost, user, navigate, setSearchParams]);

  const filteredPosts = searchQuery
    ? posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.body.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  const handleSelectPost = (id: string) => {
    setSelectedPostId(id);
    setSearchParams({ post: id });
  };

  const handleBack = () => {
    setSelectedPostId(null);
    setSearchParams({});
  };

  const handleVotePost = async (postId: string) => {
    await toggleVote(postId);
    if (selectedPostId) refetchDetail();
    else refetch();
  };

  const handleVoteReply = async (replyId: string) => {
    await toggleVote(undefined, replyId);
    refetchDetail();
  };

  // Detail view
  if (selectedPostId && detailPost) {
    return (
      <div className="min-h-screen bg-muted/50">
        <div className="max-w-[680px] mx-auto px-4 py-4">
          <CommunityPostDetail
            post={detailPost}
            replies={replies}
            onBack={handleBack}
            onVotePost={() => handleVotePost(detailPost.id)}
            onVoteReply={handleVoteReply}
            onRefetch={refetchDetail}
          />
        </div>
      </div>
    );
  }

  if (selectedPostId && detailLoading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-[680px] mx-auto px-4 py-4 space-y-3">

        {/* "What's on your mind?" composer card — Facebook style */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary font-semibold text-sm">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => {
                if (!user) { navigate("/auth"); return; }
                setShowNewPost(true);
              }}
              className="flex-1 bg-secondary hover:bg-secondary/80 rounded-full px-4 py-2.5 text-sm text-muted-foreground text-left transition-colors"
            >
              What's on your mind, {user ? displayName.split(' ')[0] : 'Guest'}?
            </button>
          </div>
          <div className="border-t border-border mt-3 pt-3 flex items-center justify-around">
            <button
              onClick={() => {
                if (!user) { navigate("/auth"); return; }
                setShowNewPost(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Edit3 className="w-4 h-4 text-primary" />
              <span>Discussion</span>
            </button>
            <button
              onClick={() => {
                if (!user) { navigate("/auth"); return; }
                setShowNewPost(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>Question</span>
            </button>
            <button
              onClick={() => {
                if (!user) { navigate("/auth"); return; }
                setShowNewPost(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span>Poll</span>
            </button>
          </div>
        </div>

        {/* Developer filter banner */}
        {developerFilter && (() => {
          const dev = developers.find(d => d.id === developerFilter);
          return (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-xs">
              <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground font-medium">
                Showing discussions about <span className="text-primary">{dev?.name || 'this developer'}</span>
              </span>
              <button
                onClick={() => { const p = new URLSearchParams(searchParams); p.delete("developer"); setSearchParams(p); }}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm rounded-full bg-card border-border"
          />
        </div>

        {/* Filters row: categories + sort */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-3">
          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
            {categoryFilters.map(cat => (
              <button
                key={cat.label}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  category === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1 pt-2 border-t border-border">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  sortBy === opt.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <opt.icon className="w-3 h-3" />
                {opt.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{posts.length} posts</span>
            </div>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg shadow-sm text-center py-16 space-y-3">
            <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">No posts yet. Start the conversation!</p>
            <Button
              size="sm"
              onClick={() => {
                if (!user) { navigate("/auth"); return; }
                setShowNewPost(true);
              }}
            >
              Create the first post
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map(post => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onClick={() => handleSelectPost(post.id)}
                onVote={() => handleVotePost(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CommunityNewPost
        open={showNewPost}
        onOpenChange={setShowNewPost}
        onCreated={refetch}
        prefillDeveloper={developerFilter}
      />
    </div>
  );
};

export default Community;
