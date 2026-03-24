// @ts-nocheck
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessLogoProvider } from "@/contexts/BusinessLogoContext";
import { GuestTimerProvider } from "@/contexts/GuestTimerContext";
import { GuestTimerBanner } from "@/components/GuestTimerBanner";
import { GuestTimerExpiredModal } from "@/components/GuestTimerExpiredModal";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { FloatingChatFAB } from "./components/FloatingChatFAB";
import { BottomNav } from "./components/BottomNav";
import { DynamicMeta } from "@/components/DynamicMeta";
import { TrackingManager } from "@/components/TrackingManager";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import {
  IndexSkeleton,
  AuthSkeleton,
  AdminDashboardSkeleton,
  BuyerDashboardSkeleton,
  DeveloperDashboardSkeleton,
  DeveloperDirectorySkeleton,
  InstallSkeleton,
  NotFoundSkeleton,
} from "@/components/PageSkeletons";

// Lazy-loaded pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const DeveloperDashboard = lazy(() => import("./pages/DeveloperDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DeveloperDirectory = lazy(() => import("./pages/DeveloperDirectory"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Install = lazy(() => import("./pages/Install"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const Community = lazy(() => import("./pages/Community"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const DealWatch = lazy(() => import("./pages/DealWatch"));
const LaunchWatch = lazy(() => import("./pages/LaunchWatch"));
const EmbedWidget = lazy(() => import("./pages/EmbedWidget"));
const Categories = lazy(() => import("./pages/Categories"));
const EntityPage = lazy(() => import("./pages/EntityPage"));

// Redirect old /developer/* routes to /business/*
const RedirectDeveloperToBusiness = () => {
  const location = useLocation();
  const newPath = location.pathname.replace(/^\/developer/, '/business') + location.search + location.hash;
  return <Navigate to={newPath} replace />;
};

const queryClient = new QueryClient();

// Check if current route is an embed route (no chrome)
const useIsEmbedRoute = () => {
  const location = useLocation();
  return location.pathname.startsWith("/embed/");
};

// Route-aware fallback component
const RouteLoader = () => {
  const location = useLocation();
  const path = location.pathname;

  // Return skeleton based on current route
  if (path === "/") return <IndexSkeleton />;
  if (path === "/auth") return <AuthSkeleton />;
  if (path.startsWith("/buyer")) return <BuyerDashboardSkeleton />;
  if (path.startsWith("/business")) return <DeveloperDashboardSkeleton />;
  if (path.startsWith("/admin")) return <AdminDashboardSkeleton />;
  if (path === "/directory") return <DeveloperDirectorySkeleton />;
  if (path === "/install") return <InstallSkeleton />;
  if (path === "*") return <NotFoundSkeleton />;
  return <IndexSkeleton />;
};

// App with proper provider hierarchy: Auth > GuestTimer > Router
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CookieConsentProvider>
        <AuthProvider>
          <BusinessLogoProvider>
          <GuestTimerProvider>
            <Toaster />
            <Sonner />
            <DynamicMeta />
            <TrackingManager />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </GuestTimerProvider>
        </AuthProvider>
      </CookieConsentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const isEmbed = useIsEmbedRoute();

  if (isEmbed) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[80px] p-4" />}>
        <Routes>
          <Route path="/embed/widget/:token" element={<EmbedWidget />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <GuestTimerBanner />
      <GuestTimerExpiredModal />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/buyer/*" element={<BuyerDashboard />} />
          <Route path="/business/*" element={<DeveloperDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/directory" element={<DeveloperDirectory />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/install" element={<Install />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/deal-watch" element={<DealWatch />} />
          <Route path="/launch-watch" element={<LaunchWatch />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/entity/:id" element={<EntityPage />} />
          <Route path="/developer/*" element={<RedirectDeveloperToBusiness />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <BottomNav />
      <PWAInstallBanner />
      <FloatingChatFAB />
      <CookieConsentBanner />
    </>
  );
};

export default App;
