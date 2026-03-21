import { FileSearch, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface ContractCheckCardProps {
  onClick: () => void;
}

const ContractCheckCard = ({ onClick }: ContractCheckCardProps) => {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);

  // Auto-flip every 6s
  useEffect(() => {
    const interval = setInterval(() => setFlipped((f) => !f), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative h-full cursor-pointer"
      style={{ perspective: "600px" }}
      onClick={onClick}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-start gap-1.5 p-3 md:p-4 rounded-xl border border-border bg-card text-start group"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center animate-pulse-glow">
            <FileSearch className="w-4 h-4 text-brand-red" />
          </div>
          <span className="text-xs font-bold text-foreground leading-tight">
            {t("hero.qaLegal", "Check Your Contract")}
          </span>
          <span className="text-[10px] text-muted-foreground leading-snug">
            {t("hero.qaLegalDesc", "Spot risky clauses instantly")}
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-start gap-1.5 p-3 md:p-4 rounded-xl border border-primary/20 bg-card text-start"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            {t("hero.contractHealthTitle", "Contract Health")}
          </span>

          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[10px] text-foreground">{t("hero.contractTermOk1", "Payment Plan")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="text-[10px] text-foreground font-medium">{t("hero.contractTermRisk", "Penalty Clause")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[10px] text-foreground">{t("hero.contractTermOk2", "Handover Date")}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-auto text-primary">
            <Upload className="w-3 h-3" />
            <span className="text-[10px] font-semibold">{t("hero.contractUploadCta", "Upload yours →")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCheckCard;
