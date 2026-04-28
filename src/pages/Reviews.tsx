import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { reviews as mockReviews, developers as mockDevelopers, Review, ReviewerTier } from "@/data/mockData";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewFilters, ReviewFilterType } from "@/components/ReviewFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MessageSquare, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";
import { localizeStoredReviewValue } from "@/lib/reviewCopy";
import { BUSINESS_CATEGORIES } from "@/data/businessCategories";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useHubFilters } from "@/hooks/useHubFilters";
import { HubHeroBand } from "@/components/hub/HubHeroBand";
import { HubFiltersSidebar } from "@/components/hub/HubFiltersSidebar";
import { PersonalizedReviewsStrip } from "@/components/hub/PersonalizedReviewsStrip";
import { TrendingReviewsGrid } from "@/components/hub/TrendingReviewsGrid";
import { JustPostedFeed } from "@/components/hub/JustPostedFeed";
import { WriteReviewCtaStrip } from "@/components/hub/WriteReviewCtaStrip";

interface BusinessInfo {
  name: string;
  categories: string[];
}

const Reviews = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showMineOnly = searchParams.get("mine") === "true";

  // Hub state (used for the public hub view)
  const [hubSearch, setHubSearch] = useState("");
  const { filters: hubFilters, setFilters: setHubFilters, reset: resetHub, isDirty: hubDirty } = useHubFilters();

  const [dbReviews, setDbReviews] = useState<(Review & { userId?: string; developerName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReviewFilterType>("all");
  const writeReviewParam = searchParams.get("writeReview") === "true";
  const [writeModalOpen, setWriteModalOpen] = useState(writeReviewParam);

  // ===== Public Reviews Hub (default view) =====
  if (!showMineOnly) {
    return (
      <StationPageWrapper className="min-h-screen bg-background pb-16">
        <HubHeroBand search={hubSearch} onSearchChange={setHubSearch} />

        <div className="container mx-auto max-w-6xl px-4 py-6">
          {/* Top action row */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => setSearchParams({ mine: "true" })}
                >
                  {t("reviews.myReviews", "My Reviews")}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filters trigger */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <SlidersHorizontal className="w-4 h-4 me-2" />
                      {isRTL ? "الفلاتر" : "Filters"}
                      {hubDirty && <span className="ms-2 w-2 h-2 rounded-full bg-primary" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side={isRTL ? "right" : "left"} className="w-80">
                    <div className="pt-6">
                      <HubFiltersSidebar
                        filters={hubFilters}
                        setFilters={setHubFilters}
                        isDirty={hubDirty}
                        reset={resetHub}
                        embedded
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => {
                  if (user) setWriteModalOpen(true);
                  else navigate("/auth");
                }}
              >
                <Plus className="w-4 h-4 me-1" />
                {isRTL ? "اكتب مراجعة" : "Write a review"}
              </Button>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <HubFiltersSidebar
              filters={hubFilters}
              setFilters={setHubFilters}
              isDirty={hubDirty}
              reset={resetHub}
            />

            <div className="flex-1 min-w-0">
              <PersonalizedReviewsStrip />
              <TrendingReviewsGrid filters={hubFilters} search={hubSearch} />
              <JustPostedFeed />
              <WriteReviewCtaStrip />
            </div>
          </div>
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
      </StationPageWrapper>
    );
  }

  // New filter state
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [businessSearch, setBusinessSearch] = useState("");
  const [businessMap, setBusinessMap] = useState<Record<string, BusinessInfo>>({});

  // Fetch business profiles for category mapping
  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data } = await supabase
        .from("business_profiles")
        .select("id, company_name, categories");
      if (data) {
        const map: Record<string, BusinessInfo> = {};
        data.forEach((bp: any) => {
          map[bp.id] = { name: bp.company_name || "Business", categories: bp.categories || [] };
        });
        setBusinessMap(map);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchAllReviews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const mapped = data.map((r: any) => ({
            id: r.id,
            developerId: r.developer_id,
            author: r.is_anonymous ? t("reviews.anonymousUser", "Anonymous user") : r.author_name,
            profileVerified: r.is_verified,
            tier: "bronze" as ReviewerTier,
            rating: r.rating,
            date: new Date(r.created_at).toISOString().split("T")[0],
            project: localizeStoredReviewValue(r.experience_type, t),
            comment: r.comment || "",
            verified: r.is_verified,
            userId: r.user_id,
            developerName: r.developer_name,
          }));
          setDbReviews(mapped);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllReviews();
  }, [t]);

  // Combine DB reviews with mock reviews
  const allReviews = useMemo(() => {
    if (showMineOnly && user) {
      return dbReviews.filter((r) => r.userId === user.id);
    }
    const dbIds = new Set(dbReviews.map((r) => r.id));
    const uniqueMock = mockReviews.filter((r) => !dbIds.has(r.id));
    return [...dbReviews, ...uniqueMock];
  }, [dbReviews, showMineOnly, user]);

  // Build business name resolver: developerId -> display name
  const getBusinessName = (developerId: string): string => {
    if (businessMap[developerId]) return businessMap[developerId].name;
    const mockDev = mockDevelopers.find((d) => d.id === developerId);
    if (mockDev) return mockDev.name;
    return developerId;
  };

  // Extract unique businesses from reviews with counts
  const businessTags = useMemo(() => {
    const counts: Record<string, number> = {};
    allReviews.forEach((r) => {
      const name = getBusinessName(r.developerId);
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [allReviews, businessMap]);

  // Filtered business tags by search
  const visibleTags = useMemo(() => {
    if (!businessSearch.trim()) return businessTags;
    const q = businessSearch.toLowerCase();
    return businessTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [businessTags, businessSearch]);

  // Get categories that have reviews
  const activeCategories = useMemo(() => {
    const catSet = new Set<string>();
    allReviews.forEach((r) => {
      const bp = businessMap[r.developerId];
      if (bp?.categories) {
        bp.categories.forEach((c) => catSet.add(c));
      }
    });
    return BUSINESS_CATEGORIES.filter((c) => catSet.has(c.value));
  }, [allReviews, businessMap]);

  // Chain filters: business → category → stars
  const filteredReviews = useMemo(() => {
    let result = allReviews;

    // Text search across comment, author, developer name
    if (businessSearch.trim()) {
      const q = businessSearch.toLowerCase();
      result = result.filter((r) => {
        const businessName = getBusinessName(r.developerId).toLowerCase();
        const comment = (r.comment || "").toLowerCase();
        const author = (r.author || "").toLowerCase();
        const devName = ((r as any).developerName || "").toLowerCase();
        return businessName.includes(q) || comment.includes(q) || author.includes(q) || devName.includes(q);
      });
    }

    if (selectedBusiness) {
      result = result.filter((r) => getBusinessName(r.developerId) === selectedBusiness);
    }

    if (selectedCategory) {
      result = result.filter((r) => {
        const bp = businessMap[r.developerId];
        return bp?.categories?.includes(selectedCategory);
      });
    }

    if (activeFilter !== "all") {
      result = result.filter((r) => r.rating === Number(activeFilter));
    }

    return result;
  }, [allReviews, selectedBusiness, selectedCategory, activeFilter, businessMap, businessSearch]);

  const stats = useMemo(() => {
    const total = allReviews.length;
    const avg = total > 0 ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : "0.0";
    return { total, avg };
  }, [allReviews]);

  return (
    <StationPageWrapper className="min-h-screen bg-background pb-16">
      <PageHeader
        title={t("reviews.totalReviews", "Reviews")}
        breadcrumbs={[{ label: t("reviews.totalReviews", "Reviews") }]}
        rightSlot={
          <Button
            size="sm"
            className="rounded-full h-9 w-9 p-0"
            onClick={() => {
              if (user) { setWriteModalOpen(true); } else { navigate("/auth"); }
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("reviews.searchPlaceholder", "Search reviews, businesses...")}
            value={businessSearch}
            onChange={(e) => setBusinessSearch(e.target.value)}
            className="pl-9 rounded-full h-10 bg-secondary border-0 text-sm"
          />
        </div>

        {/* Mine / All toggle */}
        {user && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={showMineOnly ? "default" : "outline"}
              className="rounded-full text-xs"
              onClick={() => setSearchParams(showMineOnly ? {} : { mine: "true" })}
            >
              {t("reviews.myReviews", "My Reviews")}
            </Button>
            <Button
              size="sm"
              variant={!showMineOnly ? "default" : "outline"}
              className="rounded-full text-xs"
              onClick={() => setSearchParams({})}
            >
              {t("reviews.allReviews", "All Reviews")}
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{t("reviews.totalReviews", "Reviews")}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.avg}</p>
            <p className="text-xs text-muted-foreground">{t("reviews.avgRating", "Avg Rating")}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{allReviews.filter((r) => r.verified).length}</p>
            <p className="text-xs text-muted-foreground">{t("reviews.verified", "Verified")}</p>
          </div>
        </div>

        {/* Category cloud tags */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {t("reviews.allCategories", "All Categories")}
          </button>
          {BUSINESS_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Star rating filter */}
        <div className="overflow-x-auto -mx-4 px-4">
          <ReviewFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
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
            <p className="text-muted-foreground">{t("reviews.noReviews", "No reviews found")}</p>
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
    </StationPageWrapper>
  );
};

export default Reviews;
