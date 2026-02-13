import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import logoIcon from '@/assets/logo-icon.png';
import { LogOut, ChevronDown } from 'lucide-react';
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
    <aside className="w-64 min-h-screen bg-primary text-primary-foreground flex flex-col fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="p-4 border-b border-primary-foreground/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logoIcon} alt="R8ESTATE" className="h-14 w-auto" />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              <span className="text-brand-red">R8</span>
              <span className="text-primary-foreground">ESTATE</span>
            </h1>
            <span className="text-[10px] text-primary-foreground/60 font-medium uppercase tracking-wider">{portalLabel}</span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-4 border-b border-primary-foreground/10">
        {companyInfo ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              {companyInfo.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{companyInfo.name}</p>
              <p className="text-[11px] text-primary-foreground/50 truncate">{companyInfo.subtitle}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-primary-foreground/40" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-accent/30">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[11px] text-primary-foreground/50 truncate">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-primary-foreground/40" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-2 border-t border-primary-foreground/10">
        {bottomAction && (
          <Button
            onClick={bottomAction.onClick}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            {bottomAction.icon}
            <span className="ms-2">{bottomAction.label}</span>
          </Button>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
