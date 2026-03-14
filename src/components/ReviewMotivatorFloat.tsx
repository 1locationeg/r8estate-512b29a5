import { useState, useEffect } from "react";
import { PenLine, X, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useBuyerGamification } from "@/hooks/useBuyerGamification";
import { cn } from "@/lib/utils";

interface ReviewMotivatorFloatProps {
  onWriteReview: () => void;
  isReviewModalOpen?: boolean;
}

export const ReviewMotivatorFloat = ({
  onWriteReview,
  isReviewModalOpen = false,
}: ReviewMotivatorFloatProps) => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const {
    lockedBadges,
    isLoading: gamLoading,
  } = useBuyerGamification();

  // 3-second entrance delay
  useEffect(() => {
    if (!user || dismissed || isReviewModalOpen) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [user, dismissed, isReviewModalOpen]);

  if (!user || dismissed || isReviewModalOpen || !visible) return null;

  // Find the next review-related badge the user can earn
  const reviewBadge = lockedBadges.find(
    (b) => b.id === "first_review" || b.id === "review_pro"
  );

  const badgePoints = reviewBadge?.points ?? 25;
  const badgeName = reviewBadge?.name ?? "Review Badge";

  return (
    <div
      className={cn(
        "sticky bottom-4 z-30 ml-auto w-full max-w-[300px]",
        "rounded-xl border border-border/60 bg-card/80 backdrop-blur-lg shadow-lg",
        "p-4 transition-all duration-500 ease-out",
        "animate-fade-in",
        "md:max-w-[280px]"
      )}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <PenLine className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            Share your experience!
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Help others make better decisions
          </p>

          {/* Rewards preview */}
          {!gamLoading && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 gap-1 animate-pulse"
              >
                <Sparkles className="w-3 h-3 text-accent-foreground" />
                +{badgePoints} pts
              </Badge>
              {reviewBadge && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 gap-1"
                >
                  <Trophy className="w-3 h-3" />
                  {badgeName}
                </Badge>
              )}
            </div>
          )}

          {/* CTA */}
          <Button
            size="sm"
            onClick={onWriteReview}
            className="mt-3 h-7 text-xs gap-1.5 w-full"
          >
            <PenLine className="w-3.5 h-3.5" />
            Write a Review
          </Button>
        </div>
      </div>
    </div>
  );
};
