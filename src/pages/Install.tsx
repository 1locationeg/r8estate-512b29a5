import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Download, Smartphone, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to R8ESTATE
        </button>

        <div className="flex items-center justify-center gap-3">
          <BrandLogo size="hero" />
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-trust-excellent mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Already Installed!</h2>
            <p className="text-muted-foreground">R8ESTATE is installed on your device. Open it from your home screen.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Smartphone className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Install R8ESTATE</h2>
            <p className="text-muted-foreground">Add R8ESTATE to your home screen for instant access — no app store needed.</p>

            {deferredPrompt ? (
              <Button onClick={handleInstall} size="lg" className="w-full min-h-[48px] text-base gap-2">
                <Download className="w-5 h-5" /> Install Now
              </Button>
            ) : (
              <div className="space-y-4 text-left bg-secondary/50 rounded-xl p-6">
                <p className="font-semibold text-foreground text-center">How to install:</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">iPhone/iPad:</strong> Tap the Share button → "Add to Home Screen"</p>
                  <p><strong className="text-foreground">Android:</strong> Tap the browser menu (⋮) → "Add to Home Screen"</p>
                  <p><strong className="text-foreground">Desktop:</strong> Click the install icon in the address bar</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Install;
