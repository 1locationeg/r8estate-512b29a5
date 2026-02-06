import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Building2, 
  MapPin, 
  Home, 
  Users, 
  Smartphone, 
  LayoutGrid, 
  FolderOpen,
  Building,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  Heart,
  Share2,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Trophy,
  Medal,
  Award
} from "lucide-react";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { getRatingColorClass, getStarColorClass } from "@/lib/ratingColors";
import type { SearchItem, SearchCategory } from "@/data/searchIndex";

interface ItemDetailModalProps {
  item: SearchItem | null;
  open: boolean;
  onClose: () => void;
}

const categoryIcons: Record<SearchCategory, React.ReactNode> = {
  developers: <Building2 className="w-5 h-5" />,
  projects: <Home className="w-5 h-5" />,
  locations: <MapPin className="w-5 h-5" />,
  brokers: <Users className="w-5 h-5" />,
  apps: <Smartphone className="w-5 h-5" />,
  units: <LayoutGrid className="w-5 h-5" />,
  'property-types': <Building className="w-5 h-5" />,
  categories: <FolderOpen className="w-5 h-5" />,
  reviews: <Star className="w-5 h-5" />
};

// Category labels for trust breakdown based on item type
const getCategoryBreakdown = (category: SearchCategory): { label: string; key: string }[] => {
  switch (category) {
    case 'developers':
      return [
        { label: 'Quality', key: 'quality' },
        { label: 'Delivery', key: 'delivery' },
        { label: 'Support', key: 'support' },
        { label: 'Value', key: 'value' }
      ];
    case 'projects':
      return [
        { label: 'Location', key: 'location' },
        { label: 'Amenities', key: 'amenities' },
        { label: 'Construction', key: 'construction' },
        { label: 'Investment', key: 'investment' }
      ];
    case 'brokers':
      return [
        { label: 'Reliability', key: 'reliability' },
        { label: 'Communication', key: 'communication' },
        { label: 'Market Knowledge', key: 'market' },
        { label: 'Negotiation', key: 'negotiation' }
      ];
    case 'apps':
      return [
        { label: 'Usability', key: 'usability' },
        { label: 'Features', key: 'features' },
        { label: 'Performance', key: 'performance' },
        { label: 'Support', key: 'support' }
      ];
    case 'units':
    case 'property-types':
      return [
        { label: 'Demand', key: 'demand' },
        { label: 'ROI Potential', key: 'roi' },
        { label: 'Availability', key: 'availability' },
        { label: 'Price Stability', key: 'priceStability' }
      ];
    case 'locations':
      return [
        { label: 'Infrastructure', key: 'infrastructure' },
        { label: 'Connectivity', key: 'connectivity' },
        { label: 'Growth Potential', key: 'growth' },
        { label: 'Lifestyle', key: 'lifestyle' }
      ];
    default:
      return [
        { label: 'Quality', key: 'quality' },
        { label: 'Value', key: 'value' },
        { label: 'Popularity', key: 'popularity' },
        { label: 'Trust', key: 'trust' }
      ];
  }
};

// Generate deterministic scores based on item id
const generateScores = (itemId: string, count: number): number[] => {
  const scores: number[] = [];
  for (let i = 0; i < count; i++) {
    let hash = 0;
    const seed = itemId + i.toString();
    for (let j = 0; j < seed.length; j++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(j);
      hash = hash & hash;
    }
    scores.push(50 + Math.abs(hash % 45)); // Range 50-94
  }
  return scores;
};

// Generate deterministic trust score
const generateTrustScore = (item: SearchItem): number => {
  if (item.category === 'developers' && item.meta?.trustScore) {
    return item.meta.trustScore as number;
  }
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) {
    hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
    hash = hash & hash;
  }
  return 55 + Math.abs(hash % 40);
};

const getScoreColor = (score: number) => {
  if (score >= 66) return "text-trust-excellent";
  if (score >= 50) return "text-trust-good";
  return "text-trust-fair";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 66) return "Very Good";
  if (score >= 50) return "Good";
  return "Fair";
};

// Generate mock reviews for any item
interface MockReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  tier: 'gold' | 'silver' | 'bronze';
  reply?: {
    author: string;
    comment: string;
    date: string;
  };
}

