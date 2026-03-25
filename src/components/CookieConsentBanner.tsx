import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { Button } from "@/components/ui/button";
import { Shield, Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";

export const CookieConsentBanner = () => {
  const { consent, accept, reject } = useCookieConsent();
  const { t } = useTranslation();

  if (consent !== "pending") return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-3 md:p-4 animate-fade-in-up">
      <div className="max-w-lg mx-auto bg-card border border-border rounded-xl shadow-lg p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-accent/20 p-2 shrink-0">
            <Cookie className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {t("cookies.title", "We value your privacy")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {t(
                "cookies.description",
                "We use cookies and similar technologies to improve your experience, analyze traffic, and personalize content. You can choose to accept or decline non-essential cookies."
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={accept}
                className="h-8 text-xs px-4"
              >
                <Shield className="w-3.5 h-3.5 me-1.5" />
                {t("cookies.accept", "Accept All")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={reject}
                className="h-8 text-xs px-4"
              >
                {t("cookies.reject", "Essential Only")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
