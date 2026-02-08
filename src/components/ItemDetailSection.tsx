import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ShieldCheck, 
  Trophy, 
  Medal, 
  Award, 
  PenLine, 
  Mic, 
  FileDown, 
  GitCompare,
  Building2,
  Home,
  MapPin,
  Users,
  Smartphone,
  LayoutGrid,
  Building,
  FolderOpen,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { getRatingColorClass } from "@/lib/ratingColors";
import { type SearchItem, type SearchCategory } from "@/data/searchIndex";

interface ItemDetailSectionProps {
  item: SearchItem | null;
  onClose: () => void;
}

const categoryIcons: Record<SearchCategory, React.ReactNode> = {
  developers: <Building2 className="w-6 h-6" />,
  projects: <Home className="w-6 h-6" />,
  locations: <MapPin className="w-6 h-6" />,
  brokers: <Users className="w-6 h-6" />,
  apps: <Smartphone className="w-6 h-6" />,
  units: <LayoutGrid className="w-6 h-6" />,
  'property-types': <Building className="w-6 h-6" />,
  categories: <FolderOpen className="w-6 h-6" />,
  reviews: <Star className="w-6 h-6" />
};

// Category-specific trust breakdown metrics
const getCategoryMetrics = (category: SearchCategory): { label: string; key: string }[] => {
  switch (category) {
    case 'developers':
      return [
        { label: 'Delivery Track Record', key: 'delivery' },
        { label: 'Build Quality', key: 'quality' },
        { label: 'Financial Stability', key: 'financial' },
        { label: 'Customer Support', key: 'support' },
      ];
    case 'projects':
      return [
        { label: 'Construction Progress', key: 'progress' },
        { label: 'Location Value', key: 'location' },
        { label: 'Price Competitiveness', key: 'price' },
        { label: 'Amenities Quality', key: 'amenities' },
      ];
    case 'locations':
      return [
        { label: 'Market Demand', key: 'demand' },
        { label: 'Infrastructure', key: 'infrastructure' },
        { label: 'Future Potential', key: 'potential' },
        { label: 'Safety & Security', key: 'safety' },
      ];
    case 'apps':
      return [
        { label: 'Usability', key: 'usability' },
        { label: 'Performance', key: 'performance' },
        { label: 'Features', key: 'features' },
        { label: 'Support', key: 'support' },
      ];
    case 'units':
      return [
        { label: 'Market Demand', key: 'demand' },
        { label: 'Investment ROI', key: 'roi' },
        { label: 'Space Efficiency', key: 'space' },
        { label: 'Resale Value', key: 'resale' },
      ];
    case 'brokers':
      return [
        { label: 'Transaction Success', key: 'success' },
        { label: 'Response Time', key: 'response' },
        { label: 'Market Knowledge', key: 'knowledge' },
        { label: 'Negotiation Skills', key: 'negotiation' },
      ];
    default:
      return [
        { label: 'Overall Quality', key: 'quality' },
        { label: 'Reliability', key: 'reliability' },
        { label: 'Value', key: 'value' },
        { label: 'Satisfaction', key: 'satisfaction' },
      ];
  }
};

// Mock reviewers with tiers
const mockReviewers = [
  { id: '1', name: 'Ahmed Hassan', avatar: 'https://i.pravatar.cc/150?u=ahmed', tier: 'gold', verified: true },
  { id: '2', name: 'Sara Mohamed', avatar: 'https://i.pravatar.cc/150?u=sara', tier: 'silver', verified: true },
  { id: '3', name: 'Omar Khaled', avatar: 'https://i.pravatar.cc/150?u=omar', tier: 'bronze', verified: false },
  { id: '4', name: 'Fatima Ali', avatar: 'https://i.pravatar.cc/150?u=fatima', tier: 'silver', verified: true },
];

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'gold': return <Trophy className="w-3.5 h-3.5 text-trust-good" />;
    case 'silver': return <Medal className="w-3.5 h-3.5 text-muted-foreground" />;
    case 'bronze': return <Award className="w-3.5 h-3.5 text-trust-fair" />;
    default: return null;
  }
};

