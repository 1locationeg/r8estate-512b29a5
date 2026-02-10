import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Loader2, LayoutDashboard, Star, MessageSquare, BarChart3, 
  Building2, Users, Settings, Edit, TrendingUp, Plus, Eye, Image
} from 'lucide-react';
import { developers, reviews, projects } from '@/data/mockData';
import { getRatingColorClass } from '@/lib/ratingColors';

// Use first developer as "my business"
const myDev = developers[0];
const myReviews = reviews.filter(r => r.developerId === myDev.id);
const myProjects = projects.filter(p => p.developerId === myDev.id);

const DevOverview = () => {
  const stats = [
    { icon: Star, label: 'Average Rating', value: myDev.rating.toFixed(1), iconBg: 'bg-accent/20', iconColor: 'text-accent' },
    { icon: MessageSquare, label: 'Total Reviews', value: String(myDev.reviewCount), iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { icon: Eye, label: 'Total Visitors', value: '7.0K', iconBg: 'bg-trust-excellent/10', iconColor: 'text-trust-excellent' },
  ];

  return (
    <div>
      {/* Stats cards like reference */}
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
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(myDev.rating) ? getRatingColorClass(myDev.rating) : 'text-muted'}`} />
                  ))}
                </div>
              )}
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Reviews Statistics Chart Placeholder */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Reviews Statistics</h3>
            <Button variant="outline" size="sm" className="text-xs">
              February 2026 ▾
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Reviews chart coming soon</p>
              <p className="text-xs text-muted-foreground/60">Monthly review statistics will appear here</p>
            </div>
          </div>
        </div>

        {/* Latest Reviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Latest Reviews</h3>
            <button className="text-xs text-accent font-semibold hover:underline">View All →</button>
          </div>
          <div className="space-y-3">
            {myReviews.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {r.avatar && <img src={r.avatar} alt={r.author} className="w-full h-full object-cover rounded-full" />}
                    <AvatarFallback className="text-[10px] bg-accent text-accent-foreground">
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
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? getRatingColorClass(r.rating) : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

const DevProjects = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-foreground">My Projects</h2>
      <Button><Plus className="w-4 h-4 me-1" /> Add Project</Button>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {myProjects.map((p) => (
        <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="h-32 bg-secondary">
            {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground text-sm mb-1">{p.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{p.location}</p>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                p.status === 'Completed' ? 'bg-trust-excellent/10 text-trust-excellent' :
                p.status === 'Under Construction' ? 'bg-accent/20 text-accent-foreground' :
                'bg-primary/10 text-primary'
              }`}>{p.status}</span>
              <Button size="sm" variant="ghost"><Edit className="w-3 h-3" /></Button>
            </div>
          </div>
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

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) navigate('/auth');
      else if (role !== 'developer' && role !== 'admin') navigate('/buyer');
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user || (role !== 'developer' && role !== 'admin')) return null;

  const navItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/developer' },
    { icon: <Star className="w-4 h-4" />, label: 'Reviews', path: '/developer/reviews' },
    { icon: <Building2 className="w-4 h-4" />, label: 'Projects', path: '/developer/projects' },
    { icon: <Image className="w-4 h-4" />, label: 'Gallery', path: '/developer/gallery' },
    { icon: <Users className="w-4 h-4" />, label: 'Employees', path: '/developer/employees' },
    { icon: <Settings className="w-4 h-4" />, label: 'Settings', path: '/developer/settings' },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      breadcrumb="Business > Dashboard"
      sidebarProps={{
        navItems,
        portalLabel: 'Business',
        bottomAction: {
          icon: <Plus className="w-4 h-4" />,
          label: 'Add Business',
          onClick: () => {},
        },
      }}
    >
      <Routes>
        <Route index element={<DevOverview />} />
        <Route path="reviews" element={<DevReviews />} />
        <Route path="projects" element={<DevProjects />} />
        <Route path="gallery" element={<DevGallery />} />
        <Route path="employees" element={<DevEmployees />} />
        <Route path="settings" element={<DevSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
