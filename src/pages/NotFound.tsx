import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Return to home"
        >
          <BrandLogo size="md" />
        </button>
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <button
            onClick={() => navigate("/")}
            className="text-primary underline hover:text-primary/90"
          >
            Return to Home
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;