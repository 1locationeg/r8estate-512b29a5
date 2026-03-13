import { Star, Mic, Download, GitCompare } from "lucide-react";
import { ShareMenu } from "./ShareMenu";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import { useTranslation } from "react-i18next";
import { Developer } from "@/data/mockData";
import { useReviews } from "@/hooks/useReviews";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { ReviewCard } from "./ReviewCard";
import { ReviewFilters, ReviewFilterType } from "./ReviewFilters";
import { WriteReviewModal } from "./WriteReviewModal";
import { CompareModal } from "./CompareModal";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trackBuyerEngagement } from "@/lib/trackBuyerEngagement";
import { cn } from "@/lib/utils";
import { type SearchItem } from "@/data/searchIndex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeveloperDetailCardProps {
  developer: Developer;
  onClose?: () => void;
  onCompare?: () => void;
}

export const DeveloperDetailCard = ({
  developer,
  onClose,
  onCompare,
}: DeveloperDetailCardProps) => {
  const { t } = useTranslation();
  const [reviewFilter, setReviewFilter] = useState<ReviewFilterType>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const developerAsSearchItem: SearchItem = useMemo(() => ({
    id: developer.id,
    name: developer.name,
    category: 'developers' as const,
    subtitle: developer.location,
    image: developer.logo,
    rating: developer.rating,
    reviewCount: developer.reviewCount,
    meta: { trustScore: developer.trustScore, verified: developer.verified }
  }), [developer]);

  // Get trust score color based on percentage
  const getTrustScoreColor = (score: number) => {
    if (score >= 66) return "text-trust-excellent";
    if (score >= 50) return "text-trust-good";
    return "text-trust-fair";
  };

  const getTrustScoreStroke = (score: number) => {
    if (score >= 66) return "stroke-trust-excellent";
    if (score >= 50) return "stroke-trust-good";
    return "stroke-trust-fair";
  };

  const { reviews } = useReviews(developer.id);

  // Filter reviews for this developer
  const developerReviews = useMemo(() => {
    let filtered = [...reviews];
    if (reviewFilter !== "all") {
      const ratingFilter = parseInt(reviewFilter);
      filtered = filtered.filter((r) => r.rating === ratingFilter);
    }
    // Sort
    if (sortOrder === "newest") {
      filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortOrder === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortOrder === "highest") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating);
    }
    return filtered;
  }, [reviews, reviewFilter, sortOrder]);

  // Star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 md:w-5 md:h-5 fill-accent text-accent"
          />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 md:w-5 md:h-5 fill-accent/50 text-accent"
          />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-muted" />
        );
      }
    }
    return stars;
  };

  const trustCategories = [
    { label: t("trust.projectTimeliness"), value: developer.trustScore - 3 },
    { label: t("trust.constructionQuality"), value: developer.trustScore - 2 },
    { label: t("trust.developerCommunication"), value: developer.trustScore - 5 },
    { label: t("trust.valueForMoney"), value: developer.trustScore - 1 },
    { label: t("trust.documentationLegality"), value: developer.trustScore + 3 },
    { label: t("trust.customerService"), value: developer.trustScore - 6 },
  ];

  return (
    <>
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header with Developer Info */}
      <div className="p-4 md:p-6 text-center">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8" /> {/* Spacer */}
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            {developer.name}
          </h2>
          <ShareMenu
            title={t("share.shareDeveloper", { name: developer.name, score: developer.trustScore })}
            description={`${developer.rating}★ • ${developer.reviewCount} reviews`}
          />
        </div>

        {/* Large Trust Score Gauge */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-secondary"
            />
            {/* Progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(developer.trustScore / 100) * 283} 283`}
              className={getTrustScoreStroke(developer.trustScore)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                "text-3xl md:text-4xl font-bold",
                getTrustScoreColor(developer.trustScore)
              )}
            >
              {developer.trustScore}
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
              {t("developers.trustScore")}
            </span>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">{renderStars(developer.rating)}</div>
          <span className="text-sm md:text-base font-semibold text-foreground">
            {developer.rating}
          </span>
          <span className="text-sm text-muted-foreground">
            ({developer.reviewCount} {t("reviews.reviews")})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            {t("reviews.writeReview")}
          </button>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Mic className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => downloadTrustReport(developerAsSearchItem)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t("actions.downloadReport")}
          </button>
          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            {t("actions.compareWith")}
          </button>
        </div>
      </div>

      {/* Trust Categories */}
      <div className="p-4 md:p-6 border-t border-border">
        <h3 className="text-base md:text-lg font-bold text-foreground mb-4">
          {t("trust.categories")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trustCategories.map((cat) => (
            <TrustCategoryBar
              key={cat.label}
              label={cat.label}
              percentage={Math.min(100, Math.max(0, cat.value))}
            />
          ))}
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="p-4 md:p-6 border-t border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h3 className="text-base md:text-lg font-bold text-foreground">
            {t("reviews.customerReviews")}
          </h3>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t("reviews.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("reviews.newest")}</SelectItem>
              <SelectItem value="oldest">{t("reviews.oldest")}</SelectItem>
              <SelectItem value="highest">{t("reviews.highest")}</SelectItem>
              <SelectItem value="lowest">{t("reviews.lowest")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {developerReviews.length > 0 ? (
            developerReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t("reviews.noReviews")}
            </p>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        developerName={developer.name}
        developerId={developer.id}
      />
    </div>
    <CompareModal
      item={developerAsSearchItem}
      open={isCompareOpen}
      onClose={() => setIsCompareOpen(false)}
    />
    </>
  );
};
