import { Scale, Upload, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface ContractCheckCardProps {
  onClick: () => void;
}

const terms = [
  { key: "hero.contractTermOk1", fallback: "Payment Plan", status: "ok" as const, Icon: CheckCircle2 },
  { key: "hero.contractTermRisk", fallback: "Penalty Clause", status: "risk" as const, Icon: AlertTriangle },
  { key: "hero.contractTermWarn", fallback: "Handover Date", status: "warn" as const, Icon: AlertCircle },
];

const statusStyles = {
  ok: { text: "text-trust-excellent", border: "border-trust-excellent/30", icon: "text-trust-excellent", headerIcon: "text-trust-excellent" },
  risk: { text: "text-destructive font-semibold", border: "border-destructive/30", icon: "text-destructive", headerIcon: "text-destructive" },
  warn: { text: "text-accent", border: "border-accent/30", icon: "text-accent", headerIcon: "text-accent" },
};

const ContractCheckCard = ({ onClick }: ContractCheckCardProps) => {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % terms.length);
        setFading(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = terms[activeIdx];
  const style = statusStyles[current.status];
  const StatusIcon = current.Icon;

  return (
    <button
      onClick={onClick}
      className={`relative h-full w-full flex flex-col items-center gap-1 p-3 md:p-4 rounded-xl border bg-card text-center transition-colors duration-300 cursor-pointer ${style.border}`}
    >
      <div className="flex items-center gap-1.5">
        <Scale className={`w-4 h-4 transition-colors duration-300 ${style.headerIcon}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {t("hero.contractHealthTitle", "Contract Health")}
        </span>
      </div>

      <div
        className={`flex flex-col items-center justify-center flex-1 gap-1 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <StatusIcon className={`w-7 h-7 ${style.icon}`} />
        <span className={`text-[11px] leading-tight text-center ${style.text}`}>
          {t(current.key, current.fallback)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1.5 w-full mt-auto">
        <div className="flex items-center gap-1.5 text-primary animate-pulse">
          <Upload className="w-5 h-5" />
          <span className="text-[11px] font-bold">{t("hero.contractUploadCta", "Upload yours →")}</span>
        </div>
        <div className="flex gap-1">
          {terms.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${i === activeIdx ? "bg-primary" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </button>
  );
};

export default ContractCheckCard;
