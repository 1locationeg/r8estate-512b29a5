import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface TrustCategoryBarProps {
  label: string;
  percentage: number;
  source?: "reviews" | "estimated";
  sampleSize?: number;
}

export const TrustCategoryBar = ({
  label,
  percentage,
  source,
  sampleSize,
}: TrustCategoryBarProps) => {
  const { t } = useTranslation();
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

  const isEstimated = source === "estimated";
  const meta =
    source === "reviews" && sampleSize
      ? t("trustMethod.source.fromReviews", { count: sampleSize, defaultValue: "{{count}} reviews" })
      : isEstimated
      ? t("trustMethod.source.estimated", "Estimated")
      : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm gap-2 min-w-0">
        <span className="text-muted-foreground truncate min-w-0">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {meta && (
            <span
              className={cn(
                "text-[10px] uppercase tracking-wide",
                isEstimated ? "text-muted-foreground/70" : "text-muted-foreground"
              )}
              title={
                isEstimated
                  ? t(
                      "trustMethod.source.estimatedTip",
                      "No reviewers rated this category yet — estimated from overall score."
                    )
                  : undefined
              }
            >
              {meta}
            </span>
          )}
          <span className={cn("font-semibold", getTextColorClass(percentage))}>
            {percentage}%
          </span>
        </div>
      </div>
      <div
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
          isEstimated && "border border-dashed border-muted-foreground/30 bg-transparent"
        )}
      >
        <div
          className={cn(
            "h-full transition-all",
            getColorClass(percentage),
            isEstimated && "opacity-60"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
