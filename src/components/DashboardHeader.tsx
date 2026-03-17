import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/NotificationBell';
import logoIcon from '@/assets/logo-icon.png';

interface DashboardHeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuToggle?: () => void;
}

export const DashboardHeader = ({ title, breadcrumb, onMenuToggle }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="min-h-16 flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="touch-target"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Return to home"
          >
            <img src={logoIcon} alt="R8ESTATE" className="h-7 w-auto object-contain" />
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
          <LanguageSwitcher />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
};
