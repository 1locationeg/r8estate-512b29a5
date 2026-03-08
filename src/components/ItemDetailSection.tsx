import { useState, useMemo } from "react";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import { WriteReviewModal } from "./WriteReviewModal";
import { CompareModal } from "./CompareModal";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Download,
  Globe,
  Monitor,
  ListChecks,
  Handshake,
  Languages,
  FileText,
  ExternalLink,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  Share2,
  Sparkles,
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

const getCategoryMetricKeys = (category: SearchCategory): string[] => {
  switch (category) {
    case 'developers': return ['delivery', 'quality', 'financial', 'support'];
    case 'projects': return ['progress', 'location', 'price', 'amenities'];
    case 'locations': return ['demand', 'infrastructure', 'potential', 'safety'];
    case 'apps': return ['usability', 'performance', 'features', 'support'];
    case 'units': return ['demand', 'roi', 'space', 'resale'];
    case 'brokers': return ['success', 'response', 'knowledge', 'negotiation'];
    default: return ['quality', 'reliability', 'value', 'satisfaction'];
  }
};

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

// Generate banner gradient based on category
const getCategoryBannerStyle = (category: SearchCategory) => {
  switch (category) {
    case 'developers': return 'from-primary/20 via-primary/10 to-secondary/30';
    case 'projects': return 'from-accent/20 via-accent/10 to-secondary/30';
    case 'brokers': return 'from-primary/15 via-accent/10 to-secondary/30';
    case 'apps': return 'from-accent/20 via-primary/10 to-secondary/30';
    case 'units': return 'from-primary/20 via-secondary/20 to-accent/10';
    default: return 'from-primary/15 via-secondary/20 to-accent/10';
  }
};

