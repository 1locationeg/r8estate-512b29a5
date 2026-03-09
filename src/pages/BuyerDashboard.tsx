import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader2, LayoutDashboard, Star, Heart, Search, Settings, TrendingUp, Building2, MessageSquare, Bell, Shield, Award, CheckCircle2, Camera, Mail, Phone, User, Calendar, MapPin, Wallet, Edit3, Save, BadgeCheck, Sparkles, Activity, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { developers, reviews, projects } from '@/data/mockData';
import { getRatingColorClass } from '@/lib/ratingColors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const BuyerOverview = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const stats = [
    { icon: Building2, label: 'Developers Viewed', value: '24', bg: 'bg-primary/10', iconColor: 'text-primary' },
    { icon: Star, label: 'Reviews Written', value: '3', bg: 'bg-accent/20', iconColor: 'text-accent' },
    { icon: Heart, label: 'Saved Projects', value: '12', bg: 'bg-brand-red/10', iconColor: 'text-brand-red' },
    { icon: TrendingUp, label: 'Reports Unlocked', value: '8', bg: 'bg-trust-excellent/10', iconColor: 'text-trust-excellent' },
  ];

  const recentReviews = reviews.slice(0, 4);
  const savedProjects = projects.slice(0, 3);

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h2>
        <p className="text-muted-foreground text-sm">Continue your search for the perfect developer</p>
      </div>

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
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2" onClick={() => navigate('/')}>
              <Search className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Search Developers</span>
              <span className="text-xs text-muted-foreground text-start">Find trusted developers</span>
            </Button>
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2" onClick={() => navigate('/directory')}>
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Developer Directory</span>
              <span className="text-xs text-muted-foreground text-start">Browse all developers</span>
            </Button>
            <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-2" onClick={() => navigate('/buyer/saved')}>
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

const BuyerSettings = () => {
  const { profile } = useAuth();
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Settings</h2>
      <div className="max-w-lg space-y-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Profile Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <input className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border border-border" defaultValue={profile?.full_name || ''} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
              <input className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border border-border" defaultValue={profile?.phone_number || ''} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Budget Range</label>
              <input className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border border-border" defaultValue={profile?.budget_range || ''} />
            </div>
            <Button className="mt-2">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/buyer' },
    { icon: <Star className="w-4 h-4" />, label: 'My Reviews', path: '/buyer/reviews' },
    { icon: <Heart className="w-4 h-4" />, label: 'Saved Projects', path: '/buyer/saved' },
    { icon: <Bell className="w-4 h-4" />, label: 'Notifications', path: '/buyer/notifications' },
    { icon: <Settings className="w-4 h-4" />, label: 'Settings', path: '/buyer/settings' },
  ];

  // Lazy import to avoid circular deps
  const { NotificationsPage } = require('@/components/NotificationsPage');

  return (
    <DashboardLayout
      title="Buyer Dashboard"
      breadcrumb="Buyer > Dashboard"
      sidebarProps={{ navItems, portalLabel: 'Buyer' }}
    >
      <Routes>
        <Route index element={<BuyerOverview />} />
        <Route path="reviews" element={<BuyerReviews />} />
        <Route path="saved" element={<BuyerSaved />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<BuyerSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
