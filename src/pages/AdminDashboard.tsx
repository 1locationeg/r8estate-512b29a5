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
  Users, 
  Building2, 
  MessageSquare, 
  Shield,
  Settings, 
  LogOut, 
  Bell,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (role !== 'admin') {
        // Redirect non-admins based on their role
        if (role === 'developer') {
          navigate('/developer');
        } else {
          navigate('/buyer');
        }
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

  if (!user || role !== 'admin') return null;

  const stats = [
    { icon: Users, label: 'Total Users', value: '12,847', status: 'success' },
    { icon: Building2, label: 'Verified Developers', value: '156', status: 'success' },
    { icon: MessageSquare, label: 'Pending Reviews', value: '23', status: 'warning' },
    { icon: AlertTriangle, label: 'Flagged Content', value: '5', status: 'error' },
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
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
              Admin
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 end-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-destructive/20 hover:ring-destructive/40 transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Admin'} />
                  <AvatarFallback className="bg-destructive text-destructive-foreground">
                    {profile?.full_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.full_name || 'Admin'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <span className="text-xs text-destructive mt-1 capitalize flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Administrator
                    </span>
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
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, developers, reviews, and platform settings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.status === 'success' ? 'bg-green-100 text-green-600' :
                  stat.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {stat.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {stat.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Administration</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <Users className="w-6 h-6 text-primary" />
              <span className="font-semibold">User Management</span>
              <span className="text-sm text-muted-foreground text-start">
                View, suspend, or ban users
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <Building2 className="w-6 h-6 text-primary" />
              <span className="font-semibold">Developer Verification</span>
              <span className="text-sm text-muted-foreground text-start">
                Approve & verify developers
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <MessageSquare className="w-6 h-6 text-primary" />
              <span className="font-semibold">Review Moderation</span>
              <span className="text-sm text-muted-foreground text-start">
                Moderate flagged reviews
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2"
            >
              <BarChart3 className="w-6 h-6 text-primary" />
              <span className="font-semibold">Platform Analytics</span>
              <span className="text-sm text-muted-foreground text-start">
                View platform statistics
              </span>
            </Button>
          </div>
        </div>

        {/* Pending Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Pending Actions</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">23 reviews pending moderation</p>
                  <p className="text-sm text-muted-foreground">Flagged by users or system</p>
                </div>
              </div>
              <Button size="sm">Review</Button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">7 developers awaiting verification</p>
                  <p className="text-sm text-muted-foreground">New registration requests</p>
                </div>
              </div>
              <Button size="sm">Verify</Button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">5 flagged content items</p>
                  <p className="text-sm text-muted-foreground">Reported for policy violations</p>
                </div>
              </div>
              <Button size="sm" variant="destructive">Review</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
