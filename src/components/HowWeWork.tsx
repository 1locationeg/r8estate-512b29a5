import { useTranslation } from "react-i18next";
import { Search, BrainCircuit, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { num: "01", icon: Search, titleKey: "step1Title", descKey: "step1Desc", glow: false },
  { num: "02", icon: BrainCircuit, titleKey: "step2Title", descKey: "step2Desc", glow: true },
  { num: "03", icon: BadgeCheck, titleKey: "step3Title", descKey: "step3Desc", glow: false },
] as const;

const HowWeWork = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <section className="w-full py-2 md:py-3" dir={isRtl ? "rtl" : "ltr"}>
      {/* Headline */}
      <div className="flex flex-col items-center gap-1.5 mb-3 md:mb-4">
        <h2
          className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer"
        >
          {t("howWeWork.headline")}
        </h2>
      </div>

      {/* Steps Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Desktop connector lines */}
        <div className="hidden md:block absolute top-1/2 left-[calc(33.33%+0.75rem)] right-[calc(33.33%+0.75rem)] -translate-y-1/2 h-px border-t-2 border-dashed border-border z-0" />

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="relative z-10">
              {/* Mobile connector */}
              {i > 0 && (
                <div className="md:hidden flex justify-center -mt-2 mb-2">
                  <div className="w-px h-6 border-l-2 border-dashed border-border" />
                </div>
              )}
                <div
                  className={cn(
                    "group relative rounded-xl border border-border bg-card p-5 md:p-6 cursor-pointer ai-grain",
                    "transition-all duration-300 ease-out",
                    "hover:bg-primary hover:border-primary hover:scale-[1.03] hover:shadow-[0_0_30px_-8px_hsl(var(--glow-primary)/0.3)]"
                  )}
              >
                {/* Step number */}
                <span className="font-mono text-[11px] font-bold text-accent group-hover:text-primary-foreground/60 transition-colors duration-300">
                  {step.num}
                </span>

                {/* Icon */}
                <div className="mt-3 mb-3">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary-foreground/15 transition-all duration-300 ai-icon-glow",
                      step.glow && "animate-pulse-glow ai-float"
                    )}
                  >
                    <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-foreground group-hover:text-primary-foreground transition-colors duration-300 mb-1.5">
                  {t(`howWeWork.${step.titleKey}`)}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-primary-foreground/80 transition-colors duration-300">
                  {t(`howWeWork.${step.descKey}`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowWeWork;
