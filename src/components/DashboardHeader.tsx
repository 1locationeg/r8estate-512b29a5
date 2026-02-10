import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface DashboardHeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuToggle?: () => void;
}

export const DashboardHeader = ({ title, breadcrumb, onMenuToggle }: DashboardHeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {breadcrumb && (
            <p className="text-xs text-muted-foreground">{breadcrumb}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>
      </div>
    </header>
  );
};
