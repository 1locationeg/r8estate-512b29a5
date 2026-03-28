import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, GitCompare, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEVELOPERS = [
  { name: "Palm Hills", metrics: [4.2, 78, 85] },
  { name: "Ora Developers", metrics: [3.1, 52, 61] },
];

const CompareEngineShowcase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const metricKeys = ["trustScore", "deliveryQuality", "valueForMoney"] as const;
  const maxValues = [5, 100, 100];

  const getBarColor = (value: number, max: number) => {
    const normalized = max === 5 ? value : value / (max / 5);
    return normalized >= 3.5 ? "bg-accent" : "bg-destructive/70";
  };

  const getTextColor = (value: number, max: number) => {
    const normalized = max === 5 ? value : value / (max / 5);
    return normalized >= 3.5 ? "text-accent" : "text-destructive";
  };

  const formatValue = (value: number, max: number) =>
    max === 5 ? value.toFixed(1) : `${value}%`;

  return (
    <section ref={sectionRef} className="w-full py-10 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 animate-[shimmer_2s_ease-in-out_infinite]">
          <Sparkles className="w-3.5 h-3.5" />
          {t("compareEngine.subtitle")}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("compareEngine.headline")}
        </h2>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
        {DEVELOPERS.map((dev, devIdx) => {
          const isWinner = dev.metrics[0] > DEVELOPERS[1 - devIdx].metrics[0];
          return (
            <div
              key={dev.name}
              className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30"
            >
              {isWinner && (
                <div className="absolute -top-3 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">
                  <Crown className="w-3 h-3" /> Leader
                </div>
              )}
              <h3 className="font-semibold text-foreground mb-4 text-sm">{dev.name}</h3>

              <div className="space-y-3">
                {metricKeys.map((key, i) => {
                  const value = dev.metrics[i];
                  const max = maxValues[i];
                  const widthPct = max === 5 ? (value / 5) * 100 : value;

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {t(`compareEngine.${key}`)}
                        </span>
                        <span className={`text-xs font-bold ${getTextColor(value, max)}`}>
                          {formatValue(value, max)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(value, max)}`}
                          style={{
                            width: animated ? `${widthPct}%` : "0%",
                            transitionDelay: `${devIdx * 200 + i * 150}ms`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* VS badge (desktop) */}
      <div className="hidden md:flex justify-center -mt-[calc(50%_-_2rem)] mb-[calc(50%_-_2rem)] relative z-10 pointer-events-none">
        <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
          VS
        </span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 opacity-80 cursor-not-allowed border-dashed"
          onClick={() => navigate("/auth")}
        >
          <Lock className="w-3.5 h-3.5" />
          {t("compareEngine.exportReport")}
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-accent/20 text-accent">
            {t("compareEngine.proBadge")}
          </span>
        </Button>
        <Button size="sm" className="gap-2" onClick={() => navigate("/categories")}>
          <GitCompare className="w-3.5 h-3.5" />
          {t("compareEngine.compareNow")}
        </Button>
      </div>

      {/* Footer text */}
      <p className="text-center text-[11px] text-muted-foreground mt-4">
        {t("compareEngine.poweredBy")}
      </p>
    </section>
  );
};

export default CompareEngineShowcase;
