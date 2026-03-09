import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isAndroid = () => /Android/.test(navigator.userAgent);

export const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Previously dismissed permanently
    if (localStorage.getItem("pwa-banner-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // 3-second delay before showing
    const timer = setTimeout(() => setVisible(true), 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsStandalone(true);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (isStandalone || !visible) return null;

  const showIOS = isIOS();
  const showAndroid = isAndroid() && !!deferredPrompt;
  // Show on iOS, Android with prompt, or any browser with prompt
  if (!showIOS && !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 safe-bottom safe-x animate-in slide-in-from-bottom duration-500">
      <div className="bg-primary text-primary-foreground px-4 py-4 shadow-2xl rounded-t-2xl mx-2 mb-0 md:mx-auto md:max-w-md">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-2">
          <img src={logoIcon} alt="R8estate" className="h-10 w-10 object-contain flex-shrink-0 rounded-lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">Install R8estate</p>
            <p className="text-xs opacity-70">No App Store needed · Free · Instant</p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-primary-foreground/10 rounded-full transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iOS instructions */}
        {showIOS && (
          <div className="space-y-2">
            {!showIOSSteps ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowIOSSteps(true)}
                className="w-full gap-2 min-h-[44px] font-semibold"
              >
                <Download className="w-4 h-4" />
                Add to Home Screen
              </Button>
            ) : (
              <div className="bg-primary-foreground/10 rounded-xl p-3 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-primary-foreground/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span className="flex items-center gap-1.5">
                    Tap the <Share className="w-4 h-4 inline" /> <strong>Share</strong> button
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-primary-foreground/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span className="flex items-center gap-1.5">
                    Tap <Plus className="w-4 h-4 inline" /> <strong>Add to Home Screen</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Android / Chrome install button */}
        {!showIOS && deferredPrompt && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleInstall}
            className="w-full gap-2 min-h-[44px] font-semibold"
          >
            <Download className="w-4 h-4" />
            Add to Home Screen
          </Button>
        )}
      </div>
    </div>
  );
};
