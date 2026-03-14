import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GuestTimerProvider } from "@/contexts/GuestTimerContext";
import { GuestTimerBanner } from "@/components/GuestTimerBanner";
import { GuestTimerExpiredModal } from "@/components/GuestTimerExpiredModal";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { FloatingChatFAB } from "./components/FloatingChatFAB";
import { BottomNav } from "./components/BottomNav";
import { DynamicMeta } from "./components/DynamicMeta";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const DeveloperDashboard = lazy(() => import("./pages/DeveloperDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DeveloperDirectory = lazy(() => import("./pages/DeveloperDirectory"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Install = lazy(() => import("./pages/Install"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// App with proper provider hierarchy: Auth > GuestTimer > Router
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <GuestTimerProvider>
          <Toaster />
          <Sonner />
          <DynamicMeta />
          <BrowserRouter>
            <GuestTimerBanner />
            <GuestTimerExpiredModal />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/buyer/*" element={<BuyerDashboard />} />
                <Route path="/developer/*" element={<DeveloperDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/directory" element={<DeveloperDirectory />} />
                <Route path="/install" element={<Install />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <BottomNav />
            <PWAInstallBanner />
            <FloatingChatFAB />
          </BrowserRouter>
        </GuestTimerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
