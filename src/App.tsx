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
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BuyerDashboard from "./pages/BuyerDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DeveloperDirectory from "./pages/DeveloperDirectory";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";
import { FloatingChatFAB } from "./components/FloatingChatFAB";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <GuestTimerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GuestTimerBanner />
            <GuestTimerExpiredModal />
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
            <PWAInstallBanner />
          </BrowserRouter>
        </GuestTimerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
