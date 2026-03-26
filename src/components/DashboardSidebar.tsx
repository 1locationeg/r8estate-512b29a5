import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MiniLeaderboard } from '@/components/MiniLeaderboard';
import { BrandLogo } from '@/components/BrandLogo';
import { useBuyerGamification } from '@/hooks/useBuyerGamification';
import { LogOut, ChevronDown, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  navItems: NavItem[] | NavGroup[];
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
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  showMiniLeaderboard?: boolean;
}

function isNavGroups(items: NavItem[] | NavGroup[]): items is NavGroup[] {
  return items.length > 0 && 'items' in items[0];
}

const SidebarContent = ({ navItems, portalLabel, companyInfo, bottomAction, onNavigate, showMiniLeaderboard = true }: DashboardSidebarProps & { onNavigate?: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const gamification = useBuyerGamification();
  const isBuyerPortal = portalLabel === 'Buyer';

  const grouped = isNavGroups(navItems);

  const getInitialOpen = () => {
    if (!grouped) return {};
    const map: Record<string, boolean> = {};
    (navItems as NavGroup[]).forEach((g) => {
      map[g.label] = g.items.some((i) => location.pathname === i.path);
    });
    return map;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpen);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const renderNavButton = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.label}
        onClick={() => handleNav(item.path)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
          isActive
            ? 'bg-primary/10 text-primary border-s-2 border-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground border-s-2 border-transparent'
        )}
      >
        <span className={cn('flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}>
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white text-foreground">
      {/* Brand */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('/')}
          role="button" tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNav('/')}
        >
          <BrandLogo size="hero" subtitle={portalLabel} />
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 py-5 border-b border-border">
        {companyInfo ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {companyInfo.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{companyInfo.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{companyInfo.subtitle}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            {/* Avatar with tier badge + online dot */}
            <div className="relative mb-3">
              <Avatar className="h-[72px] w-[72px] ring-[3px] ring-primary/20 shadow-[0_4px_16px_rgba(13,122,107,0.15)]">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Tier badge — top-start */}
              {isBuyerPortal && !gamification.isLoading && (
                <span className="absolute -top-0.5 -start-0.5 w-[22px] h-[22px] rounded-full bg-coin border-[2.5px] border-white flex items-center justify-center text-[10px]">
                  {gamification.currentTier.emoji}
                </span>
              )}
              {/* Online dot — bottom-end */}
              <span className="absolute bottom-0.5 end-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-[2.5px] border-white" />
            </div>
            <p className="text-[17px] font-bold text-foreground tracking-tight truncate max-w-full">{profile?.full_name || 'User'}</p>
            <p className="text-[11.5px] text-primary font-semibold mt-0.5 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              {t("dashboard.memberSince", "Member since")}{' '}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : t("dashboard.recently", "Recently")}
            </p>

            {/* Coins + tier card */}
            {isBuyerPortal && user && !gamification.isLoading && (
              <div className="w-full mt-3.5">
                <button
                  onClick={() => navigate('/buyer/achievements')}
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 flex items-center gap-3 hover:bg-muted transition-all cursor-pointer text-start"
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-coin/15 border-[1.5px] border-coin/25 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-[22px] h-[22px] text-coin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[22px] font-bold text-foreground leading-none">{gamification.totalPoints}</span>
                      <span className="text-xs text-muted-foreground">points</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        {gamification.currentTier.emoji} {gamification.currentTier.name}
                      </span>
                      {gamification.pointsToNext > 0 && gamification.nextTier && (
                        <span className="text-[10.5px] text-muted-foreground">
                          <strong className="text-primary">{gamification.pointsToNext} pts</strong> to {gamification.nextTier.name}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Tier progress bar */}
                {gamification.nextTier && (
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[9.5px] text-muted-foreground mb-1.5 font-medium">
                      <span>{gamification.currentTier.name}</span>
                      <span>
                        <strong className="text-foreground">
                          {gamification.totalPoints} / {gamification.nextTier.minPoints} pts
                        </strong>
                      </span>
                      <span>{gamification.nextTier.name}</span>
                    </div>
                    <div className="h-[7px] bg-primary/10 rounded border border-primary/15 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-primary to-coin transition-all"
                        style={{ width: `${Math.min(100, (gamification.totalPoints / gamification.nextTier.minPoints) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable area: Nav + Leaderboard */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <nav className="p-3 space-y-1">
          {grouped ? (
            (navItems as NavGroup[]).map((group) => {
              const isOpen = openGroups[group.label] ?? false;
              const hasActive = group.items.some((i) => location.pathname === i.path);
              return (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors',
                      hasActive ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'
                    )}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="space-y-0.5 mt-0.5 mb-2">
                      {group.items.map(renderNavButton)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            (navItems as NavItem[]).map(renderNavButton)
          )}
        </nav>

        {/* Leaderboard inside scroll area */}
        {showMiniLeaderboard && <MiniLeaderboard onNavigate={onNavigate} />}
      </div>

      {/* Bottom: Sign out + action (pinned) */}
      <div className="flex-shrink-0 border-t border-border p-3 space-y-2 safe-bottom">
          {bottomAction && (
            <Button
              onClick={() => {
                bottomAction.onClick();
                onNavigate?.();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {bottomAction.icon}
              <span className="ms-2">{bottomAction.label}</span>
            </Button>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t("common.signOut", "Sign Out")}
        </button>
      </div>
    </div>
  );
};

export const DashboardSidebar = (props: DashboardSidebarProps) => {
  const isControlled = typeof props.mobileOpen === 'boolean' && typeof props.onMobileOpenChange === 'function';

  return (
    <>
      {/* Desktop: permanent sidebar */}
      <aside className="hidden md:flex w-[260px] flex-shrink-0 h-screen sticky top-0 overflow-hidden">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile: Sheet drawer */}
      {isControlled && (
        <Sheet open={props.mobileOpen} onOpenChange={props.onMobileOpenChange}>
          <SheetContent side={document.documentElement.dir === 'rtl' ? 'right' : 'left'} className="p-0 w-[280px] safe-top safe-bottom">
            <SidebarContent {...props} onNavigate={() => props.onMobileOpenChange!(false)} />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