export const ItemDetailSection = ({ item, onClose }: ItemDetailSectionProps) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  // Generate deterministic scores based on item id
  const { trustScore, rating, categoryScores, reviews } = useMemo(() => {
    if (!item) return { trustScore: 0, rating: 0, categoryScores: {}, reviews: [] };

    // Generate hash from id
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
      hash = hash & hash;
    }
    
    const baseScore = 55 + Math.abs(hash % 40);
    const baseRating = 3 + Math.abs(hash % 20) / 10;
    
    // Generate category scores
    const metrics = getCategoryMetrics(item.category);
    const scores: Record<string, number> = {};
    metrics.forEach((metric, idx) => {
      const variance = ((hash >> (idx * 4)) % 30) - 15;
      scores[metric.key] = Math.max(30, Math.min(95, baseScore + variance));
    });
    
    // Generate mock reviews
    const reviewsList = mockReviewers.map((reviewer, idx) => ({
      ...reviewer,
      rating: Math.max(1, Math.min(5, Math.round(baseRating + (idx % 3) - 1))),
      text: [
        t("reviews.mockReview1"),
        t("reviews.mockReview2"),
        t("reviews.mockReview3"),
        t("reviews.mockReview4"),
      ][idx % 4],
      date: new Date(Date.now() - (idx * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
    }));
    
    return {
      trustScore: baseScore,
      rating: baseRating,
      categoryScores: scores,
      reviews: reviewsList,
    };
  }, [item, t]);

  if (!item) return null;

  const metrics = getCategoryMetrics(item.category);
  
  // Trust gauge color
  const getGaugeColor = (score: number) => {
    if (score >= 66) return 'text-trust-excellent';
    if (score >= 50) return 'text-trust-good';
    return 'text-trust-fair';
  };

  const filteredReviews = activeFilter 
    ? reviews.filter(r => r.rating === activeFilter)
    : reviews;

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-card border border-border rounded-xl p-4 md:p-6 animate-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
              {categoryIcons[item.category]}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {item.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {t(`search.${item.category}`)}
              </Badge>
              {item.subtitle && (
                <span className="text-muted-foreground text-sm">{item.subtitle}</span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Trust Score Gauge */}
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {/* Circular Gauge */}
          <div className="relative w-28 h-28 md:w-32 md:h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-secondary"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${trustScore * 2.64} 264`}
                className={getGaugeColor(trustScore)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl md:text-3xl font-bold", getGaugeColor(trustScore))}>
                {trustScore}
              </span>
              <span className="text-xs text-muted-foreground">{t("trustScore.label")}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-5 h-5",
                    star <= Math.round(rating)
                      ? `fill-current ${getRatingColorClass(rating)}`
                      : "text-secondary"
                  )}
                />
              ))}
            </div>
            <span className={cn("text-2xl font-bold", getRatingColorClass(rating))}>
              {rating.toFixed(1)}
            </span>
            <p className="text-xs text-muted-foreground">{t("common.averageRating")}</p>
          </div>
        </div>

        <Separator />

        {/* Category Insights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">{t("trustInsights.categoryBreakdown")}</h3>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <TrustCategoryBar
                key={metric.key}
                label={metric.label}
                percentage={categoryScores[metric.key] || 50}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="sm" className="gap-2">
            <PenLine className="w-4 h-4" />
            {t("search.writeReview")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Mic className="w-4 h-4" />
            {t("itemDetail.voiceReview")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="w-4 h-4" />
            {t("itemDetail.downloadReport")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <GitCompare className="w-4 h-4" />
            {t("itemDetail.compareItem")}
          </Button>
        </div>

        <Separator />

        {/* Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-foreground">{t("reviews.title")}</h3>
            {/* Star Filter */}
            <div className="flex items-center gap-1">
              <Button
                variant={activeFilter === null ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setActiveFilter(null)}
              >
                {t("reviews.all")}
              </Button>
              {[5, 4, 3, 2, 1].map((star) => (
                <Button
                  key={star}
                  variant={activeFilter === star ? "default" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setActiveFilter(star)}
                >
                  <Star className={cn(
                    "w-3.5 h-3.5",
                    activeFilter === star ? "fill-current" : ""
                  )} />
                  <span className="sr-only">{star}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">
                {t("reviews.noReviewsFilter")}
              </p>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback className="text-xs">
                        {review.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{review.name}</span>
                        {review.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        )}
                        {getTierIcon(review.tier)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-3 h-3",
                                s <= review.rating
                                  ? `fill-current ${getRatingColorClass(review.rating)}`
                                  : "text-secondary"
                              )}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
