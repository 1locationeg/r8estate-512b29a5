import { useState, useEffect, useRef } from "react";
import { MessageSquare, Building2, Users, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

function useCountUp(target: number, duration = 2000, start = false, isPercent = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function formatNum(n: number, suffix: string) {
  if (suffix === "K+") return n >= 1000 ? (n / 1000).toFixed(0) + "K+" : n + "K+";
  return n.toLocaleString() + "+";
}

const stats = [
  { target: 50000, icon: MessageSquare, colorClass: "text-primary", suffix: "K+", labelKey: "stats.verifiedReviews", descKey: "stats.verifiedReviewsDesc" },
  { target: 1200, icon: Building2, colorClass: "text-accent", suffix: "+", labelKey: "stats.trustedCompanies", descKey: "stats.trustedCompaniesDesc", hideMobile: true },
  { target: 100000, icon: Users, colorClass: "text-verified", suffix: "K+", labelKey: "stats.activeUsers", descKey: "stats.activeUsersDesc" },
  { target: 96, icon: CheckCircle, colorClass: "text-trust-high", suffix: "%", labelKey: "stats.successRate", descKey: "stats.successRateDesc" },
];

export function TractionStats() {
  const { t } = useTranslation();
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

  return (
    <div ref={ref} className="flex items-start justify-center gap-4 md:gap-8 mt-4 flex-wrap">
      {stats.map((s, i) => {
        const Icon = s.icon;
        const displayVal = s.suffix === "K+" ? `${values[i]}K+` : s.suffix === "%" ? `${values[i]}%` : `${values[i].toLocaleString()}+`;
        return (
          <div
            key={s.labelKey}
            className={`flex flex-col items-center gap-0.5 ${s.hideMobile ? "hidden sm:flex" : "flex"}`}
          >
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${s.colorClass} mb-0.5`} />
            <span className={`text-lg md:text-2xl font-extrabold ${s.colorClass} tabular-nums`}>
              {displayVal}
            </span>
            <span className="text-[11px] md:text-xs font-semibold text-foreground">
              {t(s.labelKey)}
            </span>
            <span className="text-[10px] md:text-[11px] text-muted-foreground text-center max-w-[100px]">
              {t(s.descKey)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
