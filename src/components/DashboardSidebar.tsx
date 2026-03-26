import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BrandLogo } from '@/components/BrandLogo';
import { useBuyerGamification } from '@/hooks/useBuyerGamification';
import { useGamification } from '@/hooks/useGamification';
import { LogOut, ChevronDown, Coins, Trophy, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const businessGamification = useGamification();
  const isBuyerPortal = portalLabel === 'Buyer';
  const isBusinessPortal = portalLabel === 'Business';

  // Competition data for leaderboard strip
  const [userRank, setUserRank] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [rivalName, setRivalName] = useState('');
  const [rivalPoints, setRivalPoints] = useState(0);

  useEffect(() => {
    if (!user || (!isBuyerPortal && !isBusinessPortal)) return;
    const fetchRank = async () => {
      const { data } = await supabase.rpc('get_weekly_leaderboard', { _limit: 50 });
      if (data) {
        const idx = data.findIndex((e: any) => e.user_id === user.id);
        if (idx >= 0) {
          setUserRank(idx + 1);
          setUserPoints(data[idx].total_points);
          if (idx > 0) {
            const rival = data[idx - 1];
            setRivalName(rival.full_name || 'Anonymous');
            setRivalPoints(rival.total_points);
          }
        }
      }
    };
    fetchRank();
  }, [user, isBuyerPortal, isBusinessPortal]);

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

  const renderLeaderboardCard = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const pointsGap = rivalPoints - userPoints;
    const progressPct = rivalPoints > 0 ? Math.min(100, (userPoints / rivalPoints) * 100) : 0;

    return (
      <button
        key={item.label}
        onClick={() => handleNav(item.path)}
        className={cn(
          'w-full rounded-lg px-3 py-2.5 text-start transition-all border',
          isActive
            ? 'bg-coin/10 border-coin/30 border-s-2 border-s-coin'
            : 'bg-coin/5 border-coin/15 hover:bg-coin/10 border-s-2 border-s-transparent hover:border-s-coin/40'
        )}
      >
        {/* Row 1: Trophy + Label + Rank badge */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-coin" />
            <span className="text-[13px] font-bold text-foreground">{item.label}</span>
          </div>
          {userRank > 0 ? (
            <span className="text-[11px] font-extrabold bg-coin/15 text-coin px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-coin animate-pulse" />
              #{userRank}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">Join the race!</span>
          )}
        </div>

        {userRank > 0 && (
          <>
            {/* Row 2: Progress bar + points to next */}
            <div className="h-[5px] bg-background rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-coin to-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Row 3: Rival motivator */}
            {rivalName && pointsGap > 0 ? (
              <p className="text-[10px] text-muted-foreground leading-tight">
                <strong className="text-coin">{pointsGap} pts</strong> to beat{' '}
                <strong className="text-foreground">{rivalName}</strong> for #{userRank - 1}
              </p>
            ) : userRank === 1 ? (
              <p className="text-[10px] font-semibold text-coin leading-tight">🔥 You're #1 this week!</p>
            ) : (
              <p className="text-[10px] text-muted-foreground leading-tight">{userPoints} pts this week</p>
            )}
          </>
        )}

        {userRank === 0 && (
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
            Start reviewing to climb the ranks!
          </p>
        )}
      </button>
    );
  };

  const renderNavButton = (item: NavItem) => {
    // Skip leaderboard in nav — it's rendered above as a pinned strip
    if ((isBuyerPortal || isBusinessPortal) && item.path === '/leaderboard') {
      return null;
    }

    const isActive = location.pathname === item.path;
    const activeColor = isBusinessPortal ? 'business-border' : 'primary';
    return (
      <button
        key={item.label}
        onClick={() => handleNav(item.path)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
          isActive
            ? isBusinessPortal
              ? 'bg-business/30 text-business-border border-s-2 border-business-border'
              : 'bg-primary/10 text-primary border-s-2 border-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground border-s-2 border-transparent'
        )}
      >
        <span className={cn('flex-shrink-0', isActive ? (isBusinessPortal ? 'text-business-border' : 'text-primary') : 'text-muted-foreground')}>
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white text-foreground">
      {/* Profile Card */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex flex-col items-center text-center">
          {/* Avatar with tier badge + online dot */}
          <div className="relative mb-3">
            <Avatar className={cn(
              "h-[72px] w-[72px] ring-[3px]",
              isBusinessPortal ? "ring-business-border/20" : "ring-primary/20"
            )}>
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className={cn(
                "text-xl font-bold",
                isBusinessPortal ? "bg-business-border text-white" : "bg-primary text-primary-foreground"
              )}>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {/* Tier badge — top-start (buyer) */}
            {isBuyerPortal && !gamification.isLoading && (
              <span className="absolute -top-0.5 -start-0.5 w-[22px] h-[22px] rounded-full bg-coin border-[2.5px] border-white flex items-center justify-center text-[10px]">
                {gamification.currentTier.emoji}
              </span>
            )}
            {/* Business icon badge — top-start */}
            {isBusinessPortal && (
              <span className="absolute -top-0.5 -start-0.5 w-[22px] h-[22px] rounded-full bg-business border-[2.5px] border-white flex items-center justify-center">
                <Building2 className="w-3 h-3 text-business-foreground" />
              </span>
            )}
            {/* Online dot — bottom-end */}
            <span className="absolute bottom-0.5 end-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-[2.5px] border-white" />
          </div>
          <p className="text-[17px] font-bold text-foreground tracking-tight truncate max-w-full">
            {isBusinessPortal && companyInfo ? companyInfo.name : (profile?.full_name || 'User')}
          </p>
          <span className={cn(
            "inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide",
            isBusinessPortal
              ? "bg-business border-business-border/30 text-business-foreground"
              : "bg-primary/10 border-primary/20 text-primary"
          )}>
            {portalLabel}
          </span>
          {isBusinessPortal && companyInfo?.subtitle && (
            <p className="text-[11px] text-muted-foreground mt-1">{companyInfo.subtitle}</p>
          )}
          <p className="text-[11.5px] text-muted-foreground mt-1.5 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            {t("dashboard.memberSince", "Member since")}{' '}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : t("dashboard.recently", "Recently")}
          </p>

          {/* Compact tier card — Buyer */}
          {isBuyerPortal && user && !gamification.isLoading && (
            <button
              onClick={() => navigate('/buyer/achievements')}
              className="w-full mt-2.5 group bg-gradient-to-r from-coin/10 to-primary/10 border border-coin/20 rounded-lg px-3 py-2 text-start hover:from-coin/15 hover:to-primary/15 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-coin" />
                  <span className="text-[15px] font-extrabold text-foreground leading-none">{gamification.totalPoints}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">coins</span>
                </div>
                <span className="text-[10px] font-bold bg-coin/15 text-coin px-2 py-0.5 rounded-full">
                  {gamification.currentTier.emoji} {gamification.currentTier.name}
                </span>
              </div>
              {gamification.nextTier && (
                <>
                  <div className="h-[5px] bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-coin to-primary transition-all"
                      style={{ width: `${Math.min(100, (gamification.totalPoints / gamification.nextTier.minPoints) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                    <strong className="text-coin">{gamification.pointsToNext} more</strong> to unlock <strong>{gamification.nextTier.emoji} {gamification.nextTier.name}</strong>
                  </p>
                </>
              )}
            </button>
          )}

          {/* Compact tier card — Business */}
          {isBusinessPortal && user && (
            <button
              onClick={() => navigate('/business/gamification')}
              className="w-full mt-2.5 group bg-gradient-to-r from-business/10 to-business-border/10 border border-business-border/20 rounded-lg px-3 py-2 text-start hover:from-business/15 hover:to-business-border/15 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-business-border" />
                  <span className="text-[15px] font-extrabold text-foreground leading-none">{businessGamification.totalPoints}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">pts</span>
                </div>
                <span className="text-[10px] font-bold bg-business/15 text-business-foreground px-2 py-0.5 rounded-full">
                  {businessGamification.currentTier.emoji} {businessGamification.currentTier.name}
                </span>
              </div>
              <div className="h-[5px] bg-background rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-business to-business-border transition-all"
                  style={{ width: `${businessGamification.profileCompletion}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                Profile {businessGamification.profileCompletion}% complete
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Strip — pinned above nav for visibility */}
      {(isBuyerPortal || isBusinessPortal) && (() => {
        const allItems = grouped ? (navItems as NavGroup[]).flatMap(g => g.items) : (navItems as NavItem[]);
        const lbItem = allItems.find(i => i.path === '/leaderboard');
        return lbItem ? <div className="px-3 pt-3 pb-1">{renderLeaderboardCard(lbItem)}</div> : null;
      })()}

      {/* Scrollable area: Nav */}
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
      </div>

      {/* Bottom: Rank banner + action + sign out (pinned) */}
      <div className="flex-shrink-0 border-t border-border p-3 space-y-2 safe-bottom">

          {bottomAction && (
            <Button
              onClick={() => {
                bottomAction.onClick();
                onNavigate?.();
              }}
              className={cn(
                "w-full font-semibold",
                isBusinessPortal
                  ? "bg-business-border text-white hover:bg-business-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
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