export const ItemDetailSection = ({ item, onClose }: ItemDetailSectionProps) => {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { trustScore, rating, categoryScores, reviews, metricKeys, starDistribution } = useMemo(() => {
    if (!item) return { trustScore: 0, rating: 0, categoryScores: {}, reviews: [], metricKeys: [], starDistribution: [0,0,0,0,0] };

    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
      hash = hash & hash;
    }
    
    const baseScore = 55 + Math.abs(hash % 40);
    const baseRating = 3 + Math.abs(hash % 20) / 10;
    
    const keys = getCategoryMetricKeys(item.category);
    const scores: Record<string, number> = {};
    keys.forEach((key, idx) => {
      const variance = ((hash >> (idx * 4)) % 30) - 15;
      scores[key] = Math.max(30, Math.min(95, baseScore + variance));
    });
    
    // Generate star distribution (percentage for each star level)
    const total = item.reviewCount || 100;
    const dist5 = Math.round(baseScore * 0.8 + Math.abs(hash % 10));
    const dist4 = Math.round((100 - dist5) * 0.5);
    const dist3 = Math.round((100 - dist5 - dist4) * 0.5);
    const dist2 = Math.round((100 - dist5 - dist4 - dist3) * 0.6);
    const dist1 = 100 - dist5 - dist4 - dist3 - dist2;
    
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
      starDistribution: [dist1, dist2, dist3, dist4, dist5],
    };
  }, [item]);

  if (!item) return null;

  const metricsCategory = ['developers', 'projects', 'locations', 'apps', 'units', 'brokers'].includes(item.category) 
    ? item.category 
    : 'default';

  const getReviewerName = (key: string) => t(`reviewerNames.${key}`);
  const getReviewText = (index: number) => {
    const reviews = t(`categoryReviews.${metricsCategory}`, { returnObjects: true }) as string[];
    return reviews[index % reviews.length];
  };
  const formatDate = (date: Date) => date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');

  const filteredReviews = activeFilter 
    ? reviews.filter(r => r.rating === activeFilter)
    : reviews;

  const getRatingLabel = (r: number) => {
    if (r >= 4.5) return t("trustScore.excellent", "Excellent");
    if (r >= 3.5) return t("trustScore.great", "Great");
    if (r >= 2.5) return t("trustScore.average", "Average");
    return t("trustScore.poor", "Poor");
  };

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
        <div className="grid grid-cols-2 gap-4">
          {m.yearEstablished && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("developers.established", "Established")} value={`${m.yearEstablished} (${yearsInBusiness} ${t("developers.years", "yrs")})`} />}
          {m.location && <DetailRow icon={<MapPin className="w-4 h-4 text-primary" />} label={t("developers.headquarters", "Headquarters")} value={m.location as string} />}
          {m.employees && <DetailRow icon={<Briefcase className="w-4 h-4 text-primary" />} label={t("developers.employeesLabel", "Employees")} value={`${(m.employees as number).toLocaleString()}+`} />}
          {m.projectsCompleted && <DetailRow icon={<FolderKanban className="w-4 h-4 text-primary" />} label={t("developers.projectsLabel", "Projects")} value={String(m.projectsCompleted)} />}
          {m.registeredUsers && <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label={t("developers.registeredUsers", "Registered Users")} value={(m.registeredUsers as number).toLocaleString()} />}
          {m.capital && <DetailRow icon={<Banknote className="w-4 h-4 text-primary" />} label={t("developers.capital", "Capital")} value={m.capital as string} />}
        </div>
      );
    }

    if (currentItem.category === 'projects') {
      return (
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
      );
    }

    if (currentItem.category === 'brokers') {
      return (
        <div className="grid grid-cols-2 gap-4">
          {m.specialty && <DetailRow icon={<Award className="w-4 h-4 text-primary" />} label={t("brokers.specialty", "Specialty")} value={m.specialty as string} />}
          {m.location && <DetailRow icon={<MapPin className="w-4 h-4 text-primary" />} label={t("brokers.location", "Location")} value={m.location as string} />}
          {m.yearFounded && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("brokers.yearFounded", "Year Founded")} value={String(m.yearFounded)} />}
          {m.agentCount && <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label={t("brokers.agents", "Agents")} value={`${(m.agentCount as number).toLocaleString()}+`} />}
          {m.dealsCompleted && <DetailRow icon={<FileText className="w-4 h-4 text-primary" />} label={t("brokers.dealsCompleted", "Deals Completed")} value={(m.dealsCompleted as number).toLocaleString()} />}
          {m.activeListings && <DetailRow icon={<FolderKanban className="w-4 h-4 text-primary" />} label={t("brokers.activeListings", "Active Listings")} value={(m.activeListings as number).toLocaleString()} />}
        </div>
      );
    }

    if (currentItem.category === 'apps') {
      return (
        <div className="grid grid-cols-2 gap-4">
          {m.type && <DetailRow icon={<Globe className="w-4 h-4 text-primary" />} label={t("apps.type", "Type")} value={m.type as string} />}
          {m.launchYear && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("apps.launchYear", "Launch Year")} value={String(m.launchYear)} />}
          {m.downloads && <DetailRow icon={<Download className="w-4 h-4 text-primary" />} label={t("apps.downloads", "Downloads")} value={m.downloads as string} />}
          {m.monthlyActiveUsers && <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label={t("apps.mau", "Monthly Active Users")} value={m.monthlyActiveUsers as string} />}
          {m.featuredListings && <DetailRow icon={<FolderKanban className="w-4 h-4 text-primary" />} label={t("apps.featuredListings", "Featured Listings")} value={(m.featuredListings as number).toLocaleString()} />}
        </div>
      );
    }

    return null;
  };

  const renderTags = (currentItem: SearchItem) => {
    const m = currentItem.meta || {};
    const tags: string[] = [];

    if (currentItem.category === 'developers' && m.specialties) {
      return (m.specialties as string[]).map(s => (
        <span key={s} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
      ));
    }
    if (currentItem.category === 'projects' && m.unitTypes) {
      return (m.unitTypes as string[]).map(u => (
        <span key={u} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">{u}</span>
      ));
    }
    if (currentItem.category === 'brokers' && m.languages) {
      return (m.languages as string[]).map(l => (
        <span key={l} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">{l}</span>
      ));
    }
    if (currentItem.category === 'apps' && m.platform) {
      return (m.platform as string[]).map(p => (
        <span key={p} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
          <Monitor className="w-3 h-3 inline mr-1" />{p}
        </span>
      ));
    }
    return null;
  };

  const renderQuickStats = (currentItem: SearchItem) => {
    const m = currentItem.meta || {};
    type StatItem = { icon: React.ReactNode; label: string; value: string };
    const stats: StatItem[] = [];

    if (currentItem.category === 'developers') {
      if (m.yearEstablished) {
        const years = new Date().getFullYear() - (m.yearEstablished as number);
        stats.push({ icon: <CalendarDays className="w-3.5 h-3.5" />, label: t("developers.established", "Est."), value: `${m.yearEstablished} (${years} ${t("developers.years", "yrs")})` });
      }
      if (m.employees) stats.push({ icon: <Briefcase className="w-3.5 h-3.5" />, label: t("developers.employeesLabel", "Employees"), value: `${(m.employees as number).toLocaleString()}+` });
      if (m.capital) stats.push({ icon: <Banknote className="w-3.5 h-3.5" />, label: t("developers.capital", "Capital"), value: m.capital as string });
      if (m.projectsCompleted) stats.push({ icon: <FolderKanban className="w-3.5 h-3.5" />, label: t("developers.projectsLabel", "Projects"), value: String(m.projectsCompleted) });
      if (m.registeredUsers) stats.push({ icon: <Users className="w-3.5 h-3.5" />, label: t("developers.registeredUsers", "Users"), value: (m.registeredUsers as number).toLocaleString() });
    } else if (currentItem.category === 'projects') {
      if (m.developerName) stats.push({ icon: <Building2 className="w-3.5 h-3.5" />, label: t("projects.developer", "Developer"), value: m.developerName as string });
      if (m.status) stats.push({ icon: <ListChecks className="w-3.5 h-3.5" />, label: t("projects.status", "Status"), value: m.status as string });
      if (m.totalUnits) stats.push({ icon: <Layers className="w-3.5 h-3.5" />, label: t("projects.totalUnits", "Units"), value: (m.totalUnits as number).toLocaleString() });
      if (m.priceRange) stats.push({ icon: <Banknote className="w-3.5 h-3.5" />, label: t("projects.priceRange", "Price"), value: m.priceRange as string });
      if (m.paymentPlan) stats.push({ icon: <CreditCard className="w-3.5 h-3.5" />, label: t("projects.paymentPlan", "Plan"), value: m.paymentPlan as string });
    } else if (currentItem.category === 'brokers') {
      if (m.yearFounded) stats.push({ icon: <CalendarDays className="w-3.5 h-3.5" />, label: t("brokers.yearFounded", "Founded"), value: String(m.yearFounded) });
      if (m.agentCount) stats.push({ icon: <Users className="w-3.5 h-3.5" />, label: t("brokers.agents", "Agents"), value: `${(m.agentCount as number).toLocaleString()}+` });
      if (m.dealsCompleted) stats.push({ icon: <FileText className="w-3.5 h-3.5" />, label: t("brokers.dealsCompleted", "Deals"), value: (m.dealsCompleted as number).toLocaleString() });
      if (m.activeListings) stats.push({ icon: <FolderKanban className="w-3.5 h-3.5" />, label: t("brokers.activeListings", "Listings"), value: (m.activeListings as number).toLocaleString() });
    } else if (currentItem.category === 'apps') {
      if (m.launchYear) stats.push({ icon: <CalendarDays className="w-3.5 h-3.5" />, label: t("apps.launchYear", "Launched"), value: String(m.launchYear) });
      if (m.downloads) stats.push({ icon: <Download className="w-3.5 h-3.5" />, label: t("apps.downloads", "Downloads"), value: m.downloads as string });
      if (m.monthlyActiveUsers) stats.push({ icon: <Users className="w-3.5 h-3.5" />, label: t("apps.mau", "MAU"), value: m.monthlyActiveUsers as string });
      if (m.featuredListings) stats.push({ icon: <FolderKanban className="w-3.5 h-3.5" />, label: t("apps.featuredListings", "Listings"), value: (m.featuredListings as number).toLocaleString() });
    } else if (currentItem.category === 'locations') {
      if (m.projectCount) stats.push({ icon: <FolderKanban className="w-3.5 h-3.5" />, label: t("locations.projects", "Projects"), value: String(m.projectCount) });
    } else if (currentItem.category === 'units') {
      if (m.averagePrice) stats.push({ icon: <Banknote className="w-3.5 h-3.5" />, label: t("units.avgPrice", "Avg Price"), value: m.averagePrice as string });
      if (m.propertyType) stats.push({ icon: <Building className="w-3.5 h-3.5" />, label: t("units.type", "Type"), value: m.propertyType as string });
    }

    if (stats.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 py-3 border-t border-b border-border">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-sm">
            <span className="text-primary">{stat.icon}</span>
            <span className="text-muted-foreground">{stat.label}:</span>
            <span className="font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Star bar colors matching Trustpilot's green gradient
  const starBarColors = [
    'bg-destructive', // 1 star - red
    'bg-trust-fair',  // 2 star - orange  
    'bg-accent',      // 3 star - yellow
    'bg-trust-good',  // 4 star - light green
    'bg-primary',     // 5 star - green/primary
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-card border border-border rounded-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
      
      {/* ===== TRUSTPILOT-STYLE BANNER ===== */}
      <div className={cn("relative h-24 md:h-32 bg-gradient-to-r", getCategoryBannerStyle(item.category))}>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="text-[80px] md:text-[120px] font-black text-foreground tracking-widest uppercase">
            {item.name.substring(0, 8)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full z-10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* ===== COMPANY HEADER (Trustpilot style) ===== */}
      <div className="px-4 md:px-6 -mt-8 relative z-10">
        <div className="flex items-end gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-4 border-card shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-secondary border-4 border-card shadow-lg flex items-center justify-center">
                {categoryIcons[item.category]}
              </div>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
            <CheckCircle2 className="w-3 h-3" />
            {t("itemDetail.claimedProfile", "Claimed Profile")}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {t(`search.${item.category}`)}
          </Badge>
        </div>

        {/* Company name */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mt-2">
          {item.name}
        </h2>

        {/* Trust Score Gauge + Stars + Rating (Trustpilot style) */}
        <div className="flex flex-col items-center gap-3 mt-4 w-full">
          {/* Large Trust Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${trustScore * 2.64} 264`}
                  className={trustScore >= 66 ? 'text-trust-excellent' : trustScore >= 50 ? 'text-trust-good' : 'text-trust-fair'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-bold", trustScore >= 66 ? 'text-trust-excellent' : trustScore >= 50 ? 'text-trust-good' : 'text-trust-fair')}>{trustScore}</span>
                <span className="text-[8px] font-semibold uppercase tracking-wider text-trust-excellent">Trust Score</span>
              </div>
            </div>
          </div>

          {/* Stars + Rating + Review count */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-5 h-5",
                    star <= Math.round(rating)
                      ? "fill-accent text-accent"
                      : "text-secondary fill-secondary"
                  )}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({(item.reviewCount || Math.abs(parseInt(item.id, 36)) % 5000 + 100).toLocaleString()} {t("reviews.title", "reviews")})
            </span>
          </div>
        </div>

        {/* Subtitle / Category */}
        {item.subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
        )}

        {/* Quick Business Stats Bar */}
        {renderQuickStats(item)}

        {/* Action Buttons (Trustpilot style) */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" className="gap-2" onClick={() => setIsReviewModalOpen(true)}>
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
      </div>

      <Separator className="mt-6" />

      {/* ===== MAIN CONTENT: Two Column Layout ===== */}
      <div className="flex flex-col md:flex-row gap-0 md:gap-0">
        
        {/* LEFT COLUMN - Main content */}
        <div className="flex-1 p-4 md:p-6 space-y-6 md:border-r border-border">
          
          {/* Entity-specific details card */}
          {renderEntityDetails(item) && (
            <div className="bg-secondary/50 border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                {categoryIcons[item.category]}
                <h4 className="font-semibold text-foreground">
                  {item.category === 'developers' ? t("developers.businessDetails", "Business Details") :
                   item.category === 'projects' ? t("projects.details", "Project Details") :
                   item.category === 'brokers' ? t("brokers.details", "Brokerage Details") :
                   item.category === 'apps' ? t("apps.details", "App Details") :
                   t("common.details", "Details")}
                </h4>
              </div>
              {renderEntityDetails(item)}
              {/* Tags */}
              {renderTags(item) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {renderTags(item)}
                </div>
              )}
            </div>
          )}

          {/* Review Summary (AI-generated style like Trustpilot) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{t("reviews.summary", "Review Summary")}</h3>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{t("reviews.aiGenerated", "Based on reviews, created with AI")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getReviewText(0)}
            </p>
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

          {/* Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-foreground">{t("reviews.title")}</h3>
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
                    <Star className={cn("w-3.5 h-3.5", activeFilter === star ? "fill-current" : "")} />
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
                    <div key={review.id} className="bg-secondary/30 rounded-lg p-4 space-y-2 border border-border/50">
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
                                      ? "fill-primary text-primary"
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
                      {/* Review actions like Trustpilot */}
                      <div className="flex items-center gap-4 pt-1">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          {t("reviews.useful", "Useful")}
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <Share2 className="w-3 h-3" />
                          {t("reviews.share", "Share")}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Trustpilot-style) */}
        <div className="w-full md:w-72 p-4 md:p-6 space-y-5">
          
          {/* Rating Breakdown Card */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl font-bold text-foreground">{rating.toFixed(1)}</span>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-4 h-4", s <= Math.round(rating) ? "fill-primary text-primary" : "text-secondary fill-secondary")} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground mt-0.5">{getRatingLabel(rating)}</p>
                <p className="text-xs text-muted-foreground">
                  {(item.reviewCount || Math.abs(parseInt(item.id, 36)) % 5000 + 100).toLocaleString()} {t("reviews.title", "reviews")}
                </p>
              </div>
            </div>
            
            {/* Star Distribution Bars */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-10">{star}-star</span>
                  <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", starBarColors[star - 1])}
                      style={{ width: `${starDistribution[star - 1]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">{t("trustScore.label", "Trust Score")}</h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${trustScore * 2.64} 264`}
                    className={trustScore >= 66 ? 'text-primary' : trustScore >= 50 ? 'text-accent' : 'text-destructive'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-lg font-bold", trustScore >= 66 ? 'text-primary' : trustScore >= 50 ? 'text-accent' : 'text-destructive')}>
                    {trustScore}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("trustScore.outOf", "out of 100")}</p>
                <p className="text-sm font-medium text-foreground">{getRatingLabel(trustScore / 20)}</p>
              </div>
            </div>
          </div>

          {/* Response Rate Card */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("itemDetail.repliedTo", "Replied to")} {Math.min(95, trustScore)}% {t("itemDetail.ofReviews", "of reviews")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("itemDetail.typicallyReplies", "Typically replies within 1 week")}
                </p>
              </div>
            </div>
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
