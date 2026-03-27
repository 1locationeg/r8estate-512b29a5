import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useBuyerGamification } from '@/hooks/useBuyerGamification';
import { Loader2, LayoutDashboard, Star, Heart, Search, Settings, TrendingUp, Building2, MessageSquare, Bell, Shield, Award, CheckCircle2, Camera, Mail, Phone, User, Calendar, MapPin, Wallet, Edit3, Save, BadgeCheck, Sparkles, Activity, Eye, FileText, Users, Trophy, Gift, Bookmark, Coins, ArrowUp, ArrowRight, Flame, ExternalLink } from 'lucide-react';
import { DailyTasksCard } from '@/components/DailyTasksCard';
import { ActivityCardsGrid } from '@/components/ActivityCardsGrid';
import { StreakTrackerVisual } from '@/components/StreakTrackerVisual';
import { PointsBreakdownHeader } from '@/components/PointsBreakdownHeader';
import { BUYER_TIERS } from '@/lib/buyerGamification';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { developers, reviews, projects } from '@/data/mockData';
import { getRatingColorClass } from '@/lib/ratingColors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationsPage } from '@/components/NotificationsPage';
import { BuyerGamificationPanel } from '@/components/BuyerGamificationPanel';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { ReferralWidget } from '@/components/ReferralWidget';
import { SavedSearchWidget } from '@/components/SavedSearchWidget';
import { WelcomeGiftOverlay } from '@/components/WelcomeGiftOverlay';
import { POINTS_PER_ACTION } from '@/lib/buyerGamification';
import { BusinessUpgradeModal } from '@/components/BusinessUpgradeModal';

