import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Bookmark,
  Users,
  Star,
  HelpCircle,
  Eye,
  Activity,
  Trash2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";

interface SavedItem {
  id: string;
  item_id: string;
  item_type: string;
  item_name: string;
  item_image: string | null;
  created_at: string;
}

interface FollowedBusiness {
  id: string;
  business_id: string;
  business_name: string;
  created_at: string;
}

interface UserReview {
  id: string;
  developer_name: string | null;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
}

type TabKey = "saved" | "following" | "reviews" | "questions" | "watchlist" | "activity";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "following", label: "Following", icon: Users },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "questions", label: "Questions", icon: HelpCircle },
  { key: "watchlist", label: "Watchlist", icon: Eye },
  { key: "activity", label: "Activity", icon: Activity },
];

const Portfolio = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("saved");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [followedBusinesses, setFollowedBusinesses] = useState<FollowedBusiness[]>([]);
  const [myReviews, setMyReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [savedRes, followRes, reviewsRes] = await Promise.all([
      supabase
        .from("saved_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("followed_businesses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("id, developer_name, rating, title, comment, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (savedRes.data) setSavedItems(savedRes.data);
    if (followRes.data) setFollowedBusinesses(followRes.data);
    if (reviewsRes.data) setMyReviews(reviewsRes.data);
    setLoading(false);
  };

  const removeSavedItem = async (id: string) => {
    const { error } = await supabase.from("saved_items").delete().eq("id", id);
    if (!error) {
      setSavedItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Removed", description: "Item removed from saved." });
    }
  };

  const unfollowBusiness = async (id: string) => {
    const { error } = await supabase.from("followed_businesses").delete().eq("id", id);
    if (!error) {
      setFollowedBusinesses((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Unfollowed", description: "Business unfollowed." });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );

  const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );

  const renderSaved = () => {
    if (savedItems.length === 0)
      return (
        <EmptyState
          icon={Bookmark}
          title="No saved items yet"
          description="Bookmark developers, projects, or units you're interested in and they'll appear here."
          actionLabel="Browse Directory"
          onAction={() => navigate("/directory")}
        />
      );
    return (
      <div className="space-y-3">
        {savedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {item.item_image ? (
                  <img src={item.item_image} alt={item.item_name} className="h-full w-full object-cover" />
                ) : (
                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{item.item_name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {item.item_type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{formatDate(item.created_at)}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeSavedItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFollowing = () => {
    if (followedBusinesses.length === 0)
      return (
        <EmptyState
          icon={Users}
          title="Not following anyone"
          description="Follow developers to get updates on new projects, reviews, and announcements."
          actionLabel="Explore Developers"
          onAction={() => navigate("/directory")}
        />
      );
    return (
      <div className="space-y-3">
        {followedBusinesses.map((biz) => (
          <Card key={biz.id} className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {biz.business_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{biz.business_name}</p>
                <span className="text-[10px] text-muted-foreground">
                  Following since {formatDate(biz.created_at)}
                </span>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => unfollowBusiness(biz.id)}>
                Unfollow
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderReviews = () => {
    if (myReviews.length === 0)
      return (
        <EmptyState
          icon={Star}
          title="No reviews written"
          description="Share your experience with developers you've worked with."
          actionLabel="Write a Review"
          onAction={() => navigate("/reviews")}
        />
      );
    return (
      <div className="space-y-3">
        {myReviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {review.developer_name || "Developer"}
                  </p>
                  {review.title && (
                    <p className="text-xs text-muted-foreground truncate">{review.title}</p>
                  )}
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {formatDate(review.created_at)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuestions = () => (
    <EmptyState
      icon={HelpCircle}
      title="No questions yet"
      description="Ask questions about developers or projects and track replies here."
    />
  );

  const renderWatchlist = () => (
    <EmptyState
      icon={Eye}
      title="Watchlist is empty"
      description="Add items to your watchlist to monitor price changes, new reviews, and updates."
      actionLabel="Browse Directory"
      onAction={() => navigate("/directory")}
    />
  );

  const renderActivity = () => (
    <EmptyState
      icon={Activity}
      title="No activity yet"
      description="Your engagement history — helpful votes, comments, and interactions will appear here."
    />
  );

  const tabContent: Record<TabKey, () => React.ReactNode> = {
    saved: renderSaved,
    following: renderFollowing,
    reviews: renderReviews,
    questions: renderQuestions,
    watchlist: renderWatchlist,
    activity: renderActivity,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground leading-tight">My Activity</h1>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.full_name || user.email}
            </p>
          </div>
          <img src={logoIcon} alt="R8ESTATE" className="h-8 w-8 object-contain opacity-60" />
        </div>

        {/* Tab bar */}
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-1 px-4 pb-2 min-w-max max-w-lg mx-auto">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          tabContent[activeTab]()
        )}
      </div>
    </div>
  );
};

export default Portfolio;
