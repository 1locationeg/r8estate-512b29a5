import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Home, Building2, Briefcase, HardHat, Sparkles, ArrowRight } from "lucide-react";

const segments = [
  {
    key: "buyers",
    icon: Home,
    cta: "/auth",
    color: {
      iconBg: "bg-buyers/10",
      iconText: "text-buyers",
      hoverBorder: "hover:border-buyers/30",
      hoverShadow: "hover:shadow-[0_0_20px_-6px_hsl(var(--buyers)/0.2)]",
      ctaText: "text-buyers",
    },
  },
  {
    key: "developers",
    icon: Building2,
    cta: "/auth",
    color: {
      iconBg: "bg-business-border/10",
      iconText: "text-business-border",
      hoverBorder: "hover:border-business-border/30",
      hoverShadow: "hover:shadow-[0_0_20px_-6px_hsl(var(--business-border)/0.2)]",
      ctaText: "text-business-border",
    },
  },
  {
    key: "services",
    icon: Briefcase,
    cta: "/auth",
    color: {
      iconBg: "bg-services/10",
      iconText: "text-services",
      hoverBorder: "hover:border-services/30",
      hoverShadow: "hover:shadow-[0_0_20px_-6px_hsl(var(--services)/0.2)]",
      ctaText: "text-services",
    },
  },
  {
    key: "professionals",
    icon: HardHat,
    cta: "/auth",
    color: {
      iconBg: "bg-professionals/10",
      iconText: "text-professionals",
      hoverBorder: "hover:border-professionals/30",
      hoverShadow: "hover:shadow-[0_0_20px_-6px_hsl(var(--professionals)/0.2)]",
      ctaText: "text-professionals",
    },
  },
];

export const AudienceSegmentCards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full">
      {/* Unified header */}
      <div className="flex flex-col items-center gap-1.5 mb-6 md:mb-8">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 rounded-full px-3.5 py-1.5 border border-primary/15">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {t("audience.badge", "AI-Matched Experience")}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {t("audience.headline", "Built for every player in real estate")}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto text-center">
          {t("audience.subtitle", "Select your role — we'll tailor everything to your goals")}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {segments.map((seg, idx) => {
          const Icon = seg.icon;
          const c = seg.color;
          return (
            <Card
              key={seg.key}
              onClick={() => navigate(seg.cta)}
              className={`
                group relative cursor-pointer overflow-hidden
                border border-border/60 bg-card/80 backdrop-blur-sm
                transition-all duration-500 ease-out
                ${c.hoverBorder} ${c.hoverShadow} hover:-translate-y-1
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
              `}
              style={{ transitionDelay: visible ? `${idx * 120}ms` : "0ms" }}
            >
              <div className="p-4 md:p-5 flex flex-col items-center text-center gap-3">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${c.iconText}`} />
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {t(`audience.${seg.key}.title`)}
                </h3>

                {/* Pitch */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {t(`audience.${seg.key}.pitch`)}
                </p>

                {/* CTA arrow */}
                <div className="mt-auto pt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${c.ctaText} opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-0 group-hover:translate-x-1`}>
                    {t(`audience.${seg.key}.cta`, t("audience.getStarted", "Get started"))}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
