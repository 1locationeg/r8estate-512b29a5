import { useState, useEffect, useRef } from "react";
import { MessageSquare, Building2, Users, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/utils/formatArabic";

function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

const stats = [
  { target: 50000, icon: MessageSquare, colorClass: "text-accent", suffix: "K+", labelKey: "stats.verifiedReviews" },
  { target: 1200, icon: Building2, colorClass: "text-accent", suffix: "+", labelKey: "stats.trustedCompanies" },
  { target: 100000, icon: Users, colorClass: "text-accent", suffix: "K+", labelKey: "stats.activeUsers" },
  { target: 96, icon: CheckCircle, colorClass: "text-accent", suffix: "%", labelKey: "stats.successRate" },
];

export function TractionStats() {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const v1 = useCountUp(50, 1800, visible);
  const v2 = useCountUp(1200, 1800, visible);
  const v3 = useCountUp(100, 1800, visible);
  const v4 = useCountUp(96, 1800, visible);
  const values = [v1, v2, v3, v4];

  const visibleStats = stats.filter((s, i) => {
    // On render we include all, CSS handles hideMobile
    return true;
  });

  return (
    <div ref={ref} className="w-full max-w-[1100px] mx-auto">
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const displayVal = s.suffix === "K+" ? `${formatNumber(values[i], i18n.language)}K+` : s.suffix === "%" ? `${formatNumber(values[i], i18n.language)}%` : `${formatNumber(values[i], i18n.language)}+`;
          return (
            <div
              key={s.labelKey}
              className="flex flex-col items-center gap-0.5 py-0 px-2"
            >
              <Icon className="w-3.5 h-3.5 text-brand-red" />
              <span className={`text-sm md:text-base font-extrabold ${s.colorClass} tabular-nums leading-none`}>
                {displayVal}
              </span>
              <span className="text-[9px] md:text-[11px] font-semibold text-foreground leading-none text-center">
                {t(s.labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