const BuyerOverview = () => {
  const navigate = useNavigate();
  const { profile, role, refreshProfile, user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const gamification = useBuyerGamification();

  const stats = [
    { icon: Building2, label: 'Developers Viewed', value: '24', bg: 'bg-primary/10', iconColor: 'text-primary', delta: '+3 this week', deltaColor: 'text-trust-excellent' },
    { icon: Star, label: 'Reviews Written', value: '3', bg: 'bg-accent/20', iconColor: 'text-accent', delta: '1 draft pending', deltaColor: 'text-accent' },
    { icon: Heart, label: 'Saved Projects', value: '12', bg: 'bg-brand-red/10', iconColor: 'text-brand-red', delta: '3 new matches', deltaColor: 'text-trust-excellent' },
    { icon: TrendingUp, label: 'Reports Unlocked', value: '8', bg: 'bg-trust-excellent/10', iconColor: 'text-trust-excellent', delta: '2 this month', deltaColor: 'text-muted-foreground' },
  ];

  const recentReviews = reviews.slice(0, 4);
  const savedProjects = projects.slice(0, 3);

  // Tier journey data
  const tiers = [
    { name: 'Visitor', emoji: '👋', minPts: 0 },
    { name: 'Newcomer', emoji: '🌱', minPts: 10 },
    { name: 'Explorer', emoji: '🧭', minPts: 50 },
    { name: 'Pro', emoji: '⭐', minPts: 150 },
  ];
  const currentTierIdx = tiers.findIndex(t => t.name === gamification.currentTier?.name);

  // Profile completion checklist
  const profileChecks = [
    { label: 'Add your name', done: !!profile?.full_name, pts: 5 },
    { label: 'Upload photo', done: !!profile?.avatar_url, pts: 10 },
    { label: 'Set buyer type', done: !!profile?.buyer_type, pts: 5 },
    { label: 'Add phone number', done: !!profile?.phone_number, pts: 5 },
    { label: 'Set budget range', done: !!profile?.budget_range, pts: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Points Breakdown Header */}
      <PointsBreakdownHeader
        totalPoints={gamification.totalPoints}
        currentStreak={gamification.currentStreak ?? 0}
        tierName={gamification.currentTier?.name || 'Newcomer'}
        tierEmoji={gamification.currentTier?.emoji || '🌱'}
        earnedBadges={gamification.earnedBadges?.length || 0}
        totalBadges={(gamification.earnedBadges?.length || 0) + (gamification.lockedBadges?.length || 0)}
      />
      {/* Hero Row */}
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Left: Welcome + Post Box */}
        <div className="space-y-4">
          {/* Verified badge + Greeting */}
          <div>
            {user && (
              <Badge className="mb-2 bg-primary/10 text-primary border-0 text-[10px] gap-1">
                <BadgeCheck className="w-3 h-3" /> Verified Buyer
              </Badge>
            )}
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
            </h2>
            {gamification.pointsToNext > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-accent" />
                You're {gamification.pointsToNext} pts away from {gamification.nextTier?.name || 'the next tier'}
              </p>
            )}
          </div>

          {/* Community Post Box */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => navigate('/community')}
                className="flex-1 text-start px-3 py-2.5 bg-secondary/60 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors overflow-hidden h-[38px] relative"
              >
                <span className="absolute inset-x-0 top-0 flex flex-col animate-[post-box-cycle_6s_ease-in-out_infinite] px-3">
                  <span className="h-[38px] flex items-center">Share an experience.</span>
                  <span className="h-[38px] flex items-center">Ask a question.</span>
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 ps-12">
              {['Discussion', 'Question', 'Tip'].map(cat => (
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

          {/* Onboarding Wizard */}
          <OnboardingWizard />
        </div>

        {/* Right: Profile Completion + Tier Journey */}
        <div className="space-y-4">
          {/* Profile Completion */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Complete Your Profile</h3>
              <span className="text-xs font-bold text-primary">{gamification.profileCompletion}%</span>
            </div>
            <Progress value={gamification.profileCompletion} className="h-1.5 mb-3" />
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

          {/* Tier Journey Card */}
          <div className="bg-sidebar-bg rounded-xl p-4 text-sidebar-foreground">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Your Journey</h3>
              <span className="text-xs font-bold text-coin flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {gamification.totalPoints} pts
              </span>
            </div>
            {/* Track */}
            <div className="relative flex items-center justify-between mb-2">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/10 -translate-y-1/2" />
              {tiers.map((tier, i) => {
                const reached = i <= currentTierIdx;
                return (
                  <div key={tier.name} className="relative flex flex-col items-center z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      reached ? 'bg-sidebar-active text-white' : 'bg-white/10 text-sidebar-muted'
                    }`}>
                      {tier.emoji}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-sidebar-muted">
              {tiers.map(tier => (
                <span key={tier.name} className="text-center w-10">{tier.name}</span>
              ))}
            </div>
            <p className="text-[10px] text-sidebar-muted mt-2.5 text-center">
              🔓 Unlock exclusive badges & perks as you level up
            </p>
          </div>
        </div>
      </div>

      {/* Register Your Business CTA */}
      {role !== 'business' && role !== 'admin' && (
      <div className="relative overflow-hidden rounded-2xl border border-business-border/30 bg-business">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-10 -end-10 w-40 h-40 bg-business-border rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-center gap-4 p-5 sm:p-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-business-border/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-business-border" />
          </div>
          <div className="flex-1 text-center sm:text-start">
            <h3 className="font-bold text-business-foreground text-base">Are you a developer or business?</h3>
            <p className="text-sm text-business-foreground/70 mt-0.5">
              Upgrade your account to manage your business profile, respond to reviews, and build trust with buyers.
            </p>
          </div>
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="flex-shrink-0 gap-2 bg-business-border text-white hover:bg-business-border/90"
          >
            <Building2 className="w-4 h-4" />
            Apply for Business
          </Button>
        </div>
      </div>
      )}

      <BusinessUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />

      {/* Stats with Deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium ${s.deltaColor}`}>
              <ArrowUp className="w-3 h-3" />
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Tasks & Streak */}
      <DailyTasksCard />
      <StreakTrackerVisual
        currentStreak={gamification.currentStreak ?? 0}
        longestStreak={gamification.longestStreak ?? 0}
        streakBonusPoints={gamification.streakBonusPoints ?? 0}
      />

      {/* Activity Cards */}
      <ActivityCardsGrid currentTierIndex={BUYER_TIERS.findIndex(t => t.id === gamification.currentTier?.id)} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2 relative overflow-hidden" onClick={() => navigate('/')}>
              <div className="absolute top-2 end-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coin/15 text-coin-foreground">
                <Coins className="w-3 h-3 text-coin" />
                <span className="text-[10px] font-bold">+{POINTS_PER_ACTION.developer_view}</span>
              </div>
              <Search className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Search Developers</span>
              <span className="text-xs text-muted-foreground text-start">Find trusted developers</span>
            </Button>
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2 relative overflow-hidden" onClick={() => navigate('/directory')}>
              <div className="absolute top-2 end-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coin/15 text-coin-foreground">
                <Coins className="w-3 h-3 text-coin" />
                <span className="text-[10px] font-bold">+{POINTS_PER_ACTION.developer_view}</span>
              </div>
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Developer Directory</span>
              <span className="text-xs text-muted-foreground text-start">Browse all developers</span>
            </Button>
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2 relative overflow-hidden" onClick={() => navigate('/buyer/saved')}>
              <div className="absolute top-2 end-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coin/15 text-coin-foreground">
                <Coins className="w-3 h-3 text-coin" />
                <span className="text-[10px] font-bold">+{POINTS_PER_ACTION.project_save}</span>
              </div>
              <Heart className="w-5 h-5 text-brand-red" />
              <span className="font-semibold text-sm">Saved Projects</span>
              <span className="text-xs text-muted-foreground text-start">View your saved items</span>
            </Button>
          </div>

          {/* Saved Projects */}
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Saved Projects</h3>
          <div className="space-y-3">
            {savedProjects.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.location} · {p.status}</p>
                  <p className="text-xs text-primary font-medium">{p.priceRange}</p>
                </div>
                <Heart className="w-4 h-4 text-brand-red fill-brand-red flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          {/* Latest Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Latest Reviews</h3>
              <button className="text-xs text-accent font-semibold hover:underline" onClick={() => navigate('/buyer/reviews')}>View All →</button>
            </div>
            <div className="space-y-3">
              {recentReviews.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      {r.avatar && <img src={r.avatar} alt={r.author} className="w-full h-full object-cover rounded-full" />}
                      <AvatarFallback className="text-[10px] bg-accent text-accent-foreground">{r.author.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{r.author}</p>
                      <p className="text-[10px] text-muted-foreground">{r.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">{r.rating}.0</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? getRatingColorClass(r.rating) : 'text-muted'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Widget */}
          <ReferralWidget />

          {/* Saved Search Alerts */}
          <SavedSearchWidget />
        </div>
      </div>
    </div>
  );
};

const BuyerReviews = () => {
  const myReviews = reviews.slice(0, 3);
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">My Reviews</h2>
      <div className="space-y-4">
        {myReviews.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">{r.project}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? getRatingColorClass(r.rating) : 'text-muted'}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{r.comment}</p>
            {r.developerReply && (
              <div className="mt-3 p-3 bg-secondary rounded-lg">
                <p className="text-xs font-semibold text-primary mb-1">↩ {r.developerReply.author}</p>
                <p className="text-xs text-muted-foreground">{r.developerReply.comment}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BuyerSaved = () => {
  const savedProjects = projects;
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Saved Projects</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedProjects.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="h-32 bg-secondary">
              {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
                <Heart className="w-4 h-4 text-brand-red fill-brand-red" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{p.location}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                p.status === 'Completed' ? 'bg-trust-excellent/10 text-trust-excellent' :
                p.status === 'Under Construction' ? 'bg-accent/20 text-accent-foreground' :
                'bg-primary/10 text-primary'
              }`}>{p.status}</span>
              <p className="text-xs text-primary font-semibold mt-2">{p.priceRange}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const KycUploadSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [selfieUrl, setSelfieUrl] = useState('');
  const [idDocUrl, setIdDocUrl] = useState('');
  const [uploading, setUploading] = useState<'selfie' | 'id' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selfieRef = useRef<HTMLInputElement>(null);
  const idDocRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'selfie' | 'id') => {
    if (!user) return;
    setUploading(type);
    const ext = file.name.split('.').pop();
    const path = `kyc/${user.id}/${type}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('review-attachments').upload(path, file);
    if (error) {
      toast.error(`Failed to upload ${type}`);
    } else {
      const { data } = supabase.storage.from('review-attachments').getPublicUrl(path);
      if (type === 'selfie') setSelfieUrl(data.publicUrl);
      else setIdDocUrl(data.publicUrl);
      toast.success(`${type === 'selfie' ? 'Selfie' : 'ID document'} uploaded`);
    }
    setUploading(null);
  };

  const handleSubmitKyc = async () => {
    if (!user || !selfieUrl || !idDocUrl) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviewer_verifications' as any).insert({
      user_id: user.id,
      verification_type: 'kyc',
      selfie_url: selfieUrl,
      id_document_url: idDocUrl,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      if (error.code === '23505') toast.error('You already have a pending KYC request');
      else toast.error('Failed to submit KYC request');
    } else {
      toast.success('KYC verification submitted! Our team will review your documents.');
      setSelfieUrl('');
      setIdDocUrl('');
    }
  };

  if ((profile as any)?.kyc_verified) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              KYC Verified
              <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-0 text-[10px]">Purple Badge</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">Your identity has been verified via selfie & national ID</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#7C3AED]" />
        KYC Verification
        <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-0 text-[10px]">Highest Trust</Badge>
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Upload a selfie and your national ID to earn the purple KYC Verified badge — the highest trust level.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Selfie Upload */}
        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
          <input ref={selfieRef} type="file" className="hidden" accept="image/*" capture="user"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'selfie')} />
          {selfieUrl ? (
            <div className="space-y-2">
              <img src={selfieUrl} alt="Selfie" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#7C3AED]/30" />
              <p className="text-xs text-[#7C3AED] font-medium">Selfie uploaded</p>
              <Button variant="outline" size="sm" onClick={() => { setSelfieUrl(''); selfieRef.current?.click(); }}>Replace</Button>
            </div>
          ) : (
            <button onClick={() => selfieRef.current?.click()} disabled={uploading === 'selfie'} className="w-full">
              {uploading === 'selfie' ? <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" /> : <Camera className="w-8 h-8 text-muted-foreground mx-auto" />}
              <p className="text-sm text-muted-foreground mt-2">{uploading === 'selfie' ? 'Uploading...' : 'Take / Upload Selfie'}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Clear face photo</p>
            </button>
          )}
        </div>

        {/* ID Document Upload */}
        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
          <input ref={idDocRef} type="file" className="hidden" accept="image/*,.pdf"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'id')} />
          {idDocUrl ? (
            <div className="space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#7C3AED] mx-auto" />
              <p className="text-xs text-[#7C3AED] font-medium">ID document uploaded</p>
              <Button variant="outline" size="sm" onClick={() => { setIdDocUrl(''); idDocRef.current?.click(); }}>Replace</Button>
            </div>
          ) : (
            <button onClick={() => idDocRef.current?.click()} disabled={uploading === 'id'} className="w-full">
              {uploading === 'id' ? <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" /> : <FileText className="w-8 h-8 text-muted-foreground mx-auto" />}
              <p className="text-sm text-muted-foreground mt-2">{uploading === 'id' ? 'Uploading...' : 'Upload National ID'}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Front of ID card</p>
            </button>
          )}
        </div>
      </div>

      <Button
        onClick={handleSubmitKyc}
        disabled={!selfieUrl || !idDocUrl || submitting}
        className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Shield className="w-4 h-4 me-2" />}
        Submit KYC Verification
      </Button>
    </div>
  );
};

const BuyerProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    buyer_type: profile?.buyer_type || '',
    budget_range: profile?.budget_range || '',
    facebook_url: profile?.facebook_url || '',
    linkedin_url: profile?.linkedin_url || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        buyer_type: profile.buyer_type || '',
        budget_range: profile.budget_range || '',
        facebook_url: profile.facebook_url || '',
        linkedin_url: profile.linkedin_url || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        buyer_type: formData.buyer_type,
        budget_range: formData.budget_range,
        facebook_url: formData.facebook_url || null,
        linkedin_url: formData.linkedin_url || null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('user_id', user.id);
    
    setSaving(false);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refreshProfile();

      // Auto-submit verification request if social link added and not yet verified
      if (!profile?.identity_verified && (formData.facebook_url || formData.linkedin_url)) {
        const socialUrl = formData.facebook_url || formData.linkedin_url;
        const { error: verErr } = await supabase
          .from('reviewer_verifications' as any)
          .insert({
            user_id: user.id,
            verification_type: 'social',
            social_url: socialUrl,
            status: 'pending',
          });
        if (!verErr) {
          toast.success('Verification request submitted! Our team will review your social profile.');
        }
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-busting param
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile photo updated!');
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Mock engagement data
  const engagementScore = 78;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Mar 2024';
  
  const activityStats = [
    { label: 'Reviews Written', value: 3, icon: Star, color: 'text-accent' },
    { label: 'Developers Viewed', value: 24, icon: Eye, color: 'text-primary' },
    { label: 'Reports Unlocked', value: 8, icon: FileText, color: 'text-trust-excellent' },
    { label: 'Saved Projects', value: 12, icon: Heart, color: 'text-brand-red' },
  ];

  const engagementCategories = [
    { label: 'Profile Completion', value: profile?.buyer_type ? 85 : 45 },
    { label: 'Review Activity', value: 60 },
    { label: 'Platform Engagement', value: 92 },
    { label: 'Verification Status', value: 100 },
  ];

  const badges = [
    { label: 'Verified Email', icon: Mail, earned: true },
    { label: 'First Review', icon: Star, earned: true },
    { label: 'Active Explorer', icon: Search, earned: true },
    { label: 'Trusted Buyer', icon: Shield, earned: false },
    { label: 'Power User', icon: Sparkles, earned: false },
  ];

  const buyerTypes = ['End User', 'Real Estate Agent', 'Investor', 'Construction Professional'];
  const budgetRanges = ['Under 1M EGP', '1-3M EGP', '3-5M EGP', '5-10M EGP', '10M+ EGP'];

  return (
    <div className="space-y-6">
      {/* Hero Profile Card */}
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/80 rounded-2xl overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 end-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 start-0 w-48 h-48 bg-accent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with edit overlay */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 backdrop-blur-sm">
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="text-3xl bg-accent text-accent-foreground font-bold">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-1 end-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-accent-foreground animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-accent-foreground" />
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-start">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {profile?.full_name || 'Anonymous User'}
                </h1>
                <BadgeCheck className="w-6 h-6 text-accent" />
              </div>
              <p className="text-white/70 text-sm mb-3">{user?.email}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/15 text-white border-0 backdrop-blur-sm">
                  <Calendar className="w-3 h-3 me-1" />
                  Member since {memberSince}
                </Badge>
                {profile?.buyer_type && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent border-0">
                    <User className="w-3 h-3 me-1" />
                    {profile.buyer_type}
                  </Badge>
                )}
              </div>

              {/* Quick stats row */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent" />
                  <strong className="text-white">3</strong> reviews
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-brand-red" />
                  <strong className="text-white">12</strong> saved
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-trust-excellent" />
                  <strong className="text-white">{engagementScore}%</strong> active
                </span>
              </div>
            </div>

            {/* Engagement Score Ring */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${engagementScore * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-white">{engagementScore}</span>
                  <span className="text-[10px] text-white/60 uppercase tracking-wide">Score</span>
                </div>
              </div>
              <span className="text-xs text-white/70 mt-2">Engagement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Badges */}
        <div className="space-y-6">
          {/* Activity Stats */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Activity Overview
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {activityStats.map((stat) => (
                <div key={stat.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                  <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Categories */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Engagement Metrics
            </h3>
            <div className="space-y-4">
              {engagementCategories.map((cat) => (
                <div key={cat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{cat.label}</span>
                    <span className={`text-sm font-semibold ${
                      cat.value >= 80 ? 'text-trust-excellent' : 
                      cat.value >= 50 ? 'text-accent' : 'text-brand-red'
                    }`}>{cat.value}%</span>
                  </div>
                  <Progress 
                    value={cat.value} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Badges & Achievements
            </h3>
            <div className="space-y-2">
              {badges.map((badge) => (
                <div 
                  key={badge.label} 
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    badge.earned 
                      ? 'bg-trust-excellent/10' 
                      : 'bg-secondary/50 opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    badge.earned ? 'bg-trust-excellent/20' : 'bg-muted'
                  }`}>
                    <badge.icon className={`w-4 h-4 ${badge.earned ? 'text-trust-excellent' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm font-medium ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {badge.label}
                  </span>
                  {badge.earned && (
                    <CheckCircle2 className="w-4 h-4 text-trust-excellent ms-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Profile Information
              </h3>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 me-1" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 me-1" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  className="w-full px-3 py-2.5 bg-secondary/50 rounded-lg text-sm text-muted-foreground border border-border cursor-not-allowed"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+20 xxx xxx xxxx"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <User className="w-3 h-3" /> Buyer Type
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
                  value={formData.buyer_type}
                  onChange={(e) => setFormData({ ...formData, buyer_type: e.target.value })}
                  disabled={!isEditing}
                >
                  <option value="">Select type...</option>
                  {buyerTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <Wallet className="w-3 h-3" /> Budget Range
                </label>
                <select
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
                  value={formData.budget_range}
                  onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  disabled={!isEditing}
                >
                  <option value="">Select budget range...</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Social Verification Links */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <ExternalLink className="w-3 h-3" /> Facebook Profile
                </label>
                <input
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
                  value={formData.facebook_url || ''}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://facebook.com/your.profile"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <ExternalLink className="w-3 h-3" /> LinkedIn Profile
                </label>
                <input
                  className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              {/* Verification Submit CTA */}
              {!profile?.identity_verified && (formData.facebook_url || formData.linkedin_url) && isEditing && (
                <div className="md:col-span-2 p-3 rounded-lg bg-[#1877F2]/5 border border-[#1877F2]/20">
                  <p className="text-xs text-muted-foreground mb-2">
                    Save your profile first, then submit for identity verification. Our team will review your social profile.
                  </p>
                </div>
              )}
              {profile?.identity_verified && (
                <div className="md:col-span-2 p-3 rounded-lg bg-trust-excellent/5 border border-trust-excellent/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-trust-excellent flex-shrink-0" />
                  <p className="text-xs text-trust-excellent font-medium">Identity Verified — Your reviews show a verification badge</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : null}
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          {/* KYC Verification Section */}
          <KycUploadSection />

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {reviews.slice(0, 3).map((r, i) => (
                <div key={r.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i === 0 ? 'bg-accent/20' : 'bg-primary/10'
                  }`}>
                    <Star className={`w-4 h-4 ${i === 0 ? 'text-accent' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {i === 0 ? 'Left a review' : i === 1 ? 'Saved a project' : 'Viewed developer'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{r.project}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r.date}</p>
                  </div>
                  {i === 0 && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'text-accent fill-accent' : 'text-muted'}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Account Security
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-trust-excellent/5 border border-trust-excellent/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-trust-excellent" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Verified</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-trust-excellent/10 text-trust-excellent border-0">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-Factor Auth</p>
                    <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (role === 'business') {
      navigate('/business');
      return;
    }

    if (role === 'admin') {
      navigate('/admin');
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user || role === 'business' || role === 'admin') return null;

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/buyer' },
    { icon: <Star className="w-4 h-4" />, label: 'My Reviews', path: '/buyer/reviews' },
    { icon: <Bookmark className="w-4 h-4" />, label: 'Search Alerts', path: '/buyer/search-alerts' },
    { icon: <Gift className="w-4 h-4" />, label: 'Invite Friends', path: '/buyer/referrals' },
    { icon: <Award className="w-4 h-4" />, label: 'Achievements', path: '/buyer/achievements' },
    { icon: <Trophy className="w-4 h-4" />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', path: '/messages' },
    { icon: <Users className="w-4 h-4" />, label: 'Community', path: '/community' },
    
    { icon: <Settings className="w-4 h-4" />, label: 'Notification Preferences', path: '/buyer/notification-preferences' },
    { icon: <User className="w-4 h-4" />, label: 'Account Details', path: '/buyer/settings' },
  ];


  return (
    <>
      <WelcomeGiftOverlay />
      <DashboardLayout
        title="Buyer Dashboard"
        breadcrumb="Buyer > Dashboard"
        sidebarProps={{ navItems, portalLabel: 'Buyer' }}
      >
      <Routes>
        <Route index element={<BuyerOverview />} />
        <Route path="reviews" element={<BuyerReviews />} />
        <Route path="saved" element={<BuyerSaved />} />
        <Route path="search-alerts" element={<SavedSearchWidget />} />
        <Route path="referrals" element={<ReferralWidget />} />
        <Route path="achievements" element={<BuyerGamificationPanel />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="notification-preferences" element={<NotificationPreferences />} />
        <Route path="settings" element={<BuyerProfile />} />
      </Routes>
      </DashboardLayout>
    </>
  );
};

export default BuyerDashboard;
