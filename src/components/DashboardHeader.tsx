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
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30 safe-top">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Return to home"
        >
          <img src={logoIcon} alt="R8ESTATE" className="h-8 w-auto object-contain" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {breadcrumb && (
            <p className="text-xs text-muted-foreground">{breadcrumb}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <NotificationBell />
      </div>
    </header>
  );
};
