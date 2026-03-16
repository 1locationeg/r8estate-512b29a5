import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle,
  MessageSquare, Users, Building2, BarChart3, Shield, Lightbulb,
  RefreshCw, Sparkles, ArrowLeft, Clock, Zap, Star, MapPin,
  Search, Trophy, Target, Eye
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

interface Snapshot {
  totalRegisteredUsers: number;
  totalAuthenticatedReviews: number;
  recentReviews30d: number;
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
}

// Role-specific category configs
const categoryConfigs: Record<string, Record<string, { icon: typeof MessageSquare; color: string; bg: string }>> = {
  admin: {
    growth: { icon: BarChart3, color: 'text-accent', bg: 'bg-accent/10' },
    risk: { icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' },
    businesses: { icon: Building2, color: 'text-trust-excellent', bg: 'bg-trust-excellent/10' },
    reviews: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
    engagement: { icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
    opportunity: { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10' },
  },
  developer: {
    reviews: { icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10' },
    reputation: { icon: Star, color: 'text-accent', bg: 'bg-accent/10' },
    engagement: { icon: Eye, color: 'text-primary', bg: 'bg-primary/10' },
    projects: { icon: Building2, color: 'text-trust-excellent', bg: 'bg-trust-excellent/10' },
    opportunity: { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10' },
    competition: { icon: Target, color: 'text-destructive', bg: 'bg-destructive/10' },
  },
  buyer: {
    market: { icon: MapPin, color: 'text-primary', bg: 'bg-primary/10' },
    reviews: { icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10' },
    deals: { icon: Trophy, color: 'text-trust-excellent', bg: 'bg-trust-excellent/10' },
    risk: { icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' },
    engagement: { icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
    discovery: { icon: Search, color: 'text-primary', bg: 'bg-primary/10' },
  },
};

const defaultCat = { icon: Sparkles, color: 'text-muted-foreground', bg: 'bg-secondary' };

const trendConfig: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  up: { icon: TrendingUp, color: 'text-trust-excellent', label: 'Trending Up' },
  down: { icon: TrendingDown, color: 'text-destructive', label: 'Declining' },
  stable: { icon: Minus, color: 'text-muted-foreground', label: 'Stable' },
  alert: { icon: AlertTriangle, color: 'text-accent', label: 'Needs Attention' },
};

const roleLabels: Record<string, { label: string; description: string }> = {
  admin: { label: 'Admin', description: 'Platform health, moderation & growth' },
  developer: { label: 'Developer', description: 'Reputation, reviews & competitive position' },
  buyer: { label: 'Buyer', description: 'Market trends, deals & smart decisions' },
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
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !hasLoaded) {
      fetchInsights();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Insights
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {roleLabels[effectiveRole]?.description || 'Real-time platform intelligence'}
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
        {/* Cache Status Banner */}
        {cacheInfo && hasLoaded && (
          <div className={`flex items-center justify-between p-3 rounded-xl border ${
            cacheInfo.cached ? 'bg-secondary/50 border-border' : 'bg-trust-excellent/5 border-trust-excellent/20'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              {cacheInfo.cached ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Cached · Refreshes in {cacheInfo.expires_in_minutes}m
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-trust-excellent" />
                  <span className="text-trust-excellent font-medium">Fresh insights · Just generated</span>
                </>
              )}
            </div>
            {cacheInfo.cached && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fetchInsights(true)}
                disabled={loading}
                className="text-[10px] h-7 gap-1 text-primary"
              >
                <Zap className="w-3 h-3" />
                Force Refresh
              </Button>
            )}
          </div>
        )}

        {/* Snapshot Stats */}
        {snapshot && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Reviews', value: snapshot.totalAuthenticatedReviews + snapshot.totalGuestReviews, icon: MessageSquare },
              { label: 'Avg Rating', value: snapshot.averageRating, icon: BarChart3 },
              { label: 'Businesses', value: snapshot.totalBusinessProfiles, icon: Building2 },
              { label: 'Users', value: snapshot.totalRegisteredUsers, icon: Users },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && !hasLoaded && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing platform data with AI...</p>
            </div>
          </div>
        )}

        {/* Insights Cards */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {roleLabels[insightRole]?.label || 'AI'} Insights
            </h2>
            <p className="text-xs text-muted-foreground -mt-2">{roleLabels[insightRole]?.description}</p>
            {insights.map((insight, i) => {
              const roleCats = categoryConfigs[insightRole] || categoryConfigs.buyer;
              const cat = roleCats[insight.category] || defaultCat;
              const trend = trendConfig[insight.trend] || trendConfig.stable;
              const CatIcon = cat.icon;
              const TrendIcon = trend.icon;

              return (
                <div key={i} className="bg-card border border-border rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                      <CatIcon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground truncate">{insight.title}</h3>
                        <div className={`flex items-center gap-1 shrink-0 ${trend.color}`}>
                          <TrendIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-medium">{trend.label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{insight.summary}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                          {insight.metric_label}
                        </span>
                        <span className="text-sm font-bold text-foreground">{insight.metric_value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && hasLoaded && insights.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No Insights Available</h3>
            <p className="text-sm text-muted-foreground mb-4">Try refreshing to generate fresh insights.</p>
            <Button onClick={() => fetchInsights(false)}>
              <RefreshCw className="w-4 h-4 me-1" /> Generate Insights
            </Button>
          </div>
        )}

        {/* Hierarchy info */}
        {snapshot && (snapshot.parentDevelopers > 0 || snapshot.childProjects > 0) && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Business Hierarchy
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{snapshot.parentDevelopers}</p>
                <p className="text-[10px] text-muted-foreground">Parent Developers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{snapshot.childProjects}</p>
                <p className="text-[10px] text-muted-foreground">Child Projects</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{snapshot.totalBusinessProfiles}</p>
                <p className="text-[10px] text-muted-foreground">Total Profiles</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
