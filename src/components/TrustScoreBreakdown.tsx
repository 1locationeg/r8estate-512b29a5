import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Star, Users, ShieldCheck, Clock, Info, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type TrustScoreBreakdown as Breakdown,
  trustColorClass,
  trustBgClass,
} from "@/lib/trustScoreCalculator";

interface TrustScoreBreakdownProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  breakdown: Breakdown;
  developerName: string;
}

interface PillarRowProps {
  icon: React.ReactNode;
  label: string;
  detail: string;
  points: number;
  max: number;
  tooltip: string;
}

const PillarRow = ({ icon, label, detail, points, max, tooltip }: PillarRowProps) => {
  const pct = max > 0 ? (points / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground shrink-0">{icon}</span>
          <span className="font-medium text-foreground truncate">{label}</span>
          <span
            className="shrink-0 text-muted-foreground/60 cursor-help"
            title={tooltip}
          >
            <Info className="w-3 h-3" />
          </span>
        </div>
        <div className="text-xs text-muted-foreground shrink-0 tabular-nums">
          <span className="font-semibold text-foreground">{points}</span> / {max}
        </div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
};

export const TrustScoreBreakdownModal = ({
  open,
  onOpenChange,
  breakdown,
  developerName,
}: TrustScoreBreakdownProps) => {
  const { t } = useTranslation();
  const { pillars, total, isEstimated, confidence, categoryScores } = breakdown;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold", trustColorClass(total))}>
              {total}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {t("trustMethod.title", "How this Trust Score was earned")}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {developerName} — {t(`trustMethod.confidence.${confidence}`, confidence)}
          </DialogDescription>
        </DialogHeader>

        {/* Pillars */}
        <div className="space-y-4 py-2">
          <PillarRow
            icon={<Star className="w-4 h-4" />}
            label={t("trustMethod.pillar.rating.label", "What reviewers say")}
            tooltip={t(
              "trustMethod.pillar.rating.tooltip",
              "Average star rating across all approved reviews, scaled to 60 points."
            )}
            detail={t("trustMethod.pillar.rating.detail", {
              avg: pillars.rating.avgRating.toFixed(1),
              count: pillars.rating.reviewCount,
              defaultValue: "{{avg}}★ average from {{count}} reviews",
            })}
            points={pillars.rating.points}
            max={pillars.rating.max}
          />
          <PillarRow
            icon={<Users className="w-4 h-4" />}
            label={t("trustMethod.pillar.volume.label", "Sample size")}
            tooltip={t(
              "trustMethod.pillar.volume.tooltip",
              "More reviews = more reliable signal. Full credit at 100+ reviews."
            )}
            detail={t("trustMethod.pillar.volume.detail", {
              count: pillars.volume.reviewCount,
              defaultValue: "{{count}} total reviews",
            })}
            points={pillars.volume.points}
            max={pillars.volume.max}
          />
          <PillarRow
            icon={<ShieldCheck className="w-4 h-4" />}
            label={t("trustMethod.pillar.verification.label", "Verified reviewers")}
            tooltip={t(
              "trustMethod.pillar.verification.tooltip",
              "Share of reviews from buyers with verified identity or proof of purchase."
            )}
            detail={t("trustMethod.pillar.verification.detail", {
              count: pillars.verification.verifiedCount,
              pct: Math.round(pillars.verification.ratio * 100),
              defaultValue: "{{count}} verified ({{pct}}%)",
            })}
            points={pillars.verification.points}
            max={pillars.verification.max}
          />
          <PillarRow
            icon={<Clock className="w-4 h-4" />}
            label={t("trustMethod.pillar.recency.label", "Freshness")}
            tooltip={t(
              "trustMethod.pillar.recency.tooltip",
              "Share of reviews submitted in the last 90 days. Recent activity matters."
            )}
            detail={t("trustMethod.pillar.recency.detail", {
              count: pillars.recency.recentCount,
              defaultValue: "{{count}} reviews in the last 90 days",
            })}
            points={pillars.recency.points}
            max={pillars.recency.max}
          />

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-semibold text-foreground">
              {t("trustMethod.total", "Total")}
            </span>
            <span className={cn("text-lg font-bold tabular-nums", trustColorClass(total))}>
              {total} / 100
            </span>
          </div>

          {isEstimated && (
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              {t(
                "trustMethod.estimatedNotice",
                "No reviews on file yet — score is estimated from seed data and will recalculate as real reviews arrive."
              )}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="pt-2 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            {t("trustMethod.categories.title", "Category breakdown")}
          </h4>
          <ul className="space-y-2">
            {categoryScores.map((c) => (
              <li
                key={c.key}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      c.source === "reviews" ? trustBgClass(c.score) : "bg-muted-foreground/40"
                    )}
                  />
                  <span className="text-foreground truncate">{t(c.labelKey)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground">
                    {c.source === "reviews"
                      ? t("trustMethod.source.fromReviews", {
                          count: c.sampleSize,
                          defaultValue: "{{count}} reviews",
                        })
                      : t("trustMethod.source.estimated", "Estimated")}
                  </span>
                  <span className={cn("font-semibold tabular-nums", trustColorClass(c.score))}>
                    {c.score}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t(
              "trustMethod.categories.footnote",
              "Categories marked Estimated will become data-backed once at least one reviewer rates them."
            )}
          </p>
        </div>

        <Link
          to="/about/trust-meter"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-2"
          onClick={() => onOpenChange(false)}
        >
          {t("trustMethod.readFull", "Read the full Trust Meter methodology")}
          <ExternalLink className="w-3 h-3" />
        </Link>
      </DialogContent>
    </Dialog>
  );
};