import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle,
  MessageSquare, Users, Building2, BarChart3, Shield, Lightbulb,
  RefreshCw, Sparkles, ArrowLeft, Clock, Zap, Star, MapPin,
  Search, Trophy, Target, Eye, Flame, Award, Layers, Lock,
  Crown, ArrowRight, ChevronRight, Gem
} from 'lucide-react';
import { toast } from 'sonner';

interface Insight {
  category: string;
  title: string;
  summary: string;
  trend: 'up' | 'down' | 'stable' | 'alert';
  metric_label: string;
  metric_value: string;
}

interface CategoryPerf {
  name: string;
  businessCount: number;
  reviewCount: number;
  avgRating: number;
}

interface TrendingCompany {
  name: string;
  totalReviews: number;
  recentReviews: number;
  weeklyReviews: number;
  avgRating: number;
  momentum: number;
}

interface Snapshot {
  totalRegisteredUsers: number;
  totalAuthenticatedReviews: number;
  recentReviews30d: number;
  recentReviews7d: number;
  totalGuestReviews: number;
  totalBusinessProfiles: number;
  parentDevelopers: number;
  childProjects: number;
  averageRating: string;
  buyerEngagement: {
    totalViewed: number;
    totalSaved: number;
    totalReports: number;
    totalVotes: number;
  };
  categoryPerformance: CategoryPerf[];
  trendingCompanies: TrendingCompany[];
}

