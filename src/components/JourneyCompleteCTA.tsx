import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Coins, ShieldCheck, BarChart3, Bell } from "lucide-react";

export function JourneyCompleteCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const benefits = [
    { icon: ShieldCheck, label: t("journeyComplete.benefit1") },
    { icon: BarChart3, label: t("journeyComplete.benefit2") },
    { icon: Bell, label: t("journeyComplete.benefit3") },
  ];

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(220,60%,12%)] via-[hsl(200,50%,15%)] to-[hsl(160,45%,18%)] p-6 md:p-10 text-white relative">
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))] opacity-[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Badge */}
        <Badge className="bg-white/10 text-white/90 border-white/20 gap-1.5 px-3 py-1">
          <Trophy className="w-3.5 h-3.5 text-[hsl(var(--coin))]" />
          {t("journeyComplete.badge")}
        </Badge>

        {/* Headline */}
        <h2 className="text-xl md:text-2xl font-bold leading-tight max-w-lg">
          {t("journeyComplete.headline1")}
          <br />
          <span className="text-[hsl(var(--primary))]">{t("journeyComplete.headline2")}</span>
        </h2>

        {/* Social proof */}
        <p className="text-white/60 text-sm">{t("journeyComplete.socialProof")}</p>

        {/* Coin reward */}
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-semibold">
          <Coins className="w-5 h-5 text-[hsl(var(--coin))]" />
          <span>{t("journeyComplete.rewardText")}</span>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {benefits.map((b) => (
            <span key={b.label} className="flex items-center gap-1.5 bg-white/[0.08] rounded-full px-3 py-1 text-xs text-white/80">
              <b.icon className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              {b.label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {user ? (
            <Button onClick={() => navigate("/buyer")} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
              {t("journeyComplete.goToDashboard")}
            </Button>
          ) : (
            <Button onClick={() => navigate("/auth")} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
              {t("journeyComplete.ctaStart")}
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate("/developers")} className="border-white/20 text-white hover:bg-white/10">
            {t("journeyComplete.ctaCompare")}
          </Button>
          <Button variant="outline" onClick={() => navigate("/reviews")} className="border-white/20 text-white hover:bg-white/10">
            {t("journeyComplete.ctaReview")}
          </Button>
        </div>
      </div>
    </div>
  );
}
