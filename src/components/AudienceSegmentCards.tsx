import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, Briefcase, HardHat, Sparkles, ArrowRight } from "lucide-react";

const segments = [
  {
    key: "buyers",
    icon: Home,
    gradient: "from-accent/20 to-accent/5",
    borderHover: "hover:border-accent/50",
    iconBg: "bg-accent/15 text-accent-foreground",
    cta: "/auth",
  },
  {
    key: "business",
    icon: Building2,
    gradient: "from-primary/15 to-primary/5",
    borderHover: "hover:border-primary/50",
    iconBg: "bg-primary/10 text-primary",
    cta: "/auth",
  },
  {
    key: "services",
    icon: Briefcase,
    gradient: "from-destructive/10 to-destructive/5",
    borderHover: "hover:border-destructive/40",
    iconBg: "bg-destructive/10 text-destructive",
    cta: "/auth",
  },
  {
    key: "professionals",
    icon: HardHat,
    gradient: "from-muted to-secondary",
    borderHover: "hover:border-muted-foreground/30",
    iconBg: "bg-muted text-muted-foreground",
    cta: "/auth",
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
    <section ref={sectionRef} className="w-full py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-primary">
            {t("audience.badge", "AI-Matched Experience")}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t("audience.headline", "Built for every player in real estate")}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t("audience.subtitle", "Select your role — we'll tailor everything to your goals")}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {segments.map((seg, idx) => {
          const Icon = seg.icon;
          return (
            <Card
              key={seg.key}
              onClick={() => navigate(seg.cta)}
              className={`
                group relative cursor-pointer overflow-hidden border
                bg-gradient-to-br ${seg.gradient} ${seg.borderHover}
                transition-all duration-500 ease-out
                hover:shadow-lg hover:-translate-y-1
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
              style={{ transitionDelay: visible ? `${idx * 120}ms` : "0ms" }}
            >
              {/* AI shimmer line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="p-4 md:p-5 flex flex-col items-center text-center gap-3">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${seg.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
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
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
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
