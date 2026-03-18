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
  { target: 1200, icon: Building2, colorClass: "text-accent", suffix: "+", labelKey: "stats.trustedCompanies", hideMobile: true },
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
    <div ref={ref} className="mt-3 mb-1 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm px-3 py-2.5 md:px-5 md:py-3">
      <div className="flex items-center justify-center">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const displayVal = s.suffix === "K+" ? `${formatNumber(values[i], i18n.language)}K+` : s.suffix === "%" ? `${formatNumber(values[i], i18n.language)}%` : `${formatNumber(values[i], i18n.language)}+`;
          return (
            <div key={s.labelKey} className="contents">
              {/* Divider */}
              {i > 0 && (
                <div className={`w-px h-8 bg-border/50 mx-3 md:mx-5 ${s.hideMobile ? 'hidden sm:block' : ''}`} />
              )}
              <div
                className={`flex flex-col items-center gap-0.5 ${s.hideMobile ? "hidden sm:flex" : "flex"}`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-red mb-0.5" />
                <span className={`text-base md:text-xl font-extrabold ${s.colorClass} tabular-nums leading-none`}>
                  {displayVal}
                </span>
                <span className="text-[10px] md:text-xs font-semibold text-foreground leading-none">
                  {t(s.labelKey)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
