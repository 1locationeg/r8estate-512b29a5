import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, BrainCircuit, BadgeCheck, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { num: "01", icon: Search, titleKey: "step1Title", descKey: "step1Desc" },
  { num: "02", icon: BrainCircuit, titleKey: "step2Title", descKey: "step2Desc" },
  { num: "03", icon: BadgeCheck, titleKey: "step3Title", descKey: "step3Desc" },
] as const;

const HowWeWork = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  // Track how-we-work view for corridor progress
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("corridor:engage", { detail: { zone: 3, action: "how_we_work" } }));
  }, []);

  return (
    <section className="w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* Unified header */}
      <div className="flex flex-col items-center gap-1.5 mb-6 md:mb-8">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 rounded-full px-3.5 py-1.5 border border-primary/15">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {t("howWeWork.headline")}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-center text-foreground">
          {t("howWeWork.headline")}
        </h2>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === steps.length - 1;
          return (
            <div key={step.num} className="relative">
              <div
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-3.5 py-3",
                  "md:flex-col md:items-start md:gap-2 md:p-5",
                  "transition-all duration-500 ease-out cursor-pointer",
                  "hover:border-primary/30 hover:shadow-[0_0_20px_-6px_hsl(var(--primary)/0.15)]",
                  "active:scale-[0.98]"
                )}
              >
                {/* Icon pill */}
                <div className={cn(
                  "shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg",
                  "bg-primary/10 transition-all duration-500"
                )}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary transition-colors duration-500" />
                </div>

                {/* Text block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/70 transition-colors">
                      {step.num}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-foreground transition-colors duration-500 truncate">
                      {t(`howWeWork.${step.titleKey}`)}
                    </h3>
                  </div>
                  <p className="text-[11px] md:text-sm leading-snug text-muted-foreground transition-colors duration-500 line-clamp-2 mt-0.5">
                    {t(`howWeWork.${step.descKey}`)}
                  </p>
                </div>

                {/* Mobile arrow hint */}
                {!isLast && (
                  <ChevronRight className={cn(
                    "shrink-0 w-3.5 h-3.5 text-muted-foreground/40 md:hidden transition-colors",
                    isRtl && "rotate-180"
                  )} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowWeWork;
