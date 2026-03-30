import { useTranslation } from "react-i18next";
import { Search, BrainCircuit, BadgeCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { num: "01", icon: Search, titleKey: "step1Title", descKey: "step1Desc", emoji: "🛡️" },
  { num: "02", icon: BrainCircuit, titleKey: "step2Title", descKey: "step2Desc", emoji: "⚡" },
  { num: "03", icon: BadgeCheck, titleKey: "step3Title", descKey: "step3Desc", emoji: "🏆" },
] as const;

const HowWeWork = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <section className="w-full py-3 md:py-4" dir={isRtl ? "rtl" : "ltr"}>
      {/* Headline — tight */}
      <h2 className="text-base md:text-xl font-extrabold text-center bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer mb-3">
        {t("howWeWork.headline")}
      </h2>

      {/* Compact horizontal strip on mobile, grid on desktop */}
      <div className="flex flex-col gap-1.5 md:grid md:grid-cols-3 md:gap-5">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === steps.length - 1;
          return (
            <div key={step.num} className="relative">
              {/* Mobile: slim row card */}
              <div
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-3.5 py-3",
                  "md:flex-col md:items-start md:gap-2 md:p-5",
                  "transition-all duration-300 ease-out cursor-pointer",
                  "hover:bg-primary hover:border-primary hover:scale-[1.02] hover:shadow-[0_0_24px_-6px_hsl(var(--glow-primary)/0.35)]",
                  "active:scale-[0.98]"
                )}
              >
                {/* Icon pill */}
                <div className={cn(
                  "shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg",
                  "bg-primary/10 group-hover:bg-primary-foreground/15 transition-all duration-300"
                )}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>

                {/* Text block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-accent/70 group-hover:text-primary-foreground/50 transition-colors">
                      {step.num}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary-foreground transition-colors duration-300 truncate">
                      {t(`howWeWork.${step.titleKey}`)}
                    </h3>
                  </div>
                  <p className="text-[11px] md:text-sm leading-snug text-muted-foreground group-hover:text-primary-foreground/80 transition-colors duration-300 line-clamp-2 mt-0.5">
                    {t(`howWeWork.${step.descKey}`)}
                  </p>
                </div>

                {/* Mobile arrow hint */}
                {!isLast && (
                  <ChevronRight className={cn(
                    "shrink-0 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary-foreground/50 md:hidden transition-colors",
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
