import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/NotificationBell';
import { BrandLogo } from '@/components/BrandLogo';
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

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="min-h-16 flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {onMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="touch-target md:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-0 hover:opacity-80 transition-opacity flex-shrink-0"
              aria-label="Return to home"
            >
              <BrandLogo size="hero" />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
                {title}
              </h1>
              {breadcrumb && (
                <p className="hidden sm:block text-xs text-muted-foreground truncate">
                  {breadcrumb}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isBuyer && user && !gamification.isLoading && (
              <CoinCounter totalPoints={gamification.totalPoints} />
            )}
            <LanguageSwitcher />
            <NotificationBell />
            <button
              onClick={() => setMoreMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors md:hidden"
              aria-label="More menu"
            >
              <Menu className="w-4 h-4 text-muted-foreground" />
            </button>
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