const categoryConfigs: Record<string, Record<string, { icon: typeof MessageSquare; color: string; bg: string; gradient: string }>> = {
  admin: {
    growth: { icon: BarChart3, color: 'text-accent', bg: 'bg-accent/10', gradient: 'from-accent/20 to-accent/5' },
    risk: { icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10', gradient: 'from-destructive/20 to-destructive/5' },
    businesses: { icon: Building2, color: 'text-trust-excellent', bg: 'bg-trust-excellent/10', gradient: 'from-trust-excellent/20 to-trust-excellent/5' },
    reviews: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-primary/20 to-primary/5' },
    engagement: { icon: Users, color: 'text-accent', bg: 'bg-accent/10', gradient: 'from-accent/20 to-accent/5' },
    opportunity: { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-primary/20 to-primary/5' },
  },
  developer: {
    reviews: { icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10', gradient: 'from-accent/20 to-accent/5' },
    reputation: { icon: Star, color: 'text-accent', bg: 'bg-accent/10', gradient: 'from-accent/20 to-accent/5' },
    engagement: { icon: Eye, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-primary/20 to-primary/5' },
    projects: { icon: Building2, color: 'text-trust-excellent', bg: 'bg-trust-excellent/10', gradient: 'from-trust-excellent/20 to-trust-excellent/5' },
    opportunity: { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-primary/20 to-primary/5' },
    competition: { icon: Target, color: 'text-destructive', bg: 'bg-destructive/10', gradient: 'from-destructive/20 to-destructive/5' },
  },
  buyer: {
    market: { icon: MapPin, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-primary/20 to-primary/5' },
    reviews: { icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10', gradient: 'from-accent/20 to-accent/5' },
    deals: { icon: Trophy, color: 'text-trust-excellent', bg: 'bg-trust-excellent/10', gradient: 'from-trust-excellent/20 to-trust-excellent/5' },
    risk: { icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10', gradient: 'from-destructive/20 to-destructive/5' },
    engagement: { icon: Users, color: 'text-accent', bg: 'bg-accent/10', gradient: 'from-accent/20 to-accent/5' },
    discovery: { icon: Search, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-primary/20 to-primary/5' },
  },
};

const defaultCat = { icon: Sparkles, color: 'text-muted-foreground', bg: 'bg-secondary', gradient: 'from-secondary to-secondary/50' };

const trendConfig: Record<string, { icon: typeof TrendingUp; color: string; label: string; bgPill: string }> = {
  up: { icon: TrendingUp, color: 'text-trust-excellent', label: '↑ Rising', bgPill: 'bg-trust-excellent/10' },
  down: { icon: TrendingDown, color: 'text-destructive', label: '↓ Declining', bgPill: 'bg-destructive/10' },
  stable: { icon: Minus, color: 'text-muted-foreground', label: '— Stable', bgPill: 'bg-secondary' },
  alert: { icon: AlertTriangle, color: 'text-accent', label: '⚠ Alert', bgPill: 'bg-accent/10' },
};

const roleLabels: Record<string, { label: string; description: string; emoji: string }> = {
  admin: { label: 'Admin', description: 'Platform health, moderation & growth', emoji: '🛡️' },
  developer: { label: 'Developer', description: 'Reputation, reviews & competitive position', emoji: '🏗️' },
  buyer: { label: 'Buyer', description: 'Market trends, deals & smart decisions', emoji: '🏠' },
};

const InsightsPage = () => {
  const { user, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; cached_at: string; expires_in_minutes: number } | null>(null);
  const [insightRole, setInsightRole] = useState<string>('buyer');
  const [activeTab, setActiveTab] = useState<'insights' | 'categories' | 'trending'>('insights');

  const effectiveRole = role === 'admin' ? 'admin' : role === 'developer' ? 'developer' : 'buyer';

  const fetchInsights = async (forceRefresh = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('platform-insights', {
        body: { forceRefresh, role: effectiveRole },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        setInsights(data.insights || []);
        setSnapshot(data.snapshot || null);
        setInsightRole(data.role || effectiveRole);
        setCacheInfo({
          cached: data.cached ?? false,
          cached_at: data.cached_at ?? '',
          expires_in_minutes: data.expires_in_minutes ?? 0,
        });
        setHasLoaded(true);
        if (data.cached) {
          toast.info('Showing cached insights');
        } else {
          toast.success('Fresh insights generated');
        }
      }
    } catch (err: any) {
      console.error('Insights error:', err);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !hasLoaded) fetchInsights();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { key: 'insights' as const, label: 'AI Insights', icon: Sparkles },
    { key: 'categories' as const, label: 'Categories', icon: Layers },
    { key: 'trending' as const, label: 'Trending', icon: Flame },
  ];

  const maxCatReviews = Math.max(...(snapshot?.categoryPerformance?.map(c => c.reviewCount) || [1]));
  const maxMomentum = Math.max(...(snapshot?.trendingCompanies?.map(c => c.momentum) || [1]));

  const getRatingColor = (r: number) => r >= 4 ? 'text-trust-excellent' : r >= 3 ? 'text-accent' : 'text-destructive';
  const getRatingBg = (r: number) => r >= 4 ? 'bg-trust-excellent' : r >= 3 ? 'bg-accent' : 'bg-destructive';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with gradient accent */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              AI Insights
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {roleLabels[effectiveRole]?.emoji} {roleLabels[effectiveRole]?.description || 'Real-time platform intelligence'}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchInsights(false)}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Cache Banner */}
        {cacheInfo && hasLoaded && (
          <div className={`flex items-center justify-between p-3 rounded-xl border ${
            cacheInfo.cached ? 'bg-secondary/50 border-border' : 'bg-gradient-to-r from-trust-excellent/5 to-primary/5 border-trust-excellent/20'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              {cacheInfo.cached ? (
                <><Clock className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">Cached · Refreshes in {cacheInfo.expires_in_minutes}m</span></>
              ) : (
                <><Zap className="w-3.5 h-3.5 text-trust-excellent" /><span className="text-trust-excellent font-medium">Fresh insights · Just generated</span></>
              )}
            </div>
            {cacheInfo.cached && (
              <Button size="sm" variant="ghost" onClick={() => fetchInsights(true)} disabled={loading} className="text-[10px] h-7 gap-1 text-primary">
                <Zap className="w-3 h-3" /> Force Refresh
              </Button>
            )}
          </div>
        )}

        {/* ====== PLATFORM STATS — Gradient KPI Cards ====== */}
        {snapshot && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Platform Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Reviews', value: snapshot.totalAuthenticatedReviews + snapshot.totalGuestReviews, icon: MessageSquare, sub: `${snapshot.recentReviews30d} this month`, gradient: 'from-primary/15 via-primary/5 to-transparent', accent: 'text-primary', badge: snapshot.recentReviews7d > 0 ? `+${snapshot.recentReviews7d} this week` : null },
                { label: 'Avg Rating', value: snapshot.averageRating, icon: Star, sub: `from ${snapshot.totalAuthenticatedReviews} verified`, gradient: 'from-accent/15 via-accent/5 to-transparent', accent: 'text-accent', badge: null },
                { label: 'Businesses', value: snapshot.totalBusinessProfiles, icon: Building2, sub: `${snapshot.parentDevelopers} devs · ${snapshot.childProjects} projects`, gradient: 'from-trust-excellent/15 via-trust-excellent/5 to-transparent', accent: 'text-trust-excellent', badge: null },
                { label: 'Active Users', value: snapshot.totalRegisteredUsers, icon: Users, sub: `${snapshot.buyerEngagement.totalViewed} profiles viewed`, gradient: 'from-primary/15 via-primary/5 to-transparent', accent: 'text-primary', badge: null },
              ].map(s => (
                <div key={s.label} className={`relative overflow-hidden bg-gradient-to-br ${s.gradient} border border-border rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}>
                  {/* Decorative ring */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`w-5 h-5 ${s.accent}`} />
                    {s.badge && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-trust-excellent/15 text-trust-excellent font-semibold animate-pulse">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-extrabold text-foreground tracking-tight">{s.value}</p>
                  <p className="text-[11px] font-semibold text-foreground/80 mt-0.5">{s.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Engagement Ring Stats */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { label: 'Viewed', value: snapshot.buyerEngagement.totalViewed, icon: Eye, pct: 100 },
                { label: 'Saved', value: snapshot.buyerEngagement.totalSaved, icon: Trophy, pct: snapshot.buyerEngagement.totalViewed > 0 ? Math.round((snapshot.buyerEngagement.totalSaved / snapshot.buyerEngagement.totalViewed) * 100) : 0 },
                { label: 'Reports', value: snapshot.buyerEngagement.totalReports, icon: BarChart3, pct: snapshot.buyerEngagement.totalViewed > 0 ? Math.round((snapshot.buyerEngagement.totalReports / snapshot.buyerEngagement.totalViewed) * 100) : 0 },
                { label: 'Votes', value: snapshot.buyerEngagement.totalVotes, icon: Award, pct: snapshot.buyerEngagement.totalViewed > 0 ? Math.round((snapshot.buyerEngagement.totalVotes / snapshot.buyerEngagement.totalViewed) * 100) : 0 },
              ].map(e => (
                <div key={e.label} className="bg-card border border-border rounded-xl p-2.5 text-center group hover:border-primary/30 transition-colors">
                  <e.icon className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-bold text-foreground">{e.value}</p>
                  <div className="mx-auto mt-1 mb-0.5">
                    <Progress value={e.pct} className="h-1 [&>div]:bg-primary" />
                  </div>
                  <p className="text-[8px] text-muted-foreground">{e.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab switcher — pill style */}
        <div className="flex gap-1 bg-secondary/50 rounded-2xl p-1 border border-border/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && !hasLoaded && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground">Analyzing platform data with AI...</p>
          </div>
        )}

        {/* ===== TAB: AI Insights — Gradient Cards ===== */}
        {activeTab === 'insights' && insights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {roleLabels[insightRole]?.emoji} {roleLabels[insightRole]?.label || 'AI'} Insights
                </h2>
                <p className="text-[10px] text-muted-foreground">{roleLabels[insightRole]?.description}</p>
              </div>
              <span className="text-[9px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                {insights.length} insights
              </span>
            </div>

            {insights.map((insight, i) => {
              const roleCats = categoryConfigs[insightRole] || categoryConfigs.buyer;
              const cat = roleCats[insight.category] || defaultCat;
              const trend = trendConfig[insight.trend] || trendConfig.stable;
              const CatIcon = cat.icon;
              const isPremium = i >= 4;

              return (
                <div
                  key={i}
                  className={`relative overflow-hidden bg-gradient-to-br ${cat.gradient} border border-border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group ${
                    isPremium ? 'opacity-60' : ''
                  }`}
                >
                  {/* Glow accent line */}
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${cat.bg.replace('/10', '')}`} style={{ background: `hsl(var(--primary))` }} />

                  {isPremium && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                      <div className="text-center px-4">
                        <Lock className="w-5 h-5 text-primary mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-foreground">Premium Insight</p>
                        <p className="text-[10px] text-muted-foreground">Upgrade to unlock all insights</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.gradient} border border-border/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <CatIcon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-foreground truncate">{insight.title}</h3>
                        <span className={`flex items-center gap-1 shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${trend.bgPill} ${trend.color}`}>
                          {trend.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{insight.summary}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-card/80 border border-border/50 rounded-lg px-2.5 py-1.5">
                          <span className="text-[9px] text-muted-foreground font-medium">{insight.metric_label}</span>
                          <span className="text-sm font-extrabold text-foreground">{insight.metric_value}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Upgrade CTA */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-5">
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-accent/10 blur-xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Crown className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground">Unlock Premium Insights</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Get deeper market intelligence, competitor analysis, and predictive trends</p>
                </div>
                <Button size="sm" className="shrink-0 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 gap-1.5">
                  <Gem className="w-3.5 h-3.5" />
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: Category Performance ===== */}
        {activeTab === 'categories' && snapshot && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Category Performance
                </h2>
                <p className="text-[10px] text-muted-foreground">How each specialty is performing</p>
              </div>
            </div>

            {snapshot.categoryPerformance && snapshot.categoryPerformance.length > 0 ? (
              <div className="space-y-2.5">
                {snapshot.categoryPerformance.map((cat, i) => {
                  const pct = (cat.reviewCount / maxCatReviews) * 100;
                  const isTop = i === 0;
                  return (
                    <div key={cat.name} className={`relative overflow-hidden border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg group ${
                      isTop ? 'bg-gradient-to-br from-accent/10 via-card to-card border-accent/30' : 'bg-card border-border hover:border-primary/20'
                    }`}>
                      {isTop && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> #1
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isTop ? 'bg-gradient-to-br from-accent to-accent/70 text-primary-foreground' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-foreground capitalize">{cat.name}</h3>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {cat.businessCount}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {cat.reviewCount} reviews</span>
                          </div>
                        </div>
                        {cat.avgRating > 0 && (
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${getRatingBg(cat.avgRating)}/10`}>
                            <Star className={`w-3.5 h-3.5 fill-current ${getRatingColor(cat.avgRating)}`} />
                            <span className={`text-sm font-bold ${getRatingColor(cat.avgRating)}`}>{cat.avgRating}</span>
                          </div>
                        )}
                      </div>
                      {/* Review volume bar */}
                      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/70">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isTop ? 'bg-gradient-to-r from-accent to-accent/70' : 'bg-gradient-to-r from-primary to-primary/60'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[9px] text-muted-foreground">{Math.round(pct)}% of top volume</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Layers className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No category data available yet</p>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: Trending Companies ===== */}
        {activeTab === 'trending' && snapshot && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-destructive" /> Trending Companies
                </h2>
                <p className="text-[10px] text-muted-foreground">Companies with the most review momentum</p>
              </div>
            </div>

            {snapshot.trendingCompanies && snapshot.trendingCompanies.length > 0 ? (
              <div className="space-y-2.5">
                {snapshot.trendingCompanies.map((company, i) => {
                  const momPct = (company.momentum / maxMomentum) * 100;
                  const isTop3 = i < 3;
                  const medalColors = ['from-accent to-accent/60', 'from-primary to-primary/60', 'from-trust-good to-trust-good/60'];
                  return (
                    <div key={company.name} className={`relative overflow-hidden border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg group ${
                      i === 0 ? 'bg-gradient-to-br from-accent/10 via-card to-card border-accent/30' : 'bg-card border-border hover:border-primary/20'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isTop3 ? `bg-gradient-to-br ${medalColors[i]} shadow-md` : 'bg-secondary'
                        }`}>
                          {isTop3 ? (
                            <span className="text-lg font-extrabold text-primary-foreground">{i + 1}</span>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="text-sm font-bold text-foreground truncate">{company.name}</h3>
                            {company.avgRating > 0 && (
                              <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${getRatingBg(company.avgRating)}/10 shrink-0`}>
                                <Star className={`w-3 h-3 fill-current ${getRatingColor(company.avgRating)}`} />
                                <span className={`text-xs font-bold ${getRatingColor(company.avgRating)}`}>{company.avgRating}</span>
                              </div>
                            )}
                          </div>
                          {/* Momentum bar */}
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/70 mb-2">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                i === 0 ? 'bg-gradient-to-r from-accent to-accent/60' : 'bg-gradient-to-r from-primary to-primary/50'
                              }`}
                              style={{ width: `${momPct}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> {company.totalReviews} total
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-trust-excellent" /> {company.recentReviews} /mo
                            </span>
                            {company.weeklyReviews > 0 && (
                              <span className="flex items-center gap-1 text-trust-excellent font-semibold bg-trust-excellent/10 px-1.5 py-0.5 rounded-full">
                                <Flame className="w-3 h-3" /> {company.weeklyReviews}/wk
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors mt-3" />
                      </div>
                    </div>
                  );
                })}

                {/* Pro CTA at bottom of trending */}
                <div className="rounded-2xl border border-dashed border-primary/30 p-4 flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Want your company here?</p>
                    <p className="text-[10px] text-muted-foreground">Boost visibility with verified reviews and engagement</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Flame className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No trending data available yet</p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {activeTab === 'insights' && !loading && hasLoaded && insights.length === 0 && (
          <div className="bg-gradient-to-br from-primary/5 to-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-1">No Insights Available</h3>
            <p className="text-sm text-muted-foreground mb-4">Try refreshing to generate fresh insights.</p>
            <Button onClick={() => fetchInsights(false)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20">
              <RefreshCw className="w-4 h-4 me-1" /> Generate Insights
            </Button>
          </div>
        )}

        {/* Business Hierarchy — Visual */}
        {snapshot && (snapshot.parentDevelopers > 0 || snapshot.childProjects > 0) && (
          <div className="bg-gradient-to-br from-card to-secondary/30 border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Business Hierarchy
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Parent Developers', value: snapshot.parentDevelopers, icon: Building2, color: 'text-primary' },
                { label: 'Child Projects', value: snapshot.childProjects, icon: Layers, color: 'text-accent' },
                { label: 'Total Profiles', value: snapshot.totalBusinessProfiles, icon: Users, color: 'text-trust-excellent' },
              ].map(h => (
                <div key={h.label} className="text-center p-3 rounded-xl bg-card/60 border border-border/50">
                  <h.icon className={`w-4 h-4 ${h.color} mx-auto mb-1.5`} />
                  <p className="text-xl font-extrabold text-foreground">{h.value}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{h.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
