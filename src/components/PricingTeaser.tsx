import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Building2, Zap } from "lucide-react";

const plans = [
  { key: "free", icon: Zap, highlight: false },
  { key: "pro", icon: Sparkles, highlight: true },
  { key: "business", icon: Building2, highlight: false },
] as const;

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
            onClick={() => { window.dispatchEvent(new CustomEvent("corridor:engage", { detail: { zone: 3, action: "pricing_view" } })); navigate("/auth"); }}
            className={`cursor-pointer p-3 sm:p-4 text-center transition-all hover:shadow-md ${
              highlight
                ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                : "border-border hover:border-primary/30"
            }`}
          >
            <Icon className={`w-5 h-5 mx-auto mb-1.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
            <p className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
              {t(`pricingTeaser.${key}.title`)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t(`pricingTeaser.${key}.desc`)}
            </p>
            {highlight && (
              <Badge variant="secondary" className="mt-2 text-[10px]">
                {t("pricingTeaser.popular")}
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
