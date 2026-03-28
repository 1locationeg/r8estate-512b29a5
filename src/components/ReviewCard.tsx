import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/formatArabic";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MessageSquare, ShieldCheck, Award, Medal, Trophy, Users } from "lucide-react";
import { Review, ReviewerTier, developers } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShareMenu } from "@/components/ShareMenu";
import { SentimentBadge } from "@/components/SentimentBadge";
import { ReviewReplyForm } from "@/components/ReviewReplyForm";
import { ReviewVerificationBadge } from "@/components/ReviewVerificationBadge";
import type { ReviewAnalysis } from "@/hooks/useReviewAnalysis";
import r8Stars from "@/assets/r8-stars.png";
import { localizeStoredReviewValue } from "@/lib/reviewCopy";
import { generateAvatar } from "@/lib/avatarUtils";

interface ReviewCardProps {
  review: Review;
  analysis?: ReviewAnalysis;
}

const getTierConfig = (tier: ReviewerTier, t: (key: string) => string) => {
  switch (tier) {
    case "gold":
      return {
        label: t("review.tier_gold"),
        icon: Trophy,
        className: "bg-accent text-accent-foreground border-accent",
      };
    case "silver":
      return {
        label: t("review.tier_silver"),
        icon: Medal,
        className: "bg-muted text-muted-foreground border-muted-foreground/30",
      };
    case "bronze":
      return {
        label: t("review.tier_bronze"),
        icon: Award,
        className: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
      };
  }
};

export const ReviewCard = ({ review, analysis }: ReviewCardProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const developer = developers.find((d) => d.id === review.developerId);
  const tierConfig = getTierConfig(review.tier, t);
  const TierIcon = tierConfig.icon;
  const projectLabel = localizeStoredReviewValue(review.project, t);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-4 md:p-6 border-border hover:border-primary/50 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2 md:mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Profile Avatar with Verification Badge */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-border">
              <AvatarImage src={review.avatar || generateAvatar(review.author, "reviewer")} alt={review.author} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm font-semibold">
                {getInitials(review.author)}
              </AvatarFallback>
            </Avatar>
            {review.profileVerified && (
              <div className="absolute -bottom-0.5 -end-0.5 bg-background rounded-full p-0.5">
                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-trust-excellent fill-trust-excellent/20" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5 md:mb-1 flex-wrap">
              <span className="font-semibold text-foreground text-sm md:text-base truncate">
                {i18n.language === 'ar' ? (review.authorAr || review.author) : review.author}
              </span>
              {review.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-verified fill-verified flex-shrink-0" />
              )}
              {/* Tier Badge */}
              <Badge
                variant="outline"
                className={`text-[10px] md:text-xs px-1.5 py-0 h-5 flex items-center gap-1 ${tierConfig.className}`}
              >
                <TierIcon className="w-3 h-3" />
                {tierConfig.label}
              </Badge>
              {analysis && <SentimentBadge analysis={analysis} compact />}
              <ReviewVerificationBadge
                verificationLevel={(review as any).verificationLevel}
                facebookUrl={(review as any).facebookUrl}
                linkedinUrl={(review as any).linkedinUrl}
                identityVerified={(review as any).identityVerified}
                kycVerified={(review as any).kycVerified}
                compact
              />
            </div>
            <div className="text-xs md:text-sm text-muted-foreground truncate">
              {projectLabel} • {developer?.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <div className="relative w-[80px] h-4 md:w-[100px] md:h-5 rtl:scale-x-[-1]">
            <img src={r8Stars} alt="" className="absolute inset-0 w-full h-full object-contain grayscale opacity-25" />
            <img
              src={r8Stars}
              alt={`${review.rating} / 5`}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ clipPath: `inset(0 ${100 - (review.rating / 5) * 100}% 0 0)` }}
            />
          </div>
          <ShareMenu
            title={t("share.shareReview", { item: developer?.name || projectLabel })}
            description={review.comment.slice(0, 100)}
            size="icon"
            className="w-7 h-7 md:w-8 md:h-8"
          />
        </div>
      </div>

      <p className="text-xs md:text-sm text-foreground leading-relaxed mb-2 md:mb-3 line-clamp-3">
        {i18n.language === 'ar' ? (review.commentAr || review.comment) : review.comment}
      </p>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className="text-[10px] md:text-xs text-muted-foreground">
          {formatDate(review.date, i18n.language)}
        </span>
        <button
          onClick={() => navigate(`/community?developer=${review.developerId}`)}
          className="flex items-center gap-1 text-[10px] md:text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
           <Users className="w-3 h-3" />
           {t("review.discuss_this")}
        </button>
      </div>

      {/* Developer Reply */}
      {review.developerReply && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
          <div className="flex items-start gap-2 md:gap-3 bg-secondary/50 rounded-lg p-3 md:p-4">
            <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                <span className="text-xs md:text-sm font-semibold text-foreground truncate">
                  {i18n.language === 'ar' ? (review.developerReply.authorAr || review.developerReply.author) : review.developerReply.author}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {formatDate(review.developerReply.date, i18n.language)}
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {i18n.language === 'ar' ? (review.developerReply.commentAr || review.developerReply.comment) : review.developerReply.comment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Business Reply Form (visible to business/admin users) */}
      {!review.developerReply && (
        <div className="mt-2">
          <ReviewReplyForm reviewId={review.id} />
        </div>
      )}
    </Card>
  );
};
