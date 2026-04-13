import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export function JourneyCompleteCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(220,60%,12%)] via-[hsl(200,50%,15%)] to-[hsl(160,45%,18%)] p-5 md:p-8 text-white relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(var(--primary))] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold leading-tight">
          {t("journeyComplete.headline1")}
        </h2>
        <p className="text-emerald-400 font-semibold text-lg">
          {t("journeyComplete.headline2")}
        </p>

        {/* Benefit line */}
        <p className="text-white/70 text-sm">{t("journeyComplete.benefitLine")}</p>

        {/* Coin reward */}
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-semibold">
          <Coins className="w-4 h-4 text-[hsl(var(--coin))]" />
          <span>{t("journeyComplete.rewardText")}</span>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 mt-1">
          {user ? (
            <Button onClick={() => { window.dispatchEvent(new CustomEvent("corridor:engage", { detail: { zone: 4, action: "cta_click" } })); navigate("/buyer"); }} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
              {t("journeyComplete.goToDashboard")}
            </Button>
          ) : (
            <Button onClick={() => { window.dispatchEvent(new CustomEvent("corridor:engage", { detail: { zone: 4, action: "cta_click" } })); navigate("/auth"); }} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
              {t("journeyComplete.ctaStart")}
            </Button>
          )}
          <Button variant="link" onClick={() => navigate("/developers")} className="text-white/60 hover:text-white p-0 h-auto text-sm">
            {t("journeyComplete.ctaCompare")} →
          </Button>
        </div>
      </div>
    </div>
  );
}
