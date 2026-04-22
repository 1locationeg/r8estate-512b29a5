import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { useReviewUrgencyTrigger } from "@/hooks/useReviewUrgencyTrigger";
import { fireCorridorEngage } from "@/lib/corridorEvents";

interface HighStakesReviewBannerProps {
  developerId: string;
  developerName: string;
  entityCategory?: string;
}

/**
 * Loss-framed urgency banner shown to users who viewed a developer 3+ times
 * but haven't left a review. Uses Prospect Theory framing to convert lurkers.
 */
export const HighStakesReviewBanner = ({
  developerId,
  developerName,
  entityCategory,
}: HighStakesReviewBannerProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { shouldShow, dismiss } = useReviewUrgencyTrigger(developerId);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasFiredShown, setHasFiredShown] = useState(false);

  useEffect(() => {
    if (shouldShow && !hasFiredShown) {
      fireCorridorEngage(2, "urgency_banner_shown");
      setHasFiredShown(true);
    }
  }, [shouldShow, hasFiredShown]);

  if (!shouldShow) return null;

  const handleCtaClick = () => {
    fireCorridorEngage(2, "urgency_banner_clicked");
    setModalOpen(true);
  };

  return (
    <>
      <section
        aria-label="high-stakes-review-cta"
        className="max-w-4xl mx-auto px-4 py-4"
      >
        <div
          className={`relative overflow-hidden rounded-xl border border-[hsl(var(--coin))]/30 bg-gradient-to-br from-[hsl(var(--coin))]/5 via-[hsl(var(--coin))]/10 to-orange-500/10 ${
            isRTL ? "border-r-4" : "border-l-4"
          } border-[hsl(var(--coin-strong,var(--coin)))] shadow-[0_0_24px_-8px_hsl(var(--coin)/0.4)] p-4 sm:p-5`}
        >
          {/* Subtle pulsing glow accent */}
          <div
            className="pointer-events-none absolute -top-12 -end-12 w-32 h-32 rounded-full bg-[hsl(var(--coin))]/20 blur-3xl animate-pulse"
            aria-hidden
          />

          {/* Dismiss */}
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("review.urgency.dismiss_aria", "Dismiss")}
            className={`absolute top-2 ${
              isRTL ? "left-2" : "right-2"
            } w-9 h-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Icon */}
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--coin))]/15 text-[hsl(var(--coin))]">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            {/* Copy */}
            <div className="flex-1 min-w-0 pe-8">
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                {t(
                  "review.urgency.headline",
                  "Your insight is the only thing standing between an investor and a bad decision."
                )}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {t(
                  "review.urgency.body",
                  "Every hour you delay, someone else risks their capital. Stop the risk — post your review."
                )}
              </p>

              <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
                <Button
                  onClick={handleCtaClick}
                  className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md"
                >
                  {t("review.urgency.cta", "Prevent a Bad Investment Now")}
                </Button>
                <span className="text-[11px] sm:text-xs text-muted-foreground">
                  {t(
                    "review.urgency.microcopy",
                    "⏱ 60 seconds · 🛡 Verified anonymously · ✨ +25 coins"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WriteReviewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        developerName={developerName}
        developerId={developerId}
        entityCategory={entityCategory}
      />
    </>
  );
};

export default HighStakesReviewBanner;