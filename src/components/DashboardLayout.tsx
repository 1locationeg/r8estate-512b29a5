import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { Footer } from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
  sidebarProps: React.ComponentProps<typeof DashboardSidebar>;
}

export const DashboardLayout = ({ children, title, breadcrumb, sidebarProps }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden w-full">
      <DashboardSidebar {...sidebarProps} />
      <div className={`flex-1 flex flex-col overflow-x-hidden ${isMobile ? '' : 'lg:ms-64'}`}>
        <DashboardHeader title={title} breadcrumb={breadcrumb} />
        <main className="p-4 md:p-6 flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
