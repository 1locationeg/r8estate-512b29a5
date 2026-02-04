import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Settings, 
  LogOut, 
  Bell,
  Users,
  BarChart3,
  Edit,
  Loader2
} from 'lucide-react';

const DeveloperDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (role !== 'developer' && role !== 'admin') {
        navigate('/buyer');
      }
    }
  }, [user, role, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (role !== 'developer' && role !== 'admin')) return null;

  const stats = [
    { icon: Star, label: 'Average Rating', value: '4.7', trend: '+0.2' },
    { icon: MessageSquare, label: 'Total Reviews', value: '156', trend: '+12' },
    { icon: TrendingUp, label: 'Trust Score', value: '92.4', trend: '+1.5' },
    { icon: Users, label: 'Profile Views', value: '2.4K', trend: '+340' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
              R8
            </div>
            <span className="text-2xl font-bold text-foreground">R8ESTATE</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              Developer Portal
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.full_name || 'Developer'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <span className="text-xs text-primary mt-1 capitalize">{role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="w-4 h-4 me-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 me-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Developer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your projects, reviews, and reputation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Management</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <Building2 className="w-6 h-6 text-primary" />
              <span className="font-semibold">Projects</span>
              <span className="text-sm text-muted-foreground text-start">
                Manage your projects
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <MessageSquare className="w-6 h-6 text-primary" />
              <span className="font-semibold">Reviews</span>
              <span className="text-sm text-muted-foreground text-start">
                Respond to reviews
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <BarChart3 className="w-6 h-6 text-primary" />
              <span className="font-semibold">Analytics</span>
              <span className="text-sm text-muted-foreground text-start">
                View performance data
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <Edit className="w-6 h-6 text-primary" />
              <span className="font-semibold">Edit Profile</span>
              <span className="text-sm text-muted-foreground text-start">
                Update company info
              </span>
            </Button>
          </div>
        </div>

        {/* Recent Reviews Placeholder */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Reviews</h2>
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No new reviews</h3>
            <p className="text-muted-foreground mb-4">
              When buyers leave reviews, they'll appear here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeveloperDashboard;
