import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, Shield, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BusinessUpgradeModal } from "./BusinessUpgradeModal";

interface UpsellContent {
  headline: string;
  subtext: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  cta: string;
}

export const DeveloperInsightsUpsell = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [content, setContent] = useState<UpsellContent | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isRTL = i18n.language === "ar";
  const lang = isRTL ? "ar" : "en";

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["upsell_enabled", `upsell_content_${lang}`]);

      if (data) {
        const enabledRow = data.find((r) => r.key === "upsell_enabled");
        if (enabledRow && enabledRow.value !== "true") {
          setEnabled(false);
          return;
        }
        const contentRow = data.find((r) => r.key === `upsell_content_${lang}`);
        if (contentRow) {
          try {
            setContent(JSON.parse(contentRow.value));
          } catch {}
        }
      }
    };
    fetchSettings();
  }, [lang]);

  if (!enabled) return null;

  const fallback: UpsellContent = {
    headline: t("upsell.headline", "Want to see the full picture?"),
    subtext: t("upsell.subtext", "Don't settle for surface-level reviews. Get an expert report analyzing the developer's performance over the last 24 months."),
    bullet1: t("upsell.bullet1", "Deep-dive into complaint trends and patterns."),
    bullet2: t("upsell.bullet2", "Predictive risk indicators (Delivery & Quality)."),
    bullet3: t("upsell.bullet3", "Benchmarking against top-tier local competitors."),
    cta: t("upsell.cta", "Unlock Business Insights"),
  };

  const c = content || fallback;

  const bullets = [
    { icon: AlertTriangle, text: c.bullet1, color: "text-amber-500" },
    { icon: TrendingUp, text: c.bullet2, color: "text-trust-excellent" },
    { icon: Shield, text: c.bullet3, color: "text-primary" },
  ];

  const handleCTA = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setShowUpgrade(true);
  };

  return (
    <>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative overflow-hidden rounded-2xl border border-border mt-6"
      >
        {/* Blurred SVG background */}
        <div className="absolute inset-0 opacity-20 blur-sm pointer-events-none">
          <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,120 C30,100 60,80 100,90 C140,100 160,60 200,50 C240,40 280,70 320,55 C360,40 380,60 400,50"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            <path
              d="M0,140 C40,130 80,110 120,115 C160,120 200,90 240,85 C280,80 320,100 360,90 C380,85 400,95 400,90"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
            />
            <path
              d="M0,80 C50,70 80,90 130,75 C180,60 220,80 270,65 C320,50 360,70 400,60"
              fill="none"
              stroke="hsl(var(--trust-excellent))"
              strokeWidth="1.5"
            />
            {/* Fake bar chart */}
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x, i) => (
              <rect
                key={i}
                x={x}
                y={130 - (20 + Math.sin(i * 0.8) * 30)}
                width="16"
                height={20 + Math.sin(i * 0.8) * 30}
                rx="2"
                fill="hsl(var(--primary))"
                opacity="0.15"
              />
            ))}
          </svg>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/95 to-card/70 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-5 md:p-8">
          {/* Bullets */}
          <div className="space-y-3 mb-5">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <b.icon className={`w-4 h-4 ${b.color}`} />
                </div>
                <p className="text-sm text-muted-foreground pt-1">{b.text}</p>
              </div>
            ))}
          </div>

          {/* Headline + Subtext */}
          <div className="mb-5">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1.5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              {c.headline}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {c.subtext}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleCTA}
            className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {c.cta}
          </button>
        </div>
      </div>

      <BusinessUpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
};
