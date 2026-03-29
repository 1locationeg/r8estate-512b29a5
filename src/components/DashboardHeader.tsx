import { useState } from 'react';
import { Menu, Home, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileNavSheet } from '@/components/MobileNavSheet';
import { useAuth } from '@/contexts/AuthContext';
import { CoinCounter } from '@/components/CoinCounter';
import { useBuyerGamification } from '@/hooks/useBuyerGamification';

interface DashboardHeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuToggle?: () => void;
}

export const DashboardHeader = ({ title, breadcrumb, onMenuToggle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { role, signOut, user } = useAuth();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const isBuyer = role === 'buyer' || role === 'user';
  const gamification = useBuyerGamification();

  const getDashboardRoute = () => {
    if (role === 'admin') return '/admin';
    if (role === 'business') return '/business';
    return '/buyer';
  };

  // Parse breadcrumb into segments
  const breadcrumbSegments = breadcrumb?.split('>').map(s => s.trim()).filter(Boolean) || [];

  return (
    <>
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="h-[54px] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {onMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="touch-target md:hidden flex-shrink-0 h-9 w-9"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            {/* Breadcrumb navigation */}
            <nav className="flex items-center gap-1.5 min-w-0 text-sm" aria-label="Breadcrumb">
              <button
                onClick={() => navigate('/')}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Home"
              >
                <Home className="w-4 h-4" />
              </button>
              {breadcrumbSegments.map((segment, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 rtl-flip" />
                  {i === breadcrumbSegments.length - 1 ? (
                    <span className="text-foreground font-semibold truncate">{segment}</span>
                  ) : (
                    <button
                      onClick={() => navigate(getDashboardRoute())}
                      className="text-muted-foreground hover:text-foreground transition-colors truncate"
                    >
                      {segment}
                    </button>
                  )}
                </span>
              ))}
              {breadcrumbSegments.length === 0 && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 rtl-flip" />
                  <span className="text-foreground font-semibold truncate">{title}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isBuyer && user && !gamification.isLoading && (
              <CoinCounter totalPoints={gamification.totalPoints} />
            )}
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </div>
      </header>

      <MobileNavSheet
        open={moreMenuOpen}
        onOpenChange={setMoreMenuOpen}
        onSignOut={signOut}
        getDashboardRoute={getDashboardRoute}
      />
    </>
  );
};
