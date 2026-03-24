import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader2, LayoutDashboard, Star, Heart, Search, Settings, TrendingUp, Building2, MessageSquare, Bell, Shield, Award, CheckCircle2, Camera, Mail, Phone, User, Calendar, MapPin, Wallet, Edit3, Save, BadgeCheck, Sparkles, Activity, Eye, FileText, Users, Trophy, Gift, Bookmark, Coins } from 'lucide-react';
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

const BuyerOverview = () => {
  const navigate = useNavigate();
  const { profile, role, refreshProfile } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const stats = [
    { icon: Building2, label: 'Developers Viewed', value: '24', bg: 'bg-primary/10', iconColor: 'text-primary' },
    { icon: Star, label: 'Reviews Written', value: '3', bg: 'bg-accent/20', iconColor: 'text-accent' },
    { icon: Heart, label: 'Saved Projects', value: '12', bg: 'bg-brand-red/10', iconColor: 'text-brand-red' },
    { icon: TrendingUp, label: 'Reports Unlocked', value: '8', bg: 'bg-trust-excellent/10', iconColor: 'text-trust-excellent' },
  ];

  const recentReviews = reviews.slice(0, 4);
  const savedProjects = projects.slice(0, 3);

  const handleUpgradeToBusiness = async () => {
    setIsUpgrading(true);
    try {
      const { error } = await supabase.rpc('set_my_account_type', { _account_type: 'business' });
      if (error) throw error;
      await refreshProfile();
      toast.success('Account upgraded to Business! Redirecting to your business dashboard...');
      setTimeout(() => navigate('/business'), 1000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upgrade account. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h2>
        <p className="text-muted-foreground text-sm">Continue your search for the perfect developer</p>
      </div>

      {/* Onboarding Wizard */}
      <div className="mb-6">
        <OnboardingWizard />
      </div>

      {/* Register Your Business CTA - only for non-developer users */}
      {role !== 'business' && role !== 'admin' && (
      <div className="mb-8 relative overflow-hidden rounded-2xl border border-business-border/30 bg-business">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-business-border rounded-full blur-3xl" />
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
            onClick={handleUpgradeToBusiness}
            disabled={isUpgrading}
            className="flex-shrink-0 gap-2 bg-business-border text-white hover:bg-business-border/90"
          >
            {isUpgrading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
            {isUpgrading ? 'Upgrading...' : 'Upgrade to Business'}
          </Button>
        </div>
      </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2 relative overflow-hidden" onClick={() => navigate('/')}>
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coin/15 text-coin-foreground">
                <Coins className="w-3 h-3 text-coin" />
                <span className="text-[10px] font-bold">+{POINTS_PER_ACTION.developer_view}</span>
              </div>
              <Search className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Search Developers</span>
              <span className="text-xs text-muted-foreground text-start">Find trusted developers</span>
            </Button>
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2 relative overflow-hidden" onClick={() => navigate('/directory')}>
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coin/15 text-coin-foreground">
                <Coins className="w-3 h-3 text-coin" />
                <span className="text-[10px] font-bold">+{POINTS_PER_ACTION.developer_view}</span>
              </div>
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Developer Directory</span>
              <span className="text-xs text-muted-foreground text-start">Browse all developers</span>
            </Button>
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2 relative overflow-hidden" onClick={() => navigate('/buyer/saved')}>
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coin/15 text-coin-foreground">
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
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        buyer_type: profile.buyer_type || '',
        budget_range: profile.budget_range || '',
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
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    
    setSaving(false);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refreshProfile();
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
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
                className="absolute bottom-1 right-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
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
    { icon: <Building2 className="w-4 h-4" />, label: 'Products I Use', path: '/buyer/saved' },
    { icon: <Search className="w-4 h-4" />, label: 'Research Board', path: '/directory' },
    { icon: <Star className="w-4 h-4" />, label: 'My Reviews', path: '/buyer/reviews' },
    { icon: <Bookmark className="w-4 h-4" />, label: 'Search Alerts', path: '/buyer/search-alerts' },
    { icon: <Gift className="w-4 h-4" />, label: 'Invite Friends', path: '/buyer/referrals' },
    { icon: <Award className="w-4 h-4" />, label: 'Achievements', path: '/buyer/achievements' },
    { icon: <Users className="w-4 h-4" />, label: 'Community', path: '/community' },
    { icon: <Trophy className="w-4 h-4" />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Bell className="w-4 h-4" />, label: 'Notifications', path: '/buyer/notifications' },
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
