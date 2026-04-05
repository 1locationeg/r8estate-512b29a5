// @ts-nocheck
import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { NavGroup } from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BusinessProfileHeader } from '@/components/BusinessProfileHeader';
import { GamificationPanel } from '@/components/GamificationPanel';
import { PointsBreakdownHeader } from '@/components/PointsBreakdownHeader';
import { DailyTasksCard } from '@/components/DailyTasksCard';
import { StreakTrackerVisual } from '@/components/StreakTrackerVisual';
import { BusinessActivityCards } from '@/components/BusinessActivityCards';
import { ReferralWidget } from '@/components/ReferralWidget';
import { 
  Loader2, LayoutDashboard, Star, MessageSquare, BarChart3, 
  Building2, Users, Settings, Edit, TrendingUp, Plus, Eye, Image,
  Tag, Plug, Bell, Phone, Mail, Globe, MapPin, Calendar, Upload, FileText, Trophy, Share2, Rocket,
  ArrowUp, Flame, CheckCircle2, Coins, BadgeCheck
} from 'lucide-react';
import { ReviewToSocialModal } from '@/components/ReviewToSocialModal';
import { developers, reviews, projects } from '@/data/mockData';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useGamification } from '@/hooks/useGamification';
import { TIERS } from '@/lib/gamification';
import { getRatingColorClass } from '@/lib/ratingColors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NotificationsPage } from '@/components/NotificationsPage';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import DevProjects from '@/components/DevProjects';
import { WhatsAppReviewRequest } from '@/components/WhatsAppReviewRequest';
import { DealSubmitForm } from '@/components/DealSubmitForm';
import { LaunchSubmitForm } from '@/components/LaunchSubmitForm';
import { MyDeals } from '@/components/MyDeals';
import { MyLaunches } from '@/components/MyLaunches';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { AddBusinessModal } from '@/components/AddBusinessModal';
import { BusinessImageUpload } from '@/components/BusinessImageUpload';
import { ReviewReplyForm } from '@/components/ReviewReplyForm';
import { useTranslation } from 'react-i18next';
// Use first developer as "my business"
const myDev = developers[0];
const myReviews = reviews.filter(r => r.developerId === myDev.id);
const myProjects = projects.filter(p => p.developerId === myDev.id);

// Mock chart data
const reviewsChartData = Array.from({ length: 14 }, (_, i) => ({
  date: `${(i * 2 + 1).toString().padStart(2, '0')} Feb`,
  reviews: i === 0 ? 1 : i === 6 ? 2 : 0,
}));

const viewsChartData = [
  { date: '01 Feb', views: 28 },
  { date: '03 Feb', views: 10 },
  { date: '05 Feb', views: 32 },
  { date: '07 Feb', views: 22 },
  { date: '09 Feb', views: 14 },
  { date: '11 Feb', views: 18 },
  { date: '13 Feb', views: 10 },
  { date: '15 Feb', views: 0 },
  { date: '17 Feb', views: 0 },
  { date: '19 Feb', views: 0 },
  { date: '21 Feb', views: 0 },
  { date: '23 Feb', views: 0 },
  { date: '25 Feb', views: 0 },
  { date: '27 Feb', views: 0 },
];

const companyData = {
  name: myDev.name,
  logo: myDev.logo,
  location: myDev.location,
  established: myDev.yearEstablished,
  employees: myDev.employees,
  specialties: myDev.specialties,
  rating: myDev.rating,
  reviewCount: myDev.reviewCount,
  trustScore: myDev.trustScore,
  isVerified: myDev.verified,
};

const DevOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { profileCompletion, missingFields, currentTier, nextTier, pointsToNext, totalPoints, earnedBadges, lockedBadges, allBadges } = useGamification();
  const { profile: businessProfile } = useBusinessProfile();
  const [subBusinesses, setSubBusinesses] = useState<any[]>([]);

  useEffect(() => {
    if (!businessProfile?.id) return;
    supabase
      .from('business_profiles')
      .select('id, company_name, logo_url, location, categories, created_at')
      .eq('parent_id', businessProfile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setSubBusinesses(data || []));
  }, [businessProfile?.id]);

  const currentTierIdx = TIERS.findIndex(ti => ti.id === currentTier.id);

  const stats = [
    { icon: Star, label: t('businessDashboard.avgRating'), value: myDev.rating.toFixed(1), iconBg: 'bg-accent/20', iconColor: 'text-accent', delta: '+0.2 this month', deltaColor: 'text-trust-excellent' },
    { icon: Edit, label: t('businessDashboard.totalReviews'), value: String(myDev.reviewCount), iconBg: 'bg-business-border/10', iconColor: 'text-business-border', delta: '3 new this week', deltaColor: 'text-trust-excellent' },
    { icon: Eye, label: t('businessDashboard.totalVisitors'), value: '7.0K', iconBg: 'bg-trust-excellent/10', iconColor: 'text-trust-excellent', delta: '+12% vs last month', deltaColor: 'text-trust-excellent' },
  ];

  // Profile completion checklist for business
  const profileChecks = [
    { label: t('businessDashboard.checkCompanyName'), done: !missingFields.includes('Company Name'), pts: 5 },
    { label: t('businessDashboard.checkDescription'), done: !missingFields.includes('Description'), pts: 10 },
    { label: t('businessDashboard.checkLogo'), done: !missingFields.includes('Logo'), pts: 10 },
    { label: t('businessDashboard.checkLocation'), done: !missingFields.includes('Location'), pts: 5 },
    { label: t('businessDashboard.checkPhone'), done: !missingFields.includes('Phone'), pts: 5 },
    { label: t('businessDashboard.checkWebsite'), done: !missingFields.includes('Website'), pts: 5 },
    { label: t('businessDashboard.checkLicense'), done: !missingFields.includes('Business License'), pts: 15 },
  ];

  // Tier journey for businesses
  const businessTiers = TIERS.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Points Breakdown Header — Forest Green */}
      <PointsBreakdownHeader
        totalPoints={totalPoints}
        currentStreak={0}
        tierName={currentTier.name}
        tierEmoji={currentTier.emoji}
        earnedBadges={earnedBadges.length}
        totalBadges={allBadges.length}
        variant="business"
      />

      {/* Hero Row */}
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Left: Welcome + Post Box */}
        <div className="space-y-4">
          <div>
            <Badge className="mb-2 bg-business/50 text-business-foreground border-business-border/30 text-[10px] gap-1">
              <Building2 className="w-3 h-3" /> {t('businessDashboard.verifiedBusiness')}
            </Badge>
            <h2 className="text-2xl font-bold text-foreground">
              {t('businessDashboard.welcomeBack', { name: profile?.full_name?.split(' ')[0] || myDev.name })}
            </h2>
            {pointsToNext > 0 && nextTier && (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-business-border" />
                {t('businessDashboard.ptsAway', { pts: pointsToNext, tier: nextTier.name })}
              </p>
            )}
          </div>

          {/* Community Post Box */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-business-border text-white text-xs font-bold">
                  {myDev.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => navigate('/community')}
                className="flex-1 text-start px-3 py-2.5 bg-secondary/60 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors overflow-hidden h-[38px] relative"
              >
                <span className="absolute inset-x-0 top-0 flex flex-col animate-[post-box-cycle_6s_ease-in-out_infinite] px-3">
                  <span className="h-[38px] flex items-center">{t('businessDashboard.postPrompt1')}</span>
                  <span className="h-[38px] flex items-center">{t('businessDashboard.postPrompt2')}</span>
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 ps-12">
              {['Discussion', 'Tip', 'Experience'].map(cat => (
                <button
                  key={cat}
                  onClick={() => navigate('/community')}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <OnboardingWizard />
        </div>

        {/* Right: Profile Completion + Tier Journey */}
        <div className="space-y-4">
          {/* Profile Completion */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{t('businessDashboard.completeProfile')}</h3>
              <span className="text-xs font-bold text-business-border">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-1.5 mb-3 [&>div]:bg-business-border" />
            <div className="space-y-2">
              {profileChecks.map(check => (
                <div key={check.label} className="flex items-center gap-2.5 text-xs">
                  <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${check.done ? 'text-trust-excellent' : 'text-muted-foreground/30'}`} />
                  <span className={check.done ? 'text-muted-foreground line-through' : 'text-foreground'}>{check.label}</span>
                  {!check.done && (
                    <span className="ms-auto text-[10px] font-bold text-coin flex items-center gap-0.5">
                      <Coins className="w-3 h-3" /> +{check.pts}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tier Journey */}
          <div className="bg-[#27500A] rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{t('businessDashboard.yourJourney')}</h3>
              <span className="text-xs font-bold text-coin flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {totalPoints} pts
              </span>
            </div>
            <div className="relative flex items-center justify-between mb-2">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/10 -translate-y-1/2" />
              {businessTiers.map((tier, i) => {
                const reached = i <= currentTierIdx;
                return (
                  <div key={tier.id} className="relative flex flex-col items-center z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      reached ? 'bg-business-border text-white' : 'bg-white/10 text-white/40'
                    }`}>
                      {tier.emoji}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-white/50">
              {businessTiers.map(tier => (
                <span key={tier.id} className="text-center w-10">{tier.name}</span>
              ))}
            </div>
            <p className="text-[10px] text-white/50 mt-2.5 text-center">
              🔓 {t('businessDashboard.unlockPerks')}
            </p>
          </div>
        </div>
      </div>

      {/* Business Profile Header */}
      <BusinessProfileHeader
        company={companyData}
        profileCompletion={profileCompletion}
        tier={{ name: currentTier.name, emoji: currentTier.emoji }}
        onEditProfile={() => navigate('/business/profile')}
        onSharePage={() => {}}
        onViewPublic={() => {}}
      />

      {/* Stats cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              <div className={`w-10 h-10 ${s.iconBg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {s.label === t('businessDashboard.avgRating') && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(myDev.rating) ? 'text-accent fill-accent' : 'text-muted'}`} />
                  ))}
                </div>
              )}
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
            </div>
            <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium ${s.deltaColor}`}>
              <ArrowUp className="w-3 h-3" />
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Tasks */}
      <DailyTasksCard />

      {/* Streak Tracker */}
      <StreakTrackerVisual currentStreak={0} longestStreak={0} streakBonusPoints={0} />

      {/* Business Activity Cards */}
      <BusinessActivityCards currentTierIndex={currentTierIdx} />

      {/* Sub-Businesses */}
      {subBusinesses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-business-border" />
              My Sub-Businesses
            </h3>
            <Badge variant="secondary" className="text-xs">{subBusinesses.length}</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subBusinesses.map((sb: any) => (
              <div
                key={sb.id}
                onClick={() => navigate(`/entity/${sb.id}`)}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {sb.logo_url ? (
                    <img src={sb.logo_url} alt={sb.company_name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-business/30 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-business-border" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{sb.company_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sb.location || 'No location'} · {sb.categories?.[0] || 'Uncategorized'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts + Reviews + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">{t('businessDashboard.reviewStats')}</h3>
              <Button variant="outline" size="sm" className="text-xs gap-2">📅 February 2026 ▾</Button>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={reviewsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="reviews" stroke="#3B6D11" strokeWidth={2} dot={{ fill: '#3B6D11', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">{t('businessDashboard.viewStats')}</h3>
              <Button variant="outline" size="sm" className="text-xs gap-2">📅 February 2026 ▾</Button>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={viewsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="views" stroke="#3B6D11" strokeWidth={2} dot={{ fill: '#3B6D11', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Latest Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">{t('businessDashboard.latestReviews')}</h3>
              <button className="text-xs text-business-border font-semibold hover:underline">View All →</button>
            </div>
            <div className="space-y-3">
              {myReviews.slice(0, 4).map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {r.avatar && <img src={r.avatar} alt={r.author} className="w-full h-full object-cover rounded-full" />}
                      <AvatarFallback className="text-[10px] bg-accent text-accent-foreground font-bold">
                        {r.author.split(' ').map(n=>n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{r.author}</p>
                      <p className="text-[10px] text-muted-foreground">{r.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">{r.rating}.0</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-accent fill-accent' : 'text-muted'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Review Request CTA */}
          <div className="bg-card border border-business-border/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-business-border" />
              <h4 className="text-sm font-semibold text-foreground">{t('businessDashboard.requestReviewCta')}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t('businessDashboard.requestReviewCtaDesc')}</p>
            <Button
              size="sm"
              className="w-full bg-business-border text-white hover:bg-business-border/90 gap-1.5"
              onClick={() => navigate('/business/whatsapp-reviews')}
            >
              <Phone className="w-3 h-3" /> {t('businessDashboard.sendReviewRequest')}
            </Button>
          </div>

          {/* Referral */}
          <ReferralWidget />
        </div>
      </div>
    </div>
  );
};

const DevReviews = () => {
  const [socialReview, setSocialReview] = useState<{ author: string; rating: number; comment: string; project?: string } | null>(null);
  const { user } = useAuth();
  const { profile: businessProfile } = useBusinessProfile();
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [dbReplies, setDbReplies] = useState<Record<string, any[]>>({});
  const [loadingDb, setLoadingDb] = useState(true);

  const fetchReviews = async () => {
    if (!businessProfile?.id) return;
    setLoadingDb(true);
    // Fetch reviews where developer_id matches business profile id
    const { data: revs } = await supabase
      .from('reviews')
      .select('*')
      .eq('developer_id', businessProfile.id)
      .order('created_at', { ascending: false });

    const reviewsList = revs || [];
    setDbReviews(reviewsList);

    // Fetch replies for these reviews
    if (reviewsList.length > 0) {
      const ids = reviewsList.map((r: any) => r.id);
      const { data: replies } = await supabase
        .from('review_replies')
        .select('*')
        .in('review_id', ids)
        .order('created_at', { ascending: true });
      
      const grouped: Record<string, any[]> = {};
      (replies || []).forEach((rep: any) => {
        if (!grouped[rep.review_id]) grouped[rep.review_id] = [];
        grouped[rep.review_id].push(rep);
      });
      setDbReplies(grouped);
    }
    setLoadingDb(false);
  };

  useEffect(() => { fetchReviews(); }, [businessProfile?.id]);

  // Merge mock + db reviews
  const allReviews = [
    ...dbReviews.map((r: any) => ({
      id: r.id,
      author: r.author_name || 'Anonymous',
      rating: r.rating,
      comment: r.comment,
      project: r.developer_name || '',
      date: new Date(r.created_at).toLocaleDateString(),
      isDb: true,
      developerReply: dbReplies[r.id]?.[0] || null,
    })),
    ...myReviews.map(r => ({ ...r, isDb: false })),
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Reviews Management</h2>
      {loadingDb ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          {allReviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>
          )}
          {allReviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm">{r.author.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{r.author}</p>
                    <p className="text-xs text-muted-foreground">{r.project} · {r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? getRatingColorClass(r.rating) : 'text-muted'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{r.comment}</p>

              {/* Existing reply */}
              {r.developerReply && (
                <div className="p-3 bg-secondary rounded-lg mb-3">
                  <p className="text-xs font-semibold text-primary mb-1">↩ Your Reply</p>
                  <p className="text-xs text-muted-foreground">{r.developerReply.body || r.developerReply.comment}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Reply button — only for DB reviews without a reply */}
                {r.isDb && !r.developerReply && (
                  <ReviewReplyForm reviewId={r.id} onReplySubmitted={fetchReviews} />
                )}
                {!r.isDb && !r.developerReply && (
                  <Button size="sm" variant="outline" disabled><MessageSquare className="w-3 h-3 me-1" /> Reply (mock)</Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSocialReview({ author: r.author, rating: r.rating, comment: r.comment, project: r.project })}
                  className="gap-1.5"
                >
                  <Share2 className="w-3 h-3" />
                  Share as Post
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewToSocialModal
        open={!!socialReview}
        onOpenChange={(open) => { if (!open) setSocialReview(null); }}
        review={socialReview || { author: '', rating: 0, comment: '' }}
        businessName={myDev.name}
      />
    </div>
  );
};

const DevGallery = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Image className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
      <h3 className="font-semibold text-foreground mb-1">Upload Your Gallery</h3>
      <p className="text-sm text-muted-foreground mb-4">Add photos and videos of your projects</p>
      <Button><Plus className="w-4 h-4 me-1" /> Upload Media</Button>
    </div>
  </div>
);

const DevEmployees = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
      <Button><Plus className="w-4 h-4 me-1" /> Invite Member</Button>
    </div>
    <div className="bg-card border border-border rounded-xl divide-y divide-border">
      {['Ahmed Youssef (CEO)', 'Sara Mohamed (Marketing)', 'Karim Ashraf (Sales)'].map((name) => (
        <div key={name} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-sm">{name[0]}</AvatarFallback></Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{name.split(' (')[0]}</p>
              <p className="text-xs text-muted-foreground">{name.match(/\((.+)\)/)?.[1]}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost"><Edit className="w-3 h-3" /></Button>
        </div>
      ))}
    </div>
  </div>
);

const DevCategories = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Categories</h2>
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
      <h3 className="font-semibold text-foreground mb-1">Manage Categories</h3>
      <p className="text-sm text-muted-foreground mb-4">Organize your projects by category</p>
      <Button><Plus className="w-4 h-4 me-1" /> Add Category</Button>
    </div>
  </div>
);

const DevIntegration = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Integrations</h2>
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Plug className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
      <h3 className="font-semibold text-foreground mb-1">Connect Your Tools</h3>
      <p className="text-sm text-muted-foreground mb-4">Integrate with CRM, social media, and more</p>
      <Button><Plus className="w-4 h-4 me-1" /> Add Integration</Button>
    </div>
  </div>
);

const DevSettings = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Business Settings</h2>
    <div className="max-w-lg space-y-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Company Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Company Name</label>
            <input className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border border-border" defaultValue={myDev.name} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Location</label>
            <input className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border border-border" defaultValue={myDev.location} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Specialties</label>
            <input className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border border-border" defaultValue={myDev.specialties.join(', ')} />
          </div>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  </div>
);

// Business Profile Page
const DevBusinessProfile = () => {
  const { profile: bp, isLoading: bpLoading, isSaving, saveProfile } = useBusinessProfile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      const { toast } = await import('sonner');
      toast.error('File must be under 2MB');
      return;
    }
    setIsUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/logo.${ext}`;
      const { supabase } = await import('@/integrations/supabase/client');
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const logoUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await saveProfile({ logo_url: logoUrl });
      const { toast } = await import('sonner');
      toast.success('Logo uploaded successfully');
    } catch (err: any) {
      console.error('Logo upload error:', err);
      const { toast } = await import('sonner');
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const licenseInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      const { toast } = await import('sonner');
      toast.error('File must be under 5MB');
      return;
    }
    setIsUploadingLicense(true);
    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `${user.id}/license.${ext}`;
      const { supabase } = await import('@/integrations/supabase/client');
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const licenseUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await saveProfile({ license_url: licenseUrl });
      const { toast } = await import('sonner');
      toast.success('License uploaded — pending verification');
    } catch (err: any) {
      console.error('License upload error:', err);
      const { toast } = await import('sonner');
      toast.error('Failed to upload license');
    } finally {
      setIsUploadingLicense(false);
      if (licenseInputRef.current) licenseInputRef.current.value = '';
    }
  };

  const [form, setForm] = useState({
    company_name: '',
    description: '',
    location: '',
    year_established: '' as string,
    employees: '' as string,
    specialties: '',
    email: '',
    phone: '',
    website: '',
  });

  useEffect(() => {
    if (bp) {
      setForm({
        company_name: bp.company_name || myDev.name,
        description: bp.description || `${myDev.name} is a leading real estate developer in ${myDev.location}.`,
        location: bp.location || myDev.location,
        year_established: bp.year_established?.toString() || myDev.yearEstablished.toString(),
        employees: bp.employees?.toString() || myDev.employees.toString(),
        specialties: (bp.specialties.length ? bp.specialties : myDev.specialties).join(', '),
        email: bp.email,
        phone: bp.phone,
        website: bp.website,
      });
    }
  }, [bp]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveProfile({
      company_name: form.company_name,
      description: form.description,
      location: form.location,
      year_established: form.year_established ? parseInt(form.year_established) : null,
      employees: form.employees ? parseInt(form.employees) : null,
      specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      email: form.email,
      phone: form.phone,
      website: form.website,
    });
  };

  if (bpLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">Business Profile</h2>

      <div className="space-y-6">
        {/* Company Info */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Company Information
          </h3>
          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Company Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {bp?.logo_url || myDev.logo ? (
                    <img src={bp?.logo_url || myDev.logo} alt={form.company_name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {isUploadingLogo ? 'Uploading…' : 'Upload Logo'}
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Cover Image</Label>
              <div className="mt-2">
                <div className="w-full h-24 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group">
                  {bp?.cover_image_url ? (
                    <img src={bp.cover_image_url} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Image className="w-5 h-5" />
                      <span className="text-[10px]">No cover image</span>
                    </div>
                  )}
                  {bp?.id && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/40 transition-opacity rounded-xl">
                      <BusinessImageUpload
                        businessId={bp.id}
                        type="cover"
                        currentUrl={bp.cover_image_url}
                        onUploaded={() => window.location.reload()}
                      />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Recommended: 1200×300px, JPG or PNG up to 5MB</p>
              </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Company Name</Label>
                <Input className="mt-1" value={form.company_name} onChange={(e) => handleChange('company_name', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Year Established</Label>
                <Input className="mt-1" type="number" value={form.year_established} onChange={(e) => handleChange('year_established', e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Description / Bio</Label>
              <Textarea className="mt-1 min-h-[100px]" placeholder="Tell buyers about your company..." value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Location
                </Label>
                <Input className="mt-1" value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Specialties</Label>
                <Input className="mt-1" value={form.specialties} onChange={(e) => handleChange('specialties', e.target.value)} placeholder="Comma separated" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Contact Details
          </h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input className="mt-1" type="email" placeholder="business@example.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input className="mt-1" type="tel" placeholder="+971 XX XXX XXXX" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Website
              </Label>
              <Input className="mt-1" type="url" placeholder="https://www.yourcompany.com" value={form.website} onChange={(e) => handleChange('website', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Business Documents */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Business Documents
          </h3>

          {bp?.license_url ? (
            <div className="border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-trust-excellent/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-trust-excellent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Trade License</p>
                  <p className="text-xs text-muted-foreground">Uploaded — pending verification</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-xs" asChild>
                  <a href={bp.license_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-3.5 h-3.5 me-1" /> View
                  </a>
                </Button>
                <input
                  ref={licenseInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleLicenseUpload}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => licenseInputRef.current?.click()}
                  disabled={isUploadingLicense}
                >
                  {isUploadingLicense ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">Upload Business License</p>
              <p className="text-xs text-muted-foreground mb-3">Trade license, registration certificate, etc. (PNG, JPG, PDF up to 5MB)</p>
              <input
                ref={licenseInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                onChange={handleLicenseUpload}
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => licenseInputRef.current?.click()}
                disabled={isUploadingLicense}
              >
                {isUploadingLicense ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {isUploadingLicense ? 'Uploading…' : 'Choose File'}
              </Button>
            </div>
          )}
        </div>

        {/* Public Profile Preview */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            Public Profile Preview
          </h3>
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(form.company_name || myDev.name).charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{form.company_name || myDev.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {form.location || myDev.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-accent fill-accent" /> {myDev.rating.toFixed(1)}
              </span>
              <span>{myDev.reviewCount} reviews</span>
              <span>Est. {form.year_established || myDev.yearEstablished}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-brand-red text-white hover:bg-brand-red/90" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin me-1" /> Saving...</> : 'Save Profile'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/business')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, profile, isLoading } = useAuth();
  const [addBusinessOpen, setAddBusinessOpen] = useState(false);
  const { profile: businessProfile } = useBusinessProfile();

  useEffect(() => {
    if (!isLoading) {
      if (!user) navigate('/auth');
      else if (role !== 'business' && role !== 'admin') navigate('/buyer');
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user || (role !== 'business' && role !== 'admin')) return null;

  const subPath = location.pathname.replace('/business', '').replace('/', '');
  const pageTitle = subPath ? subPath.charAt(0).toUpperCase() + subPath.slice(1) : 'Dashboard';

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/business' },
    { icon: <Building2 className="w-4 h-4" />, label: 'Business Profile', path: '/business/profile' },
    { icon: <Star className="w-4 h-4" />, label: 'Reviews', path: '/business/reviews' },
    { icon: <Phone className="w-4 h-4" />, label: 'Request Review', path: '/business/request-review' },
    { icon: <MapPin className="w-4 h-4" />, label: 'Projects', path: '/business/projects' },
    { icon: <Trophy className="w-4 h-4" />, label: 'Rewards & Badges', path: '/business/gamification' },
    { icon: <Trophy className="w-4 h-4" />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Tag className="w-4 h-4" />, label: 'My Deals', path: '/business/my-deals' },
    { icon: <Rocket className="w-4 h-4" />, label: 'My Launches', path: '/business/my-launches' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', path: '/messages' },
    { icon: <Users className="w-4 h-4" />, label: 'Community', path: '/community' },
    { icon: <Bell className="w-4 h-4" />, label: 'Notifications', path: '/business/notifications' },
    { icon: <Settings className="w-4 h-4" />, label: 'Notification Preferences', path: '/business/notification-preferences' },
    { icon: <Settings className="w-4 h-4" />, label: 'Account Details', path: '/business/settings' },
  ];

  return (
    <DashboardLayout
      title={pageTitle}
      breadcrumb={`Business > ${pageTitle}`}
      sidebarProps={{
        navItems,
        portalLabel: 'Business',
        companyInfo: {
          name: profile?.full_name || myDev.name,
          subtitle: `${myDev.reviewCount} Reviews`,
        },
        bottomAction: {
          icon: <Plus className="w-4 h-4" />,
          label: 'Add Business',
          onClick: () => setAddBusinessOpen(true),
        },
      }}
    >
      <AddBusinessModal
        open={addBusinessOpen}
        onOpenChange={setAddBusinessOpen}
        parentBusinessId={businessProfile?.id}
      />
      <Routes>
        <Route index element={<DevOverview />} />
        <Route path="profile" element={<DevBusinessProfile />} />
        <Route path="projects" element={<DevProjects />} />
        <Route path="gamification" element={<GamificationPanel />} />
        <Route path="reviews" element={<DevReviews />} />
        <Route path="request-review" element={<WhatsAppReviewRequest />} />
        <Route path="submit-deal" element={<DealSubmitForm />} />
        <Route path="my-deals" element={<MyDeals />} />
        <Route path="submit-launch" element={<LaunchSubmitForm />} />
        <Route path="my-launches" element={<MyLaunches />} />
        <Route path="gallery" element={<DevGallery />} />
        <Route path="employees" element={<DevEmployees />} />
        <Route path="categories" element={<DevCategories />} />
        <Route path="integration" element={<DevIntegration />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="notification-preferences" element={<NotificationPreferences />} />
        <Route path="settings" element={<DevSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
