import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { reviews as mockReviews, Review, ReviewerTier } from "@/data/mockData";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewFilters, ReviewFilterType } from "@/components/ReviewFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

const Reviews = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showMineOnly = searchParams.get("mine") === "true";
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReviewFilterType>("all");
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllReviews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const mapped: Review[] = data.map((r: any) => ({
            id: r.id,
            developerId: r.developer_id,
            author: r.is_anonymous ? "Anonymous User" : r.author_name,
            profileVerified: r.is_verified,
            tier: "bronze" as ReviewerTier,
            rating: r.rating,
            date: new Date(r.created_at).toISOString().split("T")[0],
            project: r.experience_type || "General",
            comment: r.comment,
            verified: r.is_verified,
            userId: r.user_id,
          } as Review & { userId: string }));
          setDbReviews(mapped);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllReviews();
  }, []);

  // Combine DB reviews with mock reviews, dedup by id
  const allReviews = useMemo(() => {
    if (showMineOnly && user) {
      // When viewing "My Reviews", only show DB reviews by this user
      return dbReviews.filter((r) => (r as any).userId === user.id);
    }
    const dbIds = new Set(dbReviews.map((r) => r.id));
    const uniqueMock = mockReviews.filter((r) => !dbIds.has(r.id));
    return [...dbReviews, ...uniqueMock];
  }, [dbReviews, showMineOnly, user]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === "all") return allReviews;
    return allReviews.filter((r) => r.rating === Number(activeFilter));
  }, [allReviews, activeFilter]);

  const stats = useMemo(() => {
    const total = allReviews.length;
    const avg =
      total > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : "0.0";
    return { total, avg };
  }, [allReviews]);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="R8ESTATE" className="h-8 w-8 object-contain" />
            <h1 className="text-xl font-bold text-foreground">
              {t("nav.reviews", "Reviews")}
            </h1>
          </div>
          <Button
            size="sm"
            className="rounded-full h-9 w-9 p-0"
            onClick={() => {
              if (user) {
                setWriteModalOpen(true);
              } else {
                navigate("/auth");
              }
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Stats */}
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">
              {t("reviews.totalReviews", "Reviews")}
            </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.avg}</p>
            <p className="text-xs text-muted-foreground">
              {t("reviews.avgRating", "Avg Rating")}
            </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">
              {allReviews.filter((r) => r.verified).length}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("reviews.verified", "Verified")}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="overflow-x-auto -mx-4 px-4">
          <ReviewFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">
              {t("reviews.noReviews", "No reviews found")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      {writeModalOpen && (
        <WriteReviewModal
          open={writeModalOpen}
          onOpenChange={setWriteModalOpen}
          developerId=""
          developerName=""
          onReviewSubmitted={() => {
            setWriteModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Reviews;
