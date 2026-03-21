import { FileSearch, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface ContractCheckCardProps {
  onClick: () => void;
}

const terms = [
  { key: "hero.contractTermOk1", fallback: "Payment Plan", status: "ok" as const },
  { key: "hero.contractTermRisk", fallback: "Penalty Clause", status: "risk" as const },
  { key: "hero.contractTermWarn", fallback: "Handover Date", status: "warn" as const },
];

const statusStyles = {
  ok: { dot: "bg-green-500", text: "text-green-600", border: "border-green-500/30", icon: "text-green-500" },
  risk: { dot: "bg-red-500", text: "text-red-600 font-semibold", border: "border-red-500/30", icon: "text-red-500" },
  warn: { dot: "bg-amber-500", text: "text-amber-600", border: "border-amber-500/30", icon: "text-amber-500" },
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

  return (
    <button
      onClick={onClick}
      className={`relative h-full w-full flex flex-col items-start gap-1.5 p-3 md:p-4 rounded-xl border bg-card text-start transition-colors duration-300 cursor-pointer ${style.border}`}
    >
      <div className="flex items-center gap-1.5">
        <FileSearch className={`w-4 h-4 transition-colors duration-300 ${style.icon}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {t("hero.contractHealthTitle", "Contract Health")}
        </span>
      </div>

      <div
        className={`flex items-center gap-2 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
        <span className={`text-xs leading-tight transition-colors duration-300 ${style.text}`}>
          {t(current.key, current.fallback)}
        </span>
      </div>

      <div className="flex items-center justify-between w-full mt-auto">
        <div className="flex gap-1">
          {terms.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${i === activeIdx ? style.dot : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Upload className="w-3 h-3" />
          <span className="text-[10px] font-semibold">{t("hero.contractUploadCta", "Upload yours →")}</span>
        </div>
      </div>
    </button>
  );
};

export default ContractCheckCard;
