import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BusinessProfileHeader } from '@/components/BusinessProfileHeader';
import { GamificationPanel } from '@/components/GamificationPanel';
import { 
  Loader2, LayoutDashboard, Star, MessageSquare, BarChart3, 
  Building2, Users, Settings, Edit, TrendingUp, Plus, Eye, Image,
  Tag, Plug, Bell, Phone, Mail, Globe, MapPin, Calendar, Upload, FileText, Trophy
} from 'lucide-react';
import { developers, reviews, projects } from '@/data/mockData';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useGamification } from '@/hooks/useGamification';
import { getRatingColorClass } from '@/lib/ratingColors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NotificationsPage } from '@/components/NotificationsPage';

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
  const { profileCompletion, currentTier } = useGamification();

  const stats = [
    { icon: Star, label: 'Average Rating', value: myDev.rating.toFixed(1), iconBg: 'bg-accent/20', iconColor: 'text-accent' },
    { icon: Edit, label: 'Total Reviews', value: String(myDev.reviewCount), iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { icon: Eye, label: 'Total Visitors', value: '7.0K', iconBg: 'bg-trust-excellent/10', iconColor: 'text-trust-excellent' },
  ];

  return (
    <div>
      {/* Business Profile Header */}
      <BusinessProfileHeader
        company={companyData}
        profileCompletion={profileCompletion}
        tier={{ name: currentTier.name, emoji: currentTier.emoji }}
        onEditProfile={() => navigate('/developer/profile')}
        onSharePage={() => {}}
        onViewPublic={() => {}}
      />

      {/* Stats cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              <div className={`w-10 h-10 ${s.iconBg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {s.label === 'Average Rating' && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(myDev.rating) ? 'text-accent fill-accent' : 'text-muted'}`} />
                  ))}
                </div>
              )}
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Reviews Statistics Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Reviews Statistics</h3>
            <Button variant="outline" size="sm" className="text-xs gap-2">
              📅 February 2026 ▾
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reviewsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="reviews" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Reviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Latest Reviews</h3>
            <button className="text-xs text-accent font-semibold hover:underline">View All →</button>
          </div>
          <div className="space-y-3">
            {myReviews.slice(0, 6).map((r) => (
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
      </div>

      {/* Views Statistics Chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Views Statistics</h3>
          <Button variant="outline" size="sm" className="text-xs gap-2">
            📅 February 2026 ▾
          </Button>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={viewsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const DevReviews = () => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-4">Reviews Management</h2>
    <div className="space-y-4">
      {myReviews.map((r) => (
        <div key={r.id} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {r.avatar && <img src={r.avatar} alt={r.author} className="w-full h-full object-cover rounded-full" />}
                <AvatarFallback className="bg-accent text-accent-foreground text-sm">{r.author.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
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
          {r.developerReply ? (
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs font-semibold text-primary mb-1">↩ Your Reply</p>
              <p className="text-xs text-muted-foreground">{r.developerReply.comment}</p>
            </div>
          ) : (
            <Button size="sm" variant="outline"><MessageSquare className="w-3 h-3 me-1" /> Reply</Button>
          )}
        </div>
      ))}
    </div>
  </div>
);

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
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">Upload Business License</p>
            <p className="text-xs text-muted-foreground mb-3">Trade license, registration certificate, etc.</p>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Choose File
            </Button>
          </div>
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
          <Button variant="outline" onClick={() => navigate('/developer')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) navigate('/auth');
      else if (role !== 'developer' && role !== 'admin') navigate('/buyer');
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user || (role !== 'developer' && role !== 'admin')) return null;

  const subPath = location.pathname.replace('/developer', '').replace('/', '');
  const pageTitle = subPath ? subPath.charAt(0).toUpperCase() + subPath.slice(1) : 'Dashboard';

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/developer' },
    { icon: <Building2 className="w-4 h-4" />, label: 'Business Profile', path: '/developer/profile' },
    { icon: <Trophy className="w-4 h-4" />, label: 'Rewards & Badges', path: '/developer/gamification' },
    { icon: <Star className="w-4 h-4" />, label: 'Reviews', path: '/developer/reviews' },
    { icon: <Image className="w-4 h-4" />, label: 'Gallery', path: '/developer/gallery' },
    { icon: <Users className="w-4 h-4" />, label: 'Employees', path: '/developer/employees' },
    { icon: <Tag className="w-4 h-4" />, label: 'Categories', path: '/developer/categories' },
    { icon: <Plug className="w-4 h-4" />, label: 'Integration', path: '/developer/integration' },
    { icon: <Bell className="w-4 h-4" />, label: 'Notifications', path: '/developer/notifications' },
    { icon: <Settings className="w-4 h-4" />, label: 'Settings', path: '/developer/settings' },
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
          onClick: () => {},
        },
      }}
    >
      <Routes>
        <Route index element={<DevOverview />} />
        <Route path="profile" element={<DevBusinessProfile />} />
        <Route path="gamification" element={<GamificationPanel />} />
        <Route path="reviews" element={<DevReviews />} />
        <Route path="gallery" element={<DevGallery />} />
        <Route path="employees" element={<DevEmployees />} />
        <Route path="categories" element={<DevCategories />} />
        <Route path="integration" element={<DevIntegration />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<DevSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
