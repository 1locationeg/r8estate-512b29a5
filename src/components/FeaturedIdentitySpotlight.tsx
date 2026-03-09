import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, Download, GitCompare, Shield, MessageSquare, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { developers, reviews } from "@/data/mockData";
import { ShareMenu } from "./ShareMenu";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { getRatingColorClass } from "@/lib/ratingColors";


const trustCategories = [
  { key: "projectTimeliness", label: "Project Timeliness" },
  { key: "constructionQuality", label: "Construction Quality" },
  { key: "developerCommunication", label: "Developer Communication" },
  { key: "valueForMoney", label: "Value for Money" },
  { key: "documentationLegality", label: "Documentation & Legality" },
  { key: "customerService", label: "Customer Service" },
];

export const FeaturedIdentitySpotlight = () => {
  const { t } = useTranslation();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % developers.length);
      setShowAllReviews(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const developer = developers[currentIndex];

  const devReviews = reviews.filter((r) => r.developerId === developer.id);
  const displayedReviews = showAllReviews ? devReviews : devReviews.slice(0, 2);

  // Generate deterministic category scores from developer data
  const getCategoryScore = (key: string) => {
    const hash = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.min(99, Math.max(75, (developer.trustScore + hash) % 30 + 75));
  };

  const scoreAngle = (developer.trustScore / 100) * 180;
  const rad = ((180 - scoreAngle) * Math.PI) / 180;
  const mx = 100 + 80 * Math.cos(rad);
  const my = 100 - 80 * Math.sin(rad);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--primary))";
    if (score >= 60) return "hsl(var(--accent))";
    return "hsl(var(--brand-red))";
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? getRatingColorClass(rating) : "text-muted"}`}
      />
    ));

  const tierColors: Record<string, string> = {
    gold: "bg-accent text-accent-foreground",
    silver: "bg-muted text-muted-foreground",
    bronze: "bg-orange-700/20 text-orange-400",
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 mt-10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          Spotlight Identity
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          Featured
        </span>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-card">
        {/* Header */}
        <div className="p-5 md:p-6 text-center border-b border-border">
          <div className="flex items-center justify-end mb-2">
            <ShareMenu title={developer.name} iconOnly />
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            {developer.name}
          </h3>

          {/* Trust Gauge */}
          <div className="relative w-44 h-24 md:w-52 md:h-28 mx-auto mb-2">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <defs>
                <linearGradient id="spotlightGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(0,72%,51%)" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" />
                  <stop offset="100%" stopColor="hsl(142,71%,45%)" />
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Score arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#spotlightGaugeGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(developer.trustScore / 100) * Math.PI * 80} ${Math.PI * 80}`}
              />
              {/* Pointer */}
              <circle
                cx={mx}
                cy={my}
                r="7"
                fill="hsl(var(--card))"
                stroke={getScoreColor(developer.trustScore)}
                strokeWidth="3"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span
                className="text-3xl md:text-4xl font-black"
                style={{ color: getScoreColor(developer.trustScore) }}
              >
                {developer.trustScore}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Trust Score
              </span>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex">{renderStars(developer.rating)}</div>
            <span className="text-lg font-bold text-foreground">{developer.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({developer.reviewCount} reviews)
            </span>
          </div>

          {/* Verified badge */}
          {developer.verified && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary">
              <Shield className="w-3.5 h-3.5" />
              Verified Identity
            </div>
          )}
        </div>

        {/* Trust Categories */}
        <div className="p-5 md:p-6 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Trust Categories</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {trustCategories.map((cat) => {
              const score = getCategoryScore(cat.key);
              return (
                <TrustCategoryBar
                  key={cat.key}
                  label={cat.label}
                  percentage={score}
                />
              );
            })}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Customer Reviews</h4>
            <span className="text-xs text-muted-foreground">Newest</span>
          </div>

          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                      {review.author.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {review.author}
                        </span>
                        {review.tier && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${tierColors[review.tier] || ""}`}>
                            {review.tier}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {review.project} • {review.developerId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                  {review.comment}
                </p>
                <p className="text-[10px] text-muted-foreground">{review.date}</p>

                {/* Developer Reply */}
                {review.developerReply && (
                  <div className="ms-6 p-3 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3 h-3 text-primary" />
                      <span className="text-xs font-semibold text-primary">
                        {review.developerReply.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {review.developerReply.date}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">
                      {review.developerReply.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {devReviews.length > 2 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="mt-4 w-full flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {showAllReviews ? "Show Less" : `View All ${devReviews.length} Reviews`}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllReviews ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>
      </Card>
    </section>
  );
};
