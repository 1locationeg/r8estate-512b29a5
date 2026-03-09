import { ReactNode, useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { Footer } from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
  sidebarProps: React.ComponentProps<typeof DashboardSidebar>;
}

export const DashboardLayout = ({ children, title, breadcrumb, sidebarProps }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden w-full">
      <DashboardSidebar
        {...sidebarProps}
        mobileOpen={sidebarOpen}
        onMobileOpenChange={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-x-hidden">
        <DashboardHeader
          title={title}
          breadcrumb={breadcrumb}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="p-4 md:p-6 flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
