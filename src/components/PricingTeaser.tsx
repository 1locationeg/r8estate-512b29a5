import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Building2, Zap, Check } from "lucide-react";

const plans = [
  { key: "free", icon: Zap, highlight: false },
  { key: "pro", icon: Sparkles, highlight: true },
  { key: "business", icon: Building2, highlight: false },
] as const;

const proBenefits = [
  "Unlimited trust reports",
  "AI-powered insights",
  "Priority deal alerts",
  "Developer deep-dives",
  "Contract risk scanner",
];

export function PricingTeaser() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="px-3 sm:px-4 md:px-8 lg:px-12">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("pricingTeaser.label")}
        </span>
        <Badge className="bg-accent/15 text-accent-foreground border-accent/30 text-[10px] px-1.5 py-0">
          {t("pricingTeaser.new")}
        </Badge>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">
        {t("pricingTeaser.headline")}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {plans.map(({ key, icon: Icon, highlight }) => (
          <Card
            key={key}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("corridor:engage", { detail: { zone: 3, action: "pricing_view" } }));
              navigate("/auth");
            }}
            className={`cursor-pointer p-3 sm:p-4 text-center transition-all hover:shadow-md relative overflow-hidden ${
              highlight
                ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20 row-span-2"
                : "border-border hover:border-primary/30"
            }`}
          >
            {/* Highlight glow for Pro */}
            {highlight && (
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            )}

            <Icon className={`w-5 h-5 mx-auto mb-1.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
            <p className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
              {t(`pricingTeaser.${key}.title`)}
            </p>

            {/* Price block for Pro */}
            {highlight && (
              <div className="mt-2 mb-1">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-2xl font-black text-primary tabular-nums">
                    {t("pricingTeaser.pro.price")}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {t("pricingTeaser.pro.currency")}{t("pricingTeaser.pro.period")}
                  </span>
                </div>
                <p className="text-[9px] text-primary/70 font-medium mt-0.5 italic">
                  {t("pricingTeaser.pro.value")}
                </p>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {t(`pricingTeaser.${key}.desc`)}
            </p>

            {/* Benefits list for Pro */}
            {highlight && (
              <ul className="mt-2 space-y-1 text-left">
                {proBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-1.5 text-[10px] text-foreground/80">
                    <Check className="w-3 h-3 text-primary shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {highlight && (
              <>
                <Badge variant="secondary" className="mt-2.5 text-[10px]">
                  {t("pricingTeaser.popular")}
                </Badge>
                <p className="text-[9px] text-muted-foreground mt-1">
                  🔒 Cancel anytime · No lock-in
                </p>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
