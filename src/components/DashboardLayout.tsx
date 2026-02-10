import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
  sidebarProps: React.ComponentProps<typeof DashboardSidebar>;
}

export const DashboardLayout = ({ children, title, breadcrumb, sidebarProps }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar {...sidebarProps} />
      <div className="lg:ms-64">
        <DashboardHeader title={title} breadcrumb={breadcrumb} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
