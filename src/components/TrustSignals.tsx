import { Shield, Lock, Mail, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface TrustSignalsProps {
  className?: string;
  compact?: boolean;
}

export const TrustSignals = ({ className, compact = false }: TrustSignalsProps) => {
  const { t } = useTranslation();

  const signals = [
    {
      icon: Shield,
      text: t("trustSignals.reviewProtected", "Your review is protected"),
      color: "text-verified",
    },
    {
      icon: Lock,
      text: t("trustSignals.encrypted", "256-bit encrypted"),
      color: "text-primary",
    },
    {
      icon: Mail,
      text: t("trustSignals.noSpam", "We never spam"),
      color: "text-accent",
    },
    {
      icon: Eye,
      text: t("trustSignals.anonymousOption", "Anonymous option available"),
      color: "text-muted-foreground",
    },
  ];

  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3 text-xs text-muted-foreground", className)}>
        {signals.slice(0, 3).map((signal, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <signal.icon className={cn("w-3 h-3", signal.color)} />
            {signal.text}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {signals.map((signal, i) => (
        <div
          key={i}
          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/50"
        >
          <signal.icon className={cn("w-4 h-4 shrink-0", signal.color)} />
          <span className="text-xs text-muted-foreground">{signal.text}</span>
        </div>
      ))}
    </div>
  );
};
