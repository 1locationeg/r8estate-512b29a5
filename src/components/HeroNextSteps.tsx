import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Shield, Bell, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompareModal } from "@/components/CompareModal";
import ContractUploadModal from "@/components/ContractUploadModal";
import { useAuth } from "@/contexts/AuthContext";

const intents = [
  { key: "reviews", emoji: "🔍" },
  { key: "compare", emoji: "⚖️" },
  { key: "launch", emoji: "🚀" },
  { key: "contract", emoji: "🛡️" },
] as const;

export const HeroNextSteps = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCompare, setShowCompare] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [visible, setVisible] = useState([false, false, false, false]);
  const ref = useRef<HTMLDivElement>(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          intents.forEach((_, i) => {
            setTimeout(() => setVisible((v) => { const n = [...v]; n[i] = true; return n; }), i * 120);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleAction = (key: string) => {
    if (key === "reviews") navigate("/reviews");
    if (key === "compare") setShowCompare(true);
    if (key === "launch") navigate("/launch-watch");
    if (key === "contract") setShowContract(true);
  };

  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <div ref={ref} className="w-full mt-5 space-y-3">
        {/* Header */}
        <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em] text-center">
          {t("nextSteps.header")}
        </p>

        {/* Intent Corridor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {intents.map((intent, i) => (
            <button
              key={intent.key}
              onClick={() => handleAction(intent.key)}
              className={cn(
                "group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card overflow-hidden text-start",
                "hover:border-primary/40 hover:shadow-md hover:scale-[1.02]",
                "transition-all duration-500",
                visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              {/* Hover gradient sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Emoji + Arrow */}
              <div className="relative flex items-center gap-2">
                <span className="text-2xl" role="img">{intent.emoji}</span>
                <Arrow className="w-4 h-4 text-primary/60 group-hover:text-primary animate-[shimmer-slide_2s_ease-in-out_infinite] transition-colors" />
              </div>

              {/* Bold verb phrase */}
              <span className="relative text-sm font-bold text-foreground leading-tight">
                {t(`nextSteps.${intent.key}.title`)}
              </span>

              {/* Inner-voice question */}
              <span className="relative text-[11px] italic text-muted-foreground leading-snug">
                {t(`nextSteps.${intent.key}.subtitle`)}
              </span>
            </button>
          ))}
        </div>

        {/* Primary + Secondary CTAs */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => navigate(user ? "/buyer" : "/auth")}
            className="flex-1 animate-[pulse_3s_ease-in-out_1]"
            size="lg"
          >
            <Shield className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
            {t("nextSteps.protectCta")}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/deal-watch")}
            className="flex-1"
            size="lg"
          >
            <Bell className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
            {t("nextSteps.alertCta")}
          </Button>
        </div>

        {/* Social proof */}
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-trust-excellent mr-1 align-middle" />
          {t("nextSteps.socialProof")}
        </p>
      </div>

      <CompareModal item={null} open={showCompare} onClose={() => setShowCompare(false)} />
      <ContractUploadModal open={showContract} onOpenChange={setShowContract} />
    </>
  );
};
