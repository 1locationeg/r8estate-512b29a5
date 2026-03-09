import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import logoIcon from '@/assets/logo-icon.png';
import { LogOut, Menu, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  navGroups?: NavGroup[];
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
  /** Optional controlled mobile drawer state (recommended) */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

const SidebarContent = ({ navItems, portalLabel, companyInfo, bottomAction, onNavigate }: DashboardSidebarProps & { onNavigate?: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="h-full flex flex-col bg-card text-foreground border-e border-border">
      {/* Brand */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('/')}
          role="button" tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNav('/')}
        >
          <img src={logoIcon} alt="R8ESTATE" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              <span className="text-brand-red">R8</span>
              <span className="text-primary">ESTATE</span>
            </h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{portalLabel}</span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
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
            <p className="text-sm font-bold text-foreground truncate max-w-full">{profile?.full_name || 'User'}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Member since{' '}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Recently'}
              <span className="inline-block ms-1 w-2 h-2 rounded-full bg-trust-excellent align-middle" />
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navGroups && navGroups.length > 0 ? (
          navGroups.map((group) => {
            const groupHasActive = group.items.some((item) => location.pathname === item.path);
            return (
              <Collapsible key={group.title} defaultOpen={groupHasActive}>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  {group.title}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleNav(item.path)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                          isActive
                            ? 'bg-brand-red/10 text-brand-red'
                            : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <span className={cn('flex-shrink-0', isActive ? 'text-brand-red' : 'text-muted-foreground')}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })
        ) : (
          navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all',
                  isActive
                    ? 'bg-brand-red/10 text-brand-red'
                    : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                )}
              >
                <span className={cn('flex-shrink-0', isActive ? 'text-brand-red' : 'text-muted-foreground')}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-2 border-t border-border safe-bottom">
        {bottomAction && (
          <Button
            onClick={() => {
              bottomAction.onClick();
              onNavigate?.();
            }}
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
    </div>
  );
};

export const DashboardSidebar = (props: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = typeof props.mobileOpen === 'boolean' && typeof props.onMobileOpenChange === 'function';
  const sheetOpen = isControlled ? props.mobileOpen : uncontrolledOpen;
  const setSheetOpen = isControlled ? props.onMobileOpenChange! : setUncontrolledOpen;

  if (isMobile) {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        {!isControlled && (
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-3 z-50 lg:hidden bg-card/80 backdrop-blur-sm shadow-sm border border-border touch-target"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
        )}
        <SheetContent side="left" className="p-0 w-[280px] safe-top safe-bottom">
          <SidebarContent {...props} onNavigate={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-64 min-h-screen fixed left-0 top-0 z-40 shadow-sm">
      <SidebarContent {...props} />
    </aside>
  );
};
