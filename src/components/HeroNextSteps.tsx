import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CheckCircle, GitCompare, FileSearch, Shield, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompareModal } from "@/components/CompareModal";
import ContractUploadModal from "@/components/ContractUploadModal";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    key: "reviews",
    icon: CheckCircle,
    colorClass: "text-trust-excellent",
    bgClass: "bg-trust-excellent/10",
  },
  {
    key: "compare",
    icon: GitCompare,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  {
    key: "contract",
    icon: FileSearch,
    colorClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
  },
] as const;

export const HeroNextSteps = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCompare, setShowCompare] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [visible, setVisible] = useState([false, false, false]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          steps.forEach((_, i) => {
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
    if (key === "contract") setShowContract(true);
  };

  return (
    <>
      <div ref={ref} className="w-full mt-5 space-y-3">
        {/* Header */}
        <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">
          {t("nextSteps.header", "What to do next")}
        </p>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <button
                key={step.key}
                onClick={() => handleAction(step.key)}
                className={cn(
                  "flex flex-col items-start gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-start group",
                  visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
                  "transition-all duration-500"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", step.bgClass)}>
                  <Icon className={cn("w-4 h-4", step.colorClass)} />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">
                  {t(`nextSteps.${step.key}.title`)}
                </span>
                <span className="text-[10px] text-muted-foreground leading-snug">
                  {t(`nextSteps.${step.key}.subtitle`)}
                </span>
                <span className={cn("text-[10px] font-semibold mt-auto group-hover:underline", step.colorClass)}>
                  {t(`nextSteps.${step.key}.cta`)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Primary + Secondary CTAs */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => navigate(user ? "/buyer" : "/auth")}
            className="flex-1 animate-[pulse_3s_ease-in-out_1]"
            size="lg"
          >
            <Shield className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
            {t("nextSteps.protectCta", "Protect your purchase now")}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/deal-watch")}
            className="flex-1"
            size="lg"
          >
            <Bell className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
            {t("nextSteps.alertCta", "Set a price alert")}
          </Button>
        </div>

        {/* Social proof micro-copy */}
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-trust-excellent mr-1 align-middle" />
          {t("nextSteps.socialProof", "Verified buyers who checked this developer before signing saved an average of EGP 620K in hidden fees.")}
        </p>
      </div>

      <CompareModal item={null} open={showCompare} onClose={() => setShowCompare(false)} />
      <ContractUploadModal open={showContract} onOpenChange={setShowContract} />
    </>
  );
};
