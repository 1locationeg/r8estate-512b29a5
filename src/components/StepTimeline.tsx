import { useTranslation } from "react-i18next";
import { ScanSearch, GitCompare, MessageSquarePlus, BadgeCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const steps = [
  { num: "01", icon: ScanSearch, titleKey: "step1Title", descKey: "step1Desc" },
  { num: "02", icon: GitCompare, titleKey: "step2Title", descKey: "step2Desc" },
  { num: "03", icon: MessageSquarePlus, titleKey: "step3Title", descKey: "step3Desc" },
  { num: "04", icon: BadgeCheck, titleKey: "step4Title", descKey: "step4Desc" },
] as const;

const StepTimeline = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          steps.forEach((_, i) => {
            setTimeout(() => {
              setVisibleSteps((prev) => (prev.includes(i) ? prev : [...prev, i]));
            }, i * 150);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-8 md:py-12" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col items-center gap-1.5 mb-8 md:mb-10">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {t("stepTimeline.subtitle")}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
          {t("stepTimeline.headline")}
        </h2>
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        <div className="relative flex items-start justify-between gap-4">
          {/* Connector line */}
          <div className="absolute top-6 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isVisible = visibleSteps.includes(i);
            return (
              <div
                key={step.num}
                className={cn(
                  "relative z-10 flex-1 flex flex-col items-center text-center transition-all duration-500 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                {/* Numbered circle */}
                <div className="relative mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                    {step.num}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-20" />
                </div>

                {/* Icon */}
                <div className="mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {t(`stepTimeline.${step.titleKey}`)}
                </h3>

                {/* Desc */}
                <p className="text-xs leading-relaxed text-muted-foreground max-w-[180px]">
                  {t(`stepTimeline.${step.descKey}`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden">
        <div className={cn("relative", isRtl ? "pr-8" : "pl-8")}>
          {/* Vertical glowing line */}
          <div
            className={cn(
              "absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary to-primary/40",
              isRtl ? "right-[15px]" : "left-[15px]"
            )}
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isVisible = visibleSteps.includes(i);
            return (
              <div
                key={step.num}
                className={cn(
                  "relative flex items-start gap-4 transition-all duration-500 ease-out",
                  i < steps.length - 1 ? "pb-6" : "",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                {/* Circle on the line */}
                <div
                  className={cn(
                    "absolute top-0 z-10",
                    isRtl ? "-right-[1px]" : "-left-[1px]"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                    {step.num}
                  </div>
                </div>

                {/* Content */}
                <div className={cn("pt-1", isRtl ? "mr-6" : "ml-6")}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      {t(`stepTimeline.${step.titleKey}`)}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t(`stepTimeline.${step.descKey}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StepTimeline;
