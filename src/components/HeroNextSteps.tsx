import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, GitCompareArrows, Rocket, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompareModal } from "@/components/CompareModal";
import ContractUploadModal from "@/components/ContractUploadModal";

const intents = [
  { key: "reviews", icon: Search, accent: "from-blue-500/15 to-blue-600/5", ring: "group-hover:ring-blue-500/30" },
  { key: "compare", icon: GitCompareArrows, accent: "from-amber-500/15 to-amber-600/5", ring: "group-hover:ring-amber-500/30" },
  { key: "launch", icon: Rocket, accent: "from-violet-500/15 to-violet-600/5", ring: "group-hover:ring-violet-500/30" },
  { key: "contract", icon: ShieldCheck, accent: "from-emerald-500/15 to-emerald-600/5", ring: "group-hover:ring-emerald-500/30" },
] as const;

export const HeroNextSteps = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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
            setTimeout(() => setVisible((v) => { const n = [...v]; n[i] = true; return n; }), i * 100);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
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

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <>
      <div ref={ref} className="w-full mt-5 space-y-2">
        {/* CTA Corridor — no header needed, each button is self-explanatory */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {intents.map((intent, i) => {
            const Icon = intent.icon;
            return (
              <button
                key={intent.key}
                onClick={() => handleAction(intent.key)}
                className={cn(
                  "group relative flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-border/60 bg-card overflow-hidden text-start ring-1 ring-transparent",
                  "hover:border-primary/30 hover:shadow-md hover:scale-[1.02]",
                  "transition-all duration-400 cursor-pointer",
                  intent.ring,
                  visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                )}
              >
                {/* Background accent gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", intent.accent)} />

                {/* Icon */}
                <div className="relative shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon className="w-4.5 h-4.5" strokeWidth={2.2} />
                </div>

                {/* Text */}
                <div className="relative flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-foreground leading-tight truncate">
                    {t(`nextSteps.${intent.key}.cta`)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5 truncate">
                    {t(`nextSteps.${intent.key}.subtitle`)}
                  </span>
                </div>

                {/* Chevron */}
                <Chevron className="relative shrink-0 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all duration-300" />
              </button>
            );
          })}
        </div>

        {/* Social proof */}
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-trust-excellent mr-1 align-middle animate-pulse" />
          {t("nextSteps.socialProof")}
        </p>
      </div>

      <CompareModal item={null} open={showCompare} onClose={() => setShowCompare(false)} />
      <ContractUploadModal open={showContract} onOpenChange={setShowContract} />
    </>
  );
};
