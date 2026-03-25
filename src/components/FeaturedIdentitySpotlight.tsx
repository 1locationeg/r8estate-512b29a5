import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, Shield, MessageSquare, ChevronRight, Bookmark, UserPlus, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { developers, reviews } from "@/data/mockData";
import { ShareMenu } from "./ShareMenu";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { getRatingColorClass } from "@/lib/ratingColors";
import { useSavedItem, useFollowBusiness } from "@/hooks/useSaveFollow";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { localizeStoredReviewValue } from "@/lib/reviewCopy";

const trustCategories = [
{ key: "projectTimeliness", label: "Project Timeliness" },
{ key: "constructionQuality", label: "Construction Quality" },
{ key: "developerCommunication", label: "Developer Communication" },
{ key: "valueForMoney", label: "Value for Money" },
{ key: "documentationLegality", label: "Documentation & Legality" },
{ key: "customerService", label: "Customer Service" }];


export const FeaturedIdentitySpotlight = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryPairIndex, setCategoryPairIndex] = useState(0);

  const totalPairs = Math.ceil(trustCategories.length / 2);

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
  const displayedReviews = showAllReviews ? devReviews : devReviews.slice(0, 2);

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
    <section className="w-full max-w-[1100px] mx-auto px-0 mt-4 mb-3">
      <div className="flex items-center justify-between mb-2 py-0">
        <h2 className="text-base md:text-lg font-bold text-foreground">
          Spotlight
        </h2>
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary-foreground bg-primary/80 px-2.5 py-0.5 rounded-full">
          Featured
        </span>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-card shadow-sm">
        {/* Navy gradient banner header */}
        <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-4 pt-4 pb-8 text-center">
          {/* Dot grid texture overlay */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }} />
          <div className="relative">
            <div className="relative flex items-center justify-center">
              <h3 className="text-lg md:text-xl font-bold text-primary-foreground text-center">
                {developer.name}
              </h3>
              <div className="absolute right-0 flex items-center gap-1">
                <button
                  onClick={() => {
                    if (!user) {navigate("/auth");return;}
                    toggleSave(developer.name, developer.logo);
                  }}
                  disabled={saveLoading}
                  className="p-1.5 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
                  title={isSaved ? "Remove from saved" : "Save"}>
                  
                  <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary-foreground text-primary-foreground" : "text-primary-foreground/70"}`} />
                </button>
                <button
                  onClick={() => {
                    if (!user) {navigate("/auth");return;}
                    toggleFollow(developer.name);
                  }}
                  disabled={followLoading}
                  className="p-1.5 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
                  title={isFollowing ? "Unfollow" : "Follow"}>
                  
                  {isFollowing ?
                  <UserCheck className="h-3.5 w-3.5 text-primary-foreground" /> :

                  <UserPlus className="h-3.5 w-3.5 text-primary-foreground/70" />
                  }
                </button>
                <ShareMenu title={developer.name} iconOnly />
              </div>
            </div>
            {developer.verified &&
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold text-primary-foreground mt-1.5">
                <Shield className="w-3 h-3" />
                Verified Identity
              </div>
            }
          </div>
        </div>

        {/* Trust Gauge - overlapping banner */}
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
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                strokeLinecap="round" />
              
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#spotlightGaugeGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${developer.trustScore / 100 * Math.PI * 80} ${Math.PI * 80}`} />
              
              <circle
                cx={mx}
                cy={my}
                r="7"
                fill="hsl(var(--card))"
                stroke={getScoreColor(developer.trustScore)}
                strokeWidth="3" />
              
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
              <span
                className="text-2xl md:text-3xl font-black"
                style={{ color: getScoreColor(developer.trustScore) }}>
                
                {developer.trustScore}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                Trust Score
              </span>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="flex">{renderStars(developer.rating)}</div>
            <span className="text-base font-bold text-foreground">{developer.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({developer.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Trust Categories */}
        <div className="px-4 py-2.5 border-t border-border">
          <h4 className="text-xs font-semibold text-foreground mb-1.5">Trust Categories</h4>
          <div
            key={categoryPairIndex}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 animate-fade-in">
            
            {trustCategories.slice(categoryPairIndex * 2, categoryPairIndex * 2 + 2).map((cat) => {
              const score = getCategoryScore(cat.key);
              return (
                <TrustCategoryBar
                  key={cat.key}
                  label={cat.label}
                  percentage={score} />);


            })}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {Array.from({ length: totalPairs }, (_, i) =>
            <button
              key={i}
              onClick={() => setCategoryPairIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === categoryPairIndex ?
              "bg-primary scale-125" :
              "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`
              }
              aria-label={`Show category pair ${i + 1}`} />

            )}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="px-4 py-2.5 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">Customer Reviews</h4>
            <span className="text-[10px] text-muted-foreground">Newest</span>
          </div>

          <div className="space-y-2.5">
            {displayedReviews.map((review) =>
            <div key={review.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">
                      {review.author.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {review.author}
                        </span>
                        {review.tier &&
                      <span className={`text-[8px] px-1 py-0 rounded-full font-bold uppercase ${tierColors[review.tier] || ""}`}>
                            {review.tier}
                          </span>
                      }
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                         {localizeStoredReviewValue(review.project, t)} • {review.developerId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                </div>

                <p className="text-xs text-foreground/80 leading-snug line-clamp-2">
                  {review.comment}
                </p>
                <p className="text-[9px] text-muted-foreground">{review.date}</p>

                {review.developerReply &&
              <div className="ms-5 p-2 bg-secondary/50 rounded-md border border-border">
                    <div className="flex items-center gap-1 mb-0.5">
                      <MessageSquare className="w-2.5 h-2.5 text-primary" />
                      <span className="text-[10px] font-semibold text-primary">
                        {review.developerReply.author}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {review.developerReply.date}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground/70 leading-snug line-clamp-2">
                      {review.developerReply.comment}
                    </p>
                  </div>
              }
              </div>
            )}
          </div>

          {devReviews.length > 2 &&
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            
              {showAllReviews ? "Show Less" : `View All ${devReviews.length} Reviews`}
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllReviews ? "rotate-90" : ""}`} />
            </button>
          }
        </div>
      </Card>
    </section>);

};