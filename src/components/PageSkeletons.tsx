import { Skeleton } from "@/components/ui/skeleton";

// Skeleton for Home/Index page with search and categories
export const IndexSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>

    {/* Hero Section */}
    <div className="px-4 py-12 sm:py-16 lg:py-20">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
        <Skeleton className="h-14 w-full max-w-md mx-auto rounded-lg" />
      </div>
    </div>

    {/* Categories Grid */}
    <div className="px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for Auth page
export const AuthSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-32 mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>
      <div className="border border-border bg-card rounded-xl p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-px w-full bg-border" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  </div>
);

// Skeleton for Dashboard pages (Admin, Buyer, Developer)
export const DashboardSkeleton = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-background flex">
    {/* Sidebar */}
    <div className="hidden lg:block w-64 border-r border-border bg-card p-4">
      <Skeleton className="h-8 w-32 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <main className="p-4 md:p-6 flex-1 space-y-6">
        {/* Page Title */}
        <Skeleton className="h-7 w-48" />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Charts / Lists */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-border bg-card px-4 py-4">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  </div>
);

// Specific dashboard skeletons
export const AdminDashboardSkeleton = () => <DashboardSkeleton title="Overview" />;
export const BuyerDashboardSkeleton = () => <DashboardSkeleton title="Dashboard" />;
export const DeveloperDashboardSkeleton = () => <DashboardSkeleton title="Business Dashboard" />;

// Skeleton for Developer Directory
export const DeveloperDirectorySkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>

    {/* Content */}
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />

      {/* Developer Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton for Install page
export const InstallSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center space-y-6">
      <Skeleton className="h-20 w-20 mx-auto rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-5 w-full" />
      </div>
      <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
    </div>
  </div>
);

// Skeleton for NotFound page
export const NotFoundSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center space-y-6">
      <Skeleton className="h-24 w-24 mx-auto rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-5 w-full" />
      </div>
      <Skeleton className="h-10 w-32 mx-auto rounded-lg" />
    </div>
  </div>
);
