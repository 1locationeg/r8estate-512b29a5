import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, Shield, Building2, ChevronRight, Bookmark, UserPlus, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { developers, reviews } from "@/data/mockData";
import { ShareMenu } from "./ShareMenu";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { getRatingColorClass } from "@/lib/ratingColors";
import { useSavedItem, useFollowBusiness } from "@/hooks/useSaveFollow";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";


const trustCategoryKeys = [
  { key: "projectTimeliness", labelKey: "trust.projectTimeliness" },
  { key: "constructionQuality", labelKey: "trust.constructionQuality" },
  { key: "developerCommunication", labelKey: "trust.developerCommunication" },
  { key: "valueForMoney", labelKey: "trust.valueForMoney" },
  { key: "documentationLegality", labelKey: "trust.documentationLegality" },
  { key: "customerService", labelKey: "trust.customerService" },
];

export const FeaturedIdentitySpotlight = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryPairIndex, setCategoryPairIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  const totalPairs = Math.ceil(trustCategoryKeys.length / 2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % developers.length);
      setShowAllReviews(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCategoryPairIndex((prev) => (prev + 1) % totalPairs);
    }, 2000);
    return () => clearInterval(interval);
  }, [totalPairs]);

  const developer = developers[currentIndex];
  const { isSaved, toggle: toggleSave, loading: saveLoading } = useSavedItem(developer.id, "developer");
  const { isFollowing, toggle: toggleFollow, loading: followLoading } = useFollowBusiness(developer.id);
  const devReviews = reviews.filter((r) => r.developerId === developer.id);

  // Reset reviewIndex when developer changes
  useEffect(() => {
    setReviewIndex(0);
    setShowAllReviews(false);
  }, [currentIndex]);

  // Auto-rotate reviews every 5s (pause when expanded)
  useEffect(() => {
    if (showAllReviews || devReviews.length <= 1) return;
    const timer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % devReviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [devReviews.length, showAllReviews]);

  const currentReview = devReviews[reviewIndex] || devReviews[0];

  const getCategoryScore = (key: string) => {
    const hash = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.min(99, Math.max(75, (developer.trustScore + hash) % 30 + 75));
  };

  const scoreAngle = developer.trustScore / 100 * 180;
  const rad = (180 - scoreAngle) * Math.PI / 180;
  const mx = 100 + 80 * Math.cos(rad);
  const my = 100 - 80 * Math.sin(rad);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--primary))";
    if (score >= 60) return "hsl(var(--accent))";
    return "hsl(var(--brand-red))";
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) =>
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? getRatingColorClass(rating) : "text-muted"}`} />
    );

  const tierColors: Record<string, string> = {
    gold: "bg-accent text-accent-foreground",
    silver: "bg-muted text-muted-foreground",
    bronze: "bg-orange-700/20 text-orange-400"
  };

  return (
    <section className="w-full">
      {/* Unified header */}
      <div className="flex flex-col items-center gap-1.5 mb-6 md:mb-8">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 rounded-full px-3.5 py-1.5 border border-primary/15">
          <Star className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {t("spotlight.featured")}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-center text-foreground">
          {t("spotlight.title")}
        </h2>
      </div>

      <Card
        className="overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/entity/${developer.id}`)}
      >
        {/* Navy gradient banner header */}
        <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-4 pt-4 pb-8 text-center">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }} />
          <div className="relative">
            <div className="flex flex-col items-center gap-1.5 md:relative md:flex-row md:justify-center">
              <h3 className="text-lg md:text-xl font-bold text-primary-foreground text-center w-full">
                {developer.name}
              </h3>
              <div className="flex items-center gap-1 md:absolute md:end-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) { navigate("/auth"); return; }
                    toggleSave(developer.name, developer.logo);
                  }}
                  disabled={saveLoading}
                  className="p-1.5 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
                  title={isSaved ? t("common.removeSaved") : t("common.save")}>
                  <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary-foreground text-primary-foreground" : "text-primary-foreground/70"}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) { navigate("/auth"); return; }
                    toggleFollow(developer.name);
                  }}
                  disabled={followLoading}
                  className="p-1.5 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
                  title={isFollowing ? t("common.unfollow") : t("common.follow")}>
                  {isFollowing ?
                    <UserCheck className="h-3.5 w-3.5 text-primary-foreground" /> :
                    <UserPlus className="h-3.5 w-3.5 text-primary-foreground/70" />
                  }
                </button>
                <div onClick={(e) => e.stopPropagation()}>
                  <ShareMenu title={developer.name} iconOnly />
                </div>
              </div>
            </div>
            {developer.verified &&
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold text-primary-foreground mt-1.5">
                <Shield className="w-3 h-3" />
                {t("spotlight.verifiedIdentity")}
              </div>
            }
          </div>
        </div>

        {/* Trust Gauge */}
        <div className="relative -mt-6 text-center px-4 pb-2 bg-background rounded-b-xl">
          <div className="relative w-36 h-20 md:w-44 md:h-24 mx-auto mb-1">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <defs>
                <linearGradient id="spotlightGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(0,72%,51%)" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" />
                  <stop offset="100%" stopColor="hsl(142,71%,45%)" />
                </linearGradient>
              </defs>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#spotlightGaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${developer.trustScore / 100 * Math.PI * 80} ${Math.PI * 80}`} />
              <circle cx={mx} cy={my} r="7" fill="hsl(var(--card))" stroke={getScoreColor(developer.trustScore)} strokeWidth="3" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
              <span className="text-2xl md:text-3xl font-black" style={{ color: getScoreColor(developer.trustScore) }}>
                {developer.trustScore}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                {t("spotlight.trustScore")}
              </span>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="flex">{renderStars(developer.rating)}</div>
            <span className="text-base font-bold text-foreground">{developer.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({developer.reviewCount} {t("reviews.reviews")})
            </span>
          </div>
        </div>

        {/* Trust Categories */}
        <div className="px-4 py-2.5 border-t border-border">
          <h4 className="text-xs font-semibold text-foreground mb-1.5">{t("spotlight.trustCategories")}</h4>
          <div
            key={categoryPairIndex}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 animate-fade-in">
            {trustCategoryKeys.slice(categoryPairIndex * 2, categoryPairIndex * 2 + 2).map((cat) => {
              const score = getCategoryScore(cat.key);
              return (
                <TrustCategoryBar
                  key={cat.key}
                  label={t(cat.labelKey)}
                  percentage={score} />
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {Array.from({ length: totalPairs }, (_, i) =>
              <button
                key={i}
                onClick={() => setCategoryPairIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === categoryPairIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                aria-label={`Show category pair ${i + 1}`} />
            )}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="px-4 py-2.5 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">{t("spotlight.customerReviews")}</h4>
            <span className="text-[10px] text-muted-foreground">{t("spotlight.newest")}</span>
          </div>

          <div className="space-y-2.5">
            {showAllReviews ? (
              devReviews.map((review) => (
                <ReviewItem key={review.id} review={review} isAr={isAr} renderStars={renderStars} tierColors={tierColors} t={t} />
              ))
            ) : currentReview ? (
              <div key={reviewIndex} className="animate-fade-in">
                <ReviewItem review={currentReview} isAr={isAr} renderStars={renderStars} tierColors={tierColors} t={t} />
              </div>
            ) : null}
          </div>

          {/* Dot indicators */}
          {!showAllReviews && devReviews.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {devReviews.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === reviewIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          )}

          {devReviews.length > 1 &&
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              {showAllReviews ? t("spotlight.showLess") : t("spotlight.viewAllReviews", { count: devReviews.length })}
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllReviews ? "rotate-90" : ""}`} />
            </button>
          }
        </div>
      </Card>
    </section>
  );
};

/* Extracted review item with distinct business reply */
const ReviewItem = ({ review, isAr, renderStars, tierColors, t }: any) => (
  <div className="space-y-1">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">
          {review.author.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-foreground truncate">
              {isAr ? (review.authorAr || review.author) : review.author}
            </span>
            {review.tier &&
              <span className={`text-[8px] px-1 py-0 rounded-full font-bold uppercase ${tierColors[review.tier] || ""}`}>
                {review.tier}
              </span>
            }
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {review.project} • {review.developerId}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <div className="flex">{renderStars(review.rating)}</div>
      </div>
    </div>

    <p className="text-xs text-foreground/80 leading-snug line-clamp-2">
      {isAr ? (review.commentAr || review.comment) : review.comment}
    </p>
    <p className="text-[9px] text-muted-foreground">{review.date}</p>

    {review.developerReply &&
      <div className="ms-5 p-2.5 bg-primary/5 rounded-md border-s-2 border-primary">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10">
            <Building2 className="w-2.5 h-2.5 text-primary" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-wide">
              {isAr ? "رد الشركة" : "Business Reply"}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground">
            {review.developerReply.date}
          </span>
        </div>
        <p className="text-[11px] text-foreground/70 leading-snug line-clamp-2">
          {isAr ? (review.developerReply.commentAr || review.developerReply.comment) : review.developerReply.comment}
        </p>
      </div>
    }
  </div>
);
