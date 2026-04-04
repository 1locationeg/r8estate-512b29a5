import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar userMode="buyers" onSwitchToBusinessView={() => {}} onSwitchToBuyerView={() => {}} togglePulse={false} onSignOut={() => {}} getDashboardRoute={() => "/buyer"} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Return to home"
        >
          <BrandLogo size="hero" />
        </button>
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Button onClick={() => navigate("/")} variant="default" className="gap-2">
            <Home className="w-4 h-4" />
            Return to Home
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;