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
  Clock,
  Heart,
  Share2,
  ExternalLink
} from "lucide-react";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { getRatingColorClass } from "@/lib/ratingColors";
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

export const ItemDetailModal = ({ item, open, onClose }: ItemDetailModalProps) => {
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);

  const { trustScore, categoryScores, categoryBreakdown, reviewCount } = useMemo(() => {
    if (!item) return { trustScore: 0, categoryScores: [], categoryBreakdown: [], reviewCount: 0 };
    
    const breakdown = getCategoryBreakdown(item.category);
    const scores = generateScores(item.id, breakdown.length);
    const trust = generateTrustScore(item);
    
    // Generate review count based on id
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
      hash = hash & hash;
    }
    const reviews = item.reviewCount || (50 + Math.abs(hash % 450));
    
    return { 
      trustScore: trust, 
      categoryScores: scores, 
      categoryBreakdown: breakdown,
      reviewCount: reviews
    };
  }, [item]);

  if (!item) return null;

  const rating = item.rating || (3 + Math.random() * 2);

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
            {t("search.categories")} Breakdown
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

        {/* Quick Stats */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">
                {reviewCount}
              </div>
              <div className="text-xs text-muted-foreground">{t("reviews.reviews")}</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">
                {rating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Updated</div>
            </div>
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
