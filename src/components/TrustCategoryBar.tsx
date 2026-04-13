import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TrustCategoryBarProps {
  label: string;
  percentage: number;
}

export const TrustCategoryBar = ({ label, percentage }: TrustCategoryBarProps) => {
  const getColorClass = (value: number) => {
    if (value >= 66) return "bg-trust-excellent";
    if (value >= 50) return "bg-trust-good";
    return "bg-trust-fair";
  };

  const getTextColorClass = (value: number) => {
    if (value >= 66) return "text-trust-excellent";
    if (value >= 50) return "text-trust-good";
    return "text-trust-fair";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm gap-2 min-w-0">
        <span className="text-muted-foreground truncate min-w-0">{label}</span>
        <span className={cn("font-semibold shrink-0", getTextColorClass(percentage))}>
          {percentage}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full transition-all", getColorClass(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
