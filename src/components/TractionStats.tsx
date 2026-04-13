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
  { target: 50000, icon: MessageSquare, suffix: "K+", labelKey: "stats.verifiedReviews" },
  { target: 1200, icon: Building2, suffix: "+", labelKey: "stats.trustedCompanies" },
  { target: 100000, icon: Users, suffix: "K+", labelKey: "stats.activeUsers" },
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
  const values = [v1, v2, v3];

  const visibleStats = stats.filter((s, i) => {
    // On render we include all, CSS handles hideMobile
    return true;
  });

  return (
    <div ref={ref} className="w-full max-w-[1100px] mx-auto">
      {/* Desktop: centered grid */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const displayVal = s.suffix === "K+" ? `${formatNumber(values[i], i18n.language)}K+` : s.suffix === "%" ? `${formatNumber(values[i], i18n.language)}%` : `${formatNumber(values[i], i18n.language)}+`;
          return (
            <div key={s.labelKey} className="flex flex-col items-center gap-1 py-0 px-2">
              <Icon className="w-3.5 h-3.5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
              <span className="text-base font-bold text-foreground tabular-nums leading-none">{displayVal}</span>
              <span className="text-[11px] font-medium text-muted-foreground leading-none text-center whitespace-nowrap">{t(s.labelKey)}</span>
            </div>
          );
        })}
      </div>
      {/* Mobile: horizontal scroll pill chips */}
      <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide px-1 pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          const displayVal = s.suffix === "K+" ? `${formatNumber(values[i], i18n.language)}K+` : s.suffix === "%" ? `${formatNumber(values[i], i18n.language)}%` : `${formatNumber(values[i], i18n.language)}+`;
          return (
            <div key={s.labelKey} className="flex items-center gap-2 min-h-[44px] shrink-0 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-3.5 py-2">
              <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-bold text-foreground tabular-nums whitespace-nowrap">{displayVal}</span>
              <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap">{t(s.labelKey)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
