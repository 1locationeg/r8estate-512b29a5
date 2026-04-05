import { useState, useMemo, useEffect, useCallback } from "react";
import { generateAvatar } from "@/lib/avatarUtils";
import { useTrackInterest } from "@/hooks/useTrackInterest";
import { downloadTrustReport } from "@/lib/generateTrustReport";
import { WriteReviewModal } from "./WriteReviewModal";
import { CompareModal } from "./CompareModal";
import { ReviewMotivatorFloat } from "./ReviewMotivatorFloat";
import { ReviewBlockedModal } from "./ReviewBlockedModal";
import { useReviewability } from "@/hooks/useReviewability";
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
  MessageCircle,
  ThumbsUp,
  Share2,
  Sparkles,
  Bookmark,
  UserPlus,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustCategoryBar } from "./TrustCategoryBar";
import { ShareMenu } from "./ShareMenu";
import { getRatingColorClass } from "@/lib/ratingColors";
import { type SearchItem, type SearchCategory } from "@/data/searchIndex";
import { useReviews } from "@/hooks/useReviews";
import { useSavedItem, useFollowBusiness } from "@/hooks/useSaveFollow";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useStartChat } from "@/hooks/useStartChat";
import { supabase } from "@/integrations/supabase/client";
import { BusinessImageUpload } from "./BusinessImageUpload";
import { BusinessCategoryPicker } from "./BusinessCategoryPicker";
import { BUSINESS_CATEGORIES } from "@/data/businessCategories";
import { Tag } from "lucide-react";

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
  { id: '1', key: 'ahmed', avatar: generateAvatar('Ahmed', 'reviewer'), tier: 'gold', verified: true },
  { id: '2', key: 'sara', avatar: generateAvatar('Sara', 'reviewer'), tier: 'silver', verified: true },
  { id: '3', key: 'omar', avatar: generateAvatar('Omar', 'reviewer'), tier: 'bronze', verified: false },
  { id: '4', key: 'fatima', avatar: generateAvatar('Fatima', 'reviewer'), tier: 'silver', verified: true },
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewBlockedOpen, setIsReviewBlockedOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const { isReviewable, parentName, childProjects } = useReviewability(item?.id);
  const { startChatWithBusinessId } = useStartChat();
  const [isOwner, setIsOwner] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(item?.meta?.coverImage as string | undefined);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(item?.image);

  // Check if current user owns this business profile
  useEffect(() => {
    if (!user || !item?.id) { setIsOwner(false); return; }
    supabase
      .from('business_profiles')
      .select('id')
      .eq('id', item.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsOwner(!!data));
  }, [user, item?.id]);

  // Sync image urls when item changes
  useEffect(() => {
    setCoverImageUrl(item?.meta?.coverImage as string | undefined);
    setLogoUrl(item?.image);
  }, [item?.image, item?.meta?.coverImage]);

  // Track implicit interest when item detail is opened
  const { trackClick } = useTrackInterest();
  useEffect(() => {
    if (item?.id) {
      trackClick(item.id, item.name);
    }
  }, [item?.id]);

  const handleWriteReview = () => {
    if (!isReviewable) {
      setIsReviewBlockedOpen(true);
      return;
    }
    setIsReviewModalOpen(true);
  };
  const { dbReviews, refetch: refetchReviews } = useReviews(item?.id);
  const { isSaved, toggle: toggleSave, loading: saveLoading } = useSavedItem(item?.id || "", item?.category || "item");
  const { isFollowing, toggle: toggleFollow, loading: followLoading } = useFollowBusiness(item?.id || "");

  const { trustScore, rating, categoryScores, reviews, metricKeys, starDistribution, liveReviewCount } = useMemo(() => {
    if (!item) return { trustScore: 0, rating: 0, categoryScores: {}, reviews: [], metricKeys: [], starDistribution: [0,0,0,0,0], liveReviewCount: 0 };

    const isDynamicProfile = !!item.meta?.dynamicBusinessProfile;

    // Dynamic hash for deterministic variance (only for static/mock entities)
    let hash = 0;
    if (!isDynamicProfile) {
      for (let i = 0; i < item.id.length; i++) {
        hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
        hash = hash & hash;
      }
    }
    
    // --- Dynamic inputs: use real dbReviews for dynamic profiles ---
    const reviewCount = isDynamicProfile ? dbReviews.length : (item.reviewCount || 0);
    const baseRating = isDynamicProfile
      ? (dbReviews.length > 0 ? dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length : 0)
      : (item.rating || (3 + Math.abs(hash % 20) / 10));
    const likes = (item.meta?.likes as number) || (isDynamicProfile ? 0 : Math.abs(hash % 200));
    const shares = (item.meta?.shares as number) || (isDynamicProfile ? 0 : Math.abs((hash >> 3) % 80));
    const replies = (item.meta?.replies as number) || (isDynamicProfile ? 0 : Math.abs((hash >> 5) % 60));

    // --- Trust Score Formula ---
    // For dynamic profiles: rating is the primary driver (0-70), volume adds up to 30
    const ratingScore = isDynamicProfile
      ? (baseRating / 5) * 70
      : (baseRating / 5) * 40;
    const reviewScore = isDynamicProfile
      ? Math.min(30, reviewCount > 0 ? (Math.log10(reviewCount + 1) / Math.log10(100)) * 30 : 0)
      : Math.min(30, (Math.log10(Math.max(1, reviewCount)) / Math.log10(500)) * 30);
    const engagementRaw = (likes * 1) + (shares * 3) + (replies * 2);
    const engagementScore = isDynamicProfile ? 0 : Math.min(30, (Math.log10(Math.max(1, engagementRaw)) / Math.log10(5000)) * 30);
    const computedScore = Math.round(Math.min(100, Math.max(0, ratingScore + reviewScore + engagementScore)));
    
    const keys = getCategoryMetricKeys(item.category);
    const scores: Record<string, number> = {};
    keys.forEach((key, idx) => {
      if (isDynamicProfile) {
        // Aggregate real category_ratings from dbReviews if available
        const reviewsWithKey = dbReviews.filter(r => r.categoryRatings && typeof r.categoryRatings[key] === 'number' && r.categoryRatings[key] > 0);
        if (reviewsWithKey.length > 0) {
          const avg = reviewsWithKey.reduce((sum, r) => sum + (r.categoryRatings![key] || 0), 0) / reviewsWithKey.length;
          scores[key] = Math.max(0, Math.min(100, Math.round((avg / 5) * 100)));
        } else {
          // Fallback: derive from overall rating with slight variance
          const variance = [0, -3, 2, -1][idx % 4];
          scores[key] = reviewCount > 0 ? Math.max(0, Math.min(100, Math.round((baseRating / 5) * 100) + variance)) : 0;
        }
      } else {
        const variance = ((hash >> (idx * 4)) % 30) - 15;
        scores[key] = Math.max(30, Math.min(95, computedScore + variance));
      }
    });
    
    // Generate star distribution
    let dist5 = 0, dist4 = 0, dist3 = 0, dist2 = 0, dist1 = 0;
    let reviewsList: Array<typeof mockReviewerData[0] & { rating: number; reviewIndex: number; date: Date }> = [];

    if (isDynamicProfile) {
      // Compute real star distribution from dbReviews
      if (dbReviews.length > 0) {
        const counts = [0, 0, 0, 0, 0];
        dbReviews.forEach(r => {
          const star = Math.max(1, Math.min(5, Math.round(r.rating)));
          counts[star - 1]++;
        });
        const total = dbReviews.length;
        dist1 = Math.round((counts[0] / total) * 100);
        dist2 = Math.round((counts[1] / total) * 100);
        dist3 = Math.round((counts[2] / total) * 100);
        dist4 = Math.round((counts[3] / total) * 100);
        dist5 = 100 - dist1 - dist2 - dist3 - dist4;
      }
    } else {
      dist5 = Math.round(computedScore * 0.8 + Math.abs(hash % 10));
      dist4 = Math.round((100 - dist5) * 0.5);
      dist3 = Math.round((100 - dist5 - dist4) * 0.5);
      dist2 = Math.round((100 - dist5 - dist4 - dist3) * 0.6);
      dist1 = 100 - dist5 - dist4 - dist3 - dist2;

      reviewsList = mockReviewerData.map((reviewer, idx) => ({
        ...reviewer,
        rating: Math.max(1, Math.min(5, Math.round(baseRating + (idx % 3) - 1))),
        reviewIndex: idx,
        date: new Date(Date.now() - (idx * 7 * 24 * 60 * 60 * 1000)),
      }));
    }
    
    return {
      trustScore: computedScore,
      rating: baseRating,
      categoryScores: scores,
      reviews: reviewsList,
      metricKeys: keys,
      starDistribution: [dist1, dist2, dist3, dist4, dist5],
      liveReviewCount: reviewCount,
    };
  }, [item, dbReviews]);

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

    // Fallback for generic categories (units, categories, etc.)
    const hasAnyMeta = Object.values(m).some(v => v !== undefined && v !== null);
    if (hasAnyMeta || currentItem.subtitle) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {currentItem.subtitle && <DetailRow icon={<Layers className="w-4 h-4 text-primary" />} label={t("entity.category", "Category")} value={currentItem.subtitle} />}
          {m.launchDate && <DetailRow icon={<CalendarDays className="w-4 h-4 text-primary" />} label={t("entity.launchDate", "Launch Date")} value={String(m.launchDate)} />}
          {m.trendScore && <DetailRow icon={<TrendingUp className="w-4 h-4 text-primary" />} label={t("entity.trendScore", "Trend Score")} value={String(m.trendScore)} />}
          {m.likes && <DetailRow icon={<ThumbsUp className="w-4 h-4 text-primary" />} label={t("entity.engagement", "Engagement")} value={`${m.likes} ${t("entity.likes", "likes")}`} />}
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
          <Monitor className="w-3 h-3 inline me-1" />{p}
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
    <div className="w-full max-w-3xl mx-auto mt-6 bg-card border border-border rounded-xl overflow-hidden animate-in slide-in-from-top-4 duration-300 overflow-x-hidden">
      
      {/* ===== TRUSTPILOT-STYLE BANNER ===== */}
      <div className={cn("relative h-24 md:h-32 bg-gradient-to-r overflow-hidden", getCategoryBannerStyle(item.category))}>
        {coverImageUrl && (
          <img src={coverImageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {!coverImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 overflow-hidden">
            <div className="text-[clamp(40px,15vw,120px)] font-black text-foreground tracking-widest uppercase truncate max-w-full px-4">
              {item.name.substring(0, 8)}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 end-3 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full z-10"
        >
          <X className="w-4 h-4" />
        </Button>
        {isOwner && item.id && (
          <div className="absolute bottom-3 end-3 z-10">
            <BusinessImageUpload
              businessId={item.id}
              type="cover"
              currentUrl={coverImageUrl}
              onUploaded={(url) => setCoverImageUrl(url)}
            />
          </div>
        )}
      </div>

      {/* ===== COMPANY HEADER (Trustpilot style) ===== */}
      <div className="px-4 md:px-6 -mt-8 relative z-10">
        <div className="flex items-end gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 relative group">
            {(logoUrl || item.image) ? (
              <img
                src={logoUrl || item.image}
                alt={item.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-4 border-card shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-secondary border-4 border-card shadow-lg flex items-center justify-center">
                {categoryIcons[item.category]}
              </div>
            )}
            {isOwner && item.id && (
              <BusinessImageUpload
                businessId={item.id}
                type="logo"
                currentUrl={logoUrl}
                onUploaded={(url) => setLogoUrl(url)}
                className="absolute -bottom-1 -end-1 opacity-0 group-hover:opacity-100 transition-opacity"
              />
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
        <div className="flex flex-col items-center gap-4 mt-4 w-full">
          {/* Modern AI-themed Trust Meter */}
           <div className="flex flex-col items-center">
            <div className="relative w-48 h-28 flex-shrink-0">
              <svg className="w-48 h-28" viewBox="0 0 200 110" overflow="visible">
                {/* Grey remaining arc (full semicircle) */}
                <path
                  d="M 10 100 A 90 90 0 0 1 190 100"
                  fill="none"
                  stroke="hsl(0 0% 88%)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {/* Score arc + arrow marker */}
                {(() => {
                  const arcLen = Math.PI * 90;
                  const filled = (trustScore / 100) * arcLen;
                  const getArcColor = (s: number) => {
                    if (s >= 66) return "hsl(152 69% 40%)";
                    if (s >= 50) return "hsl(48 100% 50%)";
                    return "hsl(0 80% 50%)";
                  };
                  const color = getArcColor(trustScore);
                  // Arrow position on the arc
                  const angle = Math.PI + (trustScore / 100) * Math.PI;
                  const mx = 100 + 90 * Math.cos(angle);
                  const my = 100 + 90 * Math.sin(angle);
                  const rotDeg = (trustScore / 100) * 180 - 90;
                  return (
                    <>
                      <path
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${filled} ${arcLen}`}
                      />
                      {/* Arrow marker on arc */}
                      <circle cx={mx} cy={my} r="7" fill="white" stroke={color} strokeWidth="2" />
                      <polygon
                        points="-4,4 4,4 0,-5"
                        fill={color}
                        transform={`translate(${mx},${my}) rotate(${rotDeg})`}
                      />
                    </>
                  );
                })()}
              </svg>

              {/* Score + TRUST SCORE centered in the middle of the semicircle */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
                <span className="text-4xl font-black text-foreground leading-none">{trustScore}</span>
                <span className="text-base font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Trust Score</span>
              </div>
            </div>
          </div>

          {/* Stars + Rating + Review count */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
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
              ({(item.reviewCount || (item.meta?.dynamicBusinessProfile ? 0 : Math.abs(parseInt(item.id, 36)) % 5000 + 100)).toLocaleString()} {t("reviews.title", "reviews")})
            </span>
          </div>
        </div>

        {/* Subtitle / Category */}
        {item.subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
        )}

        {/* Quick Business Stats Bar */}
        {renderQuickStats(item)}

        {/* Save & Follow Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => {
              if (!user) { navigate("/auth"); return; }
              toggleSave(item.name, item.image);
            }}
            disabled={saveLoading}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary-foreground" : ""}`} />
            {isSaved ? t("common.saved", "Saved") : t("common.save", "Save")}
          </Button>
          <Button
            variant={isFollowing ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => {
              if (!user) { navigate("/auth"); return; }
              toggleFollow(item.name);
            }}
            disabled={followLoading}
          >
            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isFollowing ? t("common.following", "Following") : t("common.follow", "Follow")}
          </Button>
        </div>

        {/* Action Buttons (Trustpilot style) */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button size="sm" className="gap-2" onClick={handleWriteReview}>
            <PenLine className="w-4 h-4" />
            {t("search.writeReview")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleWriteReview}>
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/community?newPost=true&developer=${item.id}`)}
          >
            <MessageCircle className="w-4 h-4" />
            Ask Community
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => startChatWithBusinessId(item.id)}
          >
            <MessageSquare className="w-4 h-4" />
            {t("common.message", "Message")}
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
        <div className="flex-1 p-4 md:p-6 space-y-6 md:border-e border-border">
          
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

            {/* User-Submitted Review Cards */}
            {dbReviews.length > 0 && (
              <div className="space-y-3 mb-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("reviews.userReviews", "User Reviews")}</h4>
                {dbReviews
                  .filter(r => !activeFilter || r.rating === activeFilter)
                  .map((review) => (
                  <div key={review.id} className="bg-primary/5 rounded-lg p-4 space-y-2 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {review.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{review.author}</span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">{t("reviews.verified", "Verified")}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "fill-primary text-primary" : "text-secondary")} />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{new Date(review.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
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
                ))}
              </div>
            )}

            {/* Mock Review Cards */}
            <div className="space-y-3">
              {filteredReviews.length === 0 && dbReviews.filter(r => !activeFilter || r.rating === activeFilter).length === 0 ? (
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
                   {(item.meta?.dynamicBusinessProfile ? liveReviewCount : (item.reviewCount || Math.abs(parseInt(item.id, 36)) % 5000 + 100)).toLocaleString()} {t("reviews.title", "reviews")}
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

      <ReviewMotivatorFloat
        onWriteReview={handleWriteReview}
        isReviewModalOpen={isReviewModalOpen}
      />
      <WriteReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        developerName={item?.name || ""}
        developerId={item?.id || ""}
        onReviewSubmitted={refetchReviews}
        entityCategory={item?.category || "developers"}
      />
      <ReviewBlockedModal
        open={isReviewBlockedOpen}
        onOpenChange={setIsReviewBlockedOpen}
        parentName={parentName || item?.name}
        childProjects={childProjects}
      />
      <CompareModal
        item={item}
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
};
