import { useState, useMemo } from "react";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import { WriteReviewModal } from "./WriteReviewModal";
import { CompareModal } from "./CompareModal";
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
  X,
  CalendarDays,
  Briefcase,
  Banknote,
  FolderKanban,
  Layers,
  Ruler,
  CreditCard,
  Clock,
  TreePine,
  Download,
  Globe,
  Monitor,
  ListChecks,
  Handshake,
  Languages,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { ShareMenu } from "./ShareMenu";
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

// Category-specific trust breakdown metrics keys
const getCategoryMetricKeys = (category: SearchCategory): string[] => {
  switch (category) {
    case 'developers':
      return ['delivery', 'quality', 'financial', 'support'];
    case 'projects':
      return ['progress', 'location', 'price', 'amenities'];
    case 'locations':
      return ['demand', 'infrastructure', 'potential', 'safety'];
    case 'apps':
      return ['usability', 'performance', 'features', 'support'];
    case 'units':
      return ['demand', 'roi', 'space', 'resale'];
    case 'brokers':
      return ['success', 'response', 'knowledge', 'negotiation'];
    default:
      return ['quality', 'reliability', 'value', 'satisfaction'];
  }
};

// Mock reviewers with tiers and gender-appropriate avatars
const mockReviewerKeys = ['ahmed', 'sara', 'omar', 'fatima'] as const;
const mockReviewerData = [
  { id: '1', key: 'ahmed', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', tier: 'gold', verified: true },
  { id: '2', key: 'sara', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', tier: 'silver', verified: true },
  { id: '3', key: 'omar', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', tier: 'bronze', verified: false },
  { id: '4', key: 'fatima', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', tier: 'silver', verified: true },
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
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Generate deterministic scores based on item id
  const { trustScore, rating, categoryScores, reviews, metricKeys } = useMemo(() => {
    if (!item) return { trustScore: 0, rating: 0, categoryScores: {}, reviews: [], metricKeys: [] };

    // Generate hash from id
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
      hash = hash & hash;
    }
    
    const baseScore = 55 + Math.abs(hash % 40);
    const baseRating = 3 + Math.abs(hash % 20) / 10;
    
    // Get category metric keys
    const keys = getCategoryMetricKeys(item.category);
    const scores: Record<string, number> = {};
    keys.forEach((key, idx) => {
      const variance = ((hash >> (idx * 4)) % 30) - 15;
      scores[key] = Math.max(30, Math.min(95, baseScore + variance));
    });
    
    // Generate mock reviews with translated content
    const reviewsList = mockReviewerData.map((reviewer, idx) => ({
      ...reviewer,
      rating: Math.max(1, Math.min(5, Math.round(baseRating + (idx % 3) - 1))),
      reviewIndex: idx,
      date: new Date(Date.now() - (idx * 7 * 24 * 60 * 60 * 1000)),
    }));
    
    return {
      trustScore: baseScore,
      rating: baseRating,
      categoryScores: scores,
      reviews: reviewsList,
      metricKeys: keys,
    };
  }, [item]);

  if (!item) return null;

  // Get translated category for metrics path
  const metricsCategory = ['developers', 'projects', 'locations', 'apps', 'units', 'brokers'].includes(item.category) 
    ? item.category 
    : 'default';
  
  // Trust gauge color
  const getGaugeColor = (score: number) => {
    if (score >= 66) return 'text-trust-excellent';
    if (score >= 50) return 'text-trust-good';
    return 'text-trust-fair';
  };

  // Get translated reviewer name
  const getReviewerName = (key: string) => t(`reviewerNames.${key}`);
  
  // Get translated review text
  const getReviewText = (index: number) => {
    const reviews = t(`categoryReviews.${metricsCategory}`, { returnObjects: true }) as string[];
    return reviews[index % reviews.length];
  };

  // Format date based on locale
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
  };

  const filteredReviews = activeFilter 
    ? reviews.filter(r => r.rating === activeFilter)
    : reviews;

  const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );

  const renderEntityDetails = (currentItem: SearchItem) => {
    const m = currentItem.meta || {};

    if (currentItem.category === 'developers') {
      const yearsInBusiness = m.yearEstablished ? new Date().getFullYear() - (m.yearEstablished as number) : null;
      return (
        <div className="bg-secondary/50 border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">{t("developers.businessDetails", "Business Details")}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {m.yearEstablished && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("developers.established", "Established")} value={`${m.yearEstablished} (${yearsInBusiness} ${t("developers.years", "yrs")})`} />}
            {m.location && <DetailRow icon={<MapPin className="w-4 h-4 text-primary" />} label={t("developers.headquarters", "Headquarters")} value={m.location as string} />}
            {m.employees && <DetailRow icon={<Briefcase className="w-4 h-4 text-primary" />} label={t("developers.employeesLabel", "Employees")} value={`${(m.employees as number).toLocaleString()}+`} />}
            {m.projectsCompleted && <DetailRow icon={<FolderKanban className="w-4 h-4 text-primary" />} label={t("developers.projectsLabel", "Projects")} value={String(m.projectsCompleted)} />}
            {m.registeredUsers && <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label={t("developers.registeredUsers", "Registered Users")} value={(m.registeredUsers as number).toLocaleString()} />}
            {m.capital && <DetailRow icon={<Banknote className="w-4 h-4 text-primary" />} label={t("developers.capital", "Capital")} value={m.capital as string} />}
          </div>
          {m.specialties && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(m.specialties as string[]).map((s) => (
                <span key={s} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentItem.category === 'projects') {
      return (
        <div className="bg-secondary/50 border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">{t("projects.details", "Project Details")}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {m.developerName && <DetailRow icon={<Building2 className="w-4 h-4 text-primary" />} label={t("projects.developer", "Developer")} value={m.developerName as string} />}
            {m.location && <DetailRow icon={<MapPin className="w-4 h-4 text-primary" />} label={t("projects.location", "Location")} value={m.location as string} />}
            {m.status && <DetailRow icon={<ListChecks className="w-4 h-4 text-primary" />} label={t("projects.status", "Status")} value={m.status as string} />}
            {m.totalUnits && <DetailRow icon={<Layers className="w-4 h-4 text-primary" />} label={t("projects.totalUnits", "Total Units")} value={(m.totalUnits as number).toLocaleString()} />}
            {m.builtUpArea && <DetailRow icon={<Ruler className="w-4 h-4 text-primary" />} label={t("projects.builtUpArea", "Built-up Area")} value={m.builtUpArea as string} />}
            {m.priceRange && <DetailRow icon={<Banknote className="w-4 h-4 text-primary" />} label={t("projects.priceRange", "Price Range")} value={m.priceRange as string} />}
            {m.paymentPlan && <DetailRow icon={<CreditCard className="w-4 h-4 text-primary" />} label={t("projects.paymentPlan", "Payment Plan")} value={m.paymentPlan as string} />}
            {m.launchDate && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("projects.launchDate", "Launch Date")} value={m.launchDate as string} />}
            {m.expectedCompletion && <DetailRow icon={<Clock className="w-4 h-4 text-primary" />} label={t("projects.expectedCompletion", "Expected Completion")} value={m.expectedCompletion as string} />}
          </div>
          {m.unitTypes && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(m.unitTypes as string[]).map((u) => (
                <span key={u} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">{u}</span>
              ))}
            </div>
          )}
          {m.amenities && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">{t("projects.amenities", "Amenities")}</p>
              <div className="flex flex-wrap gap-2">
                {(m.amenities as string[]).map((a) => (
                  <span key={a} className="px-2 py-0.5 text-xs rounded bg-accent/10 text-accent-foreground border border-border">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (currentItem.category === 'brokers') {
      return (
        <div className="bg-secondary/50 border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Handshake className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">{t("brokers.details", "Brokerage Details")}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {m.specialty && <DetailRow icon={<Award className="w-4 h-4 text-primary" />} label={t("brokers.specialty", "Specialty")} value={m.specialty as string} />}
            {m.location && <DetailRow icon={<MapPin className="w-4 h-4 text-primary" />} label={t("brokers.location", "Location")} value={m.location as string} />}
            {m.yearFounded && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("brokers.yearFounded", "Year Founded")} value={String(m.yearFounded)} />}
            {m.agentCount && <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label={t("brokers.agents", "Agents")} value={`${(m.agentCount as number).toLocaleString()}+`} />}
            {m.dealsCompleted && <DetailRow icon={<FileText className="w-4 h-4 text-primary" />} label={t("brokers.dealsCompleted", "Deals Completed")} value={(m.dealsCompleted as number).toLocaleString()} />}
            {m.activeListings && <DetailRow icon={<FolderKanban className="w-4 h-4 text-primary" />} label={t("brokers.activeListings", "Active Listings")} value={(m.activeListings as number).toLocaleString()} />}
          </div>
          {m.languages && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(m.languages as string[]).map((l) => (
                <span key={l} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">{l}</span>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentItem.category === 'apps') {
      return (
        <div className="bg-secondary/50 border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">{t("apps.details", "App Details")}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {m.type && <DetailRow icon={<Globe className="w-4 h-4 text-primary" />} label={t("apps.type", "Type")} value={m.type as string} />}
            {m.launchYear && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("apps.launchYear", "Launch Year")} value={String(m.launchYear)} />}
            {m.downloads && <DetailRow icon={<Download className="w-4 h-4 text-primary" />} label={t("apps.downloads", "Downloads")} value={m.downloads as string} />}
            {m.monthlyActiveUsers && <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label={t("apps.mau", "Monthly Active Users")} value={m.monthlyActiveUsers as string} />}
            {m.featuredListings && <DetailRow icon={<FolderKanban className="w-4 h-4 text-primary" />} label={t("apps.featuredListings", "Featured Listings")} value={(m.featuredListings as number).toLocaleString()} />}
          </div>
          {m.platform && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(m.platform as string[]).map((p) => (
                <span key={p} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Monitor className="w-3 h-3 inline mr-1" />{p}
                </span>
              ))}
            </div>
          )}
          {m.supportedRegions && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">{t("apps.supportedRegions", "Supported Regions")}</p>
              <div className="flex flex-wrap gap-2">
                {(m.supportedRegions as string[]).map((r) => (
                  <span key={r} className="px-2 py-0.5 text-xs rounded bg-accent/10 text-accent-foreground border border-border">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

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
        {/* Entity-Specific Detail Card */}
        {renderEntityDetails(item)}
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
            {metricKeys.map((key) => (
              <TrustCategoryBar
                key={key}
                label={t(`categoryMetrics.${metricsCategory}.${key}`)}
                percentage={categoryScores[key] || 50}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="sm" className="gap-2" onClick={() => setIsReviewModalOpen(true)}>
            <PenLine className="w-4 h-4" />
            {t("search.writeReview")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsReviewModalOpen(true)}>
            <Mic className="w-4 h-4" />
            {t("itemDetail.voiceReview")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => item && downloadTrustReport(item)}>
            <FileDown className="w-4 h-4" />
            {t("itemDetail.downloadReport")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsCompareOpen(true)}>
          <GitCompare className="w-4 h-4" />
            {t("itemDetail.compareItem")}
          </Button>
          <ShareMenu
            title={item.name}
            description={`Trust Score: ${trustScore} • ${rating.toFixed(1)}★`}
            variant="outline"
            size="sm"
            iconOnly={false}
          />
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
              filteredReviews.map((review) => {
                const reviewerName = getReviewerName(review.key);
                return (
                  <div key={review.id} className="bg-secondary/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback className="text-xs">
                          {reviewerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{reviewerName}</span>
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
                          <span>{formatDate(review.date)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {getReviewText(review.reviewIndex)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <WriteReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        developerName={item?.name || ""}
        developerId={item?.id || ""}
      />
      <CompareModal
        item={item}
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
};
