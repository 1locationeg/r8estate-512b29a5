import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    // Check if previously dismissed this session
    if (sessionStorage.getItem("pwa-banner-dismissed")) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsStandalone(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  // Don't show if installed, dismissed, or no prompt available
  if (isStandalone || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 safe-bottom animate-in slide-in-from-bottom duration-300">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-lg">
        <img src={logoIcon} alt="R8ESTATE" className="h-8 w-8 object-contain flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">Install R8ESTATE</p>
          <p className="text-xs opacity-80 truncate">Quick access from your home screen</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleInstall}
          className="flex-shrink-0 gap-1.5 min-h-[36px]"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-primary-foreground/10 rounded-full transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
