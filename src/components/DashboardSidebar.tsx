import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import logoIcon from '@/assets/logo-icon.png';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  portalLabel: string;
  portalColor?: string;
  companyInfo?: {
    name: string;
    subtitle: string;
  };
  bottomAction?: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  };
}

export const DashboardSidebar = ({ navItems, portalLabel, portalColor = 'bg-primary', companyInfo, bottomAction }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="w-64 min-h-screen bg-card text-foreground flex flex-col fixed left-0 top-0 z-40 border-e border-border shadow-sm">
      {/* Brand */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logoIcon} alt="R8ESTATE" className="h-12 w-auto" />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              <span className="text-brand-red">R8</span>
              <span className="text-primary">ESTATE</span>
            </h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{portalLabel}</span>
          </div>
        </div>
      </div>

      {/* Profile Card - Centered like reference */}
      <div className="px-4 py-5 border-b border-border">
        {companyInfo ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              {companyInfo.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{companyInfo.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{companyInfo.subtitle}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 ring-3 ring-brand-red/20 mb-2">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-bold text-foreground">{profile?.full_name || 'User'}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
              <span className="inline-block ms-1 w-2 h-2 rounded-full bg-trust-excellent align-middle" />
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-red/10 text-brand-red'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              )}
            >
              <span className={cn(
                'flex-shrink-0',
                isActive ? 'text-brand-red' : 'text-muted-foreground'
              )}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-2 border-t border-border">
        {bottomAction && (
          <Button
            onClick={bottomAction.onClick}
            className="w-full bg-brand-red text-white hover:bg-brand-red/90 font-semibold"
          >
            {bottomAction.icon}
            <span className="ms-2">{bottomAction.label}</span>
          </Button>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