const generateMockReviews = (itemId: string, itemName: string): MockReview[] => {
  const reviewTemplates = [
    { 
      author: "Ahmed Mostafa", 
      comment: "Exceptional quality and timely delivery. The attention to detail in the finishing is outstanding. Highly recommend for serious investors.",
      tier: 'gold' as const
    },
    { 
      author: "Sara Mahmoud", 
      comment: "Great community facilities and excellent location in New Cairo. We really enjoyed our overall experience with the purchase process.",
      tier: 'silver' as const
    },
    { 
      author: "Mohamed Ibrahim", 
      comment: "Professional team and transparent communication throughout. The value for money is excellent compared to other options.",
      tier: 'bronze' as const
    },
    { 
      author: "Fatma Hassan", 
      comment: "Very satisfied with the quality of construction and the amenities provided. Customer service is responsive and helpful.",
      tier: 'gold' as const
    }
  ];
  
  // Generate deterministic reviews based on item id
  let hash = 0;
  for (let i = 0; i < itemId.length; i++) {
    hash = ((hash << 5) - hash) + itemId.charCodeAt(i);
    hash = hash & hash;
  }
  
  const numReviews = 2 + Math.abs(hash % 2);
  const reviews: MockReview[] = [];
  
  for (let i = 0; i < numReviews; i++) {
    const templateIndex = Math.abs((hash + i) % reviewTemplates.length);
    const template = reviewTemplates[templateIndex];
    const reviewHash = Math.abs(hash + i * 1000);
    const rating = 3 + (reviewHash % 3);
    const daysAgo = 5 + Math.abs(reviewHash % 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    reviews.push({
      id: `${itemId}-review-${i}`,
      author: template.author,
      rating,
      comment: template.comment,
      date: date.toISOString(),
      verified: Math.abs(reviewHash) % 3 !== 0,
      tier: template.tier,
      reply: i === 0 ? {
        author: `${itemName} Team`,
        comment: "Thank you for your positive feedback. We're delighted to hear about your experience and we're continuously working to improve our services.",
        date: new Date(date.getTime() + 86400000).toISOString()
      } : undefined
    });
  }
  
  return reviews;
};

const getTierConfig = (tier: 'gold' | 'silver' | 'bronze') => {
  switch (tier) {
    case "gold":
      return { label: "Gold", icon: Trophy, className: "bg-accent text-accent-foreground" };
    case "silver":
      return { label: "Silver", icon: Medal, className: "bg-muted text-muted-foreground" };
    case "bronze":
      return { label: "Bronze", icon: Award, className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  }
};

export const ItemDetailModal = ({ item, open, onClose }: ItemDetailModalProps) => {
  const { t, i18n } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);

  const { trustScore, categoryScores, categoryBreakdown, reviewCount, mockReviews, rating } = useMemo(() => {
    if (!item) return { trustScore: 0, categoryScores: [], categoryBreakdown: [], reviewCount: 0, mockReviews: [], rating: 4 };
    
    const breakdown = getCategoryBreakdown(item.category);
    const scores = generateScores(item.id, breakdown.length);
    const trust = generateTrustScore(item);
    const reviews = generateMockReviews(item.id, item.name);
    
    // Generate review count based on id
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
      hash = hash & hash;
    }
    const count = item.reviewCount || (50 + Math.abs(hash % 450));
    
    // Generate rating
    const ratingValue = item.rating || (3.5 + (Math.abs(hash % 15) / 10));
    
    return { 
      trustScore: trust, 
      categoryScores: scores, 
      categoryBreakdown: breakdown,
      reviewCount: count,
      mockReviews: reviews,
      rating: ratingValue
    };
  }, [item]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader>
            <div className="flex items-start gap-4">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {categoryIcons[item.category]}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {item.name}
                  {item.meta?.verified && (
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  )}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {item.subtitle}
                </DialogDescription>
                
                {/* Rating Stars */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${
                          star <= Math.floor(rating) 
                            ? getRatingColorClass(rating) 
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-semibold ${getRatingColorClass(rating)}`}>
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({reviewCount} {t("reviews.reviews")})
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Trust Score Gauge */}
        <div className="px-6 py-5 bg-secondary/30">
          <div className="flex items-center justify-center gap-6">
            {/* Large Circular Gauge */}
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(trustScore / 100) * 132} 132`}
                  strokeLinecap="round"
                  className={getScoreColor(trustScore)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(trustScore)}`}>
                  {trustScore}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                TrustScore
              </span>
              <span className={`text-lg font-bold ${getScoreColor(trustScore)}`}>
                {getScoreLabel(trustScore)}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-primary" />
                <span>Verified Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="px-6 py-5">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Trust Breakdown
          </h4>
          <div className="space-y-3">
            {categoryBreakdown.map((cat, index) => (
              <TrustCategoryBar
                key={cat.key}
                label={cat.label}
                percentage={categoryScores[index]}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Reviews Section */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              {t("reviews.latestReviews")}
            </h4>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-auto p-1">
              {t("reviews.viewAll")}
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockReviews.map((review) => {
              const tierConfig = getTierConfig(review.tier);
              const TierIcon = tierConfig.icon;
              
              return (
                <div key={review.id} className="border border-border rounded-lg p-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={review.avatar} alt={review.author} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {review.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">{review.author}</span>
                          {review.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-trust-excellent" />
                          )}
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${tierConfig.className}`}>
                            <TierIcon className="w-2.5 h-2.5 mr-0.5" />
                            {tierConfig.label}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(review.date).toLocaleDateString(
                            i18n.language === "ar" ? "ar-EG" : "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className={`w-3 h-3 ${getStarColorClass(review.rating, i)}`} />
                      ))}
                    </div>
                  </div>
                  
                  {/* Review Content */}
                  <p className="text-xs text-foreground leading-relaxed mb-2 line-clamp-2">
                    {review.comment}
                  </p>
                  
                  {/* Developer Reply */}
                  {review.reply && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-2 bg-secondary/50 rounded-lg p-3">
                        <MessageSquare className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">{review.reply.author}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(review.reply.date).toLocaleDateString(
                                i18n.language === "ar" ? "ar-EG" : "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                            {review.reply.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-brand-red text-brand-red' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
