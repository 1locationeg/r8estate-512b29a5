import { useMemo } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TruthCheckHero } from "@/components/TruthCheckHero";
import { ScanSearch } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTruthCheckSettings } from "@/hooks/useTruthCheckSettings";
import { Loader2 } from "lucide-react";

const TruthCheck = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const { signOut, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, loading } = useTruthCheckSettings();

  const initialClaim = params.get("claim") ?? undefined;
  const developerId = params.get("developer") ?? undefined;
  const developerName = params.get("name") ?? undefined;

  const heroProps = useMemo(
    () => ({ initialClaim, developerId, developerName }),
    [initialClaim, developerId, developerName],
  );

  const handleSignOut = async () => {
    await signOut();
    toast({ title: t("common.signedOut"), description: t("common.signedOutSuccess") });
    navigate("/");
  };

  const getDashboardRoute = () => {
    if (role === "admin") return "/admin";
    if (role === "business") return "/business";
    return "/buyer";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(210,20%,98%)]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings.enabled || !settings.pageEnabled) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[hsl(210,20%,98%)] flex flex-col">
      <Navbar
        userMode="buyers"
        onSwitchToBusinessView={() => navigate("/")}
        onSwitchToBuyerView={() => navigate("/")}
        togglePulse={false}
        onSignOut={handleSignOut}
        getDashboardRoute={getDashboardRoute}
      />
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-3 sm:px-6 py-6 md:py-10">
        <header className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <ScanSearch className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold tracking-wide uppercase text-primary">
              {settings.cardEyebrow}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
            {settings.pageTitle}
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {settings.pageSubtitle}
          </p>
        </header>

        <TruthCheckHero {...heroProps} />
      </main>
      <Footer />
    </div>
  );
};

export default TruthCheck;