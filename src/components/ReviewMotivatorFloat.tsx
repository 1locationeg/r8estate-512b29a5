import { useState, useEffect } from "react";
import { PenLine, X, Sparkles, Trophy, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useBuyerGamification } from "@/hooks/useBuyerGamification";
import { cn } from "@/lib/utils";

const MOTIVATOR_HOOKS = [
  { text: "Your review could save someone millions 💰", sub: "Real experiences protect real buyers" },
  { text: "47 people searched a developer today — help them decide 🔍", sub: "Be the voice they need" },
  { text: "Earn your Trusted Reviewer badge ⭐", sub: "Build your reputation on R8ESTATE" },
  { text: "One review, thousands protected 🛡️", sub: "Your story matters more than you think" },
  { text: "Join 1,200+ reviewers making a difference ✍️", sub: "Egypt's most trusted community" },
];

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
  const [expanded, setExpanded] = useState(false);
  const [hookIndex, setHookIndex] = useState(0);

  const { lockedBadges, isLoading: gamLoading } = useBuyerGamification();

  // 3-second entrance delay
  useEffect(() => {
    if (dismissed || isReviewModalOpen) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [dismissed, isReviewModalOpen]);

  // Auto-expand briefly to draw attention, then collapse
  useEffect(() => {
    if (!visible) return;
    setExpanded(true);
    const timer = setTimeout(() => setExpanded(false), 5000);
    return () => clearTimeout(timer);
  }, [visible]);

  // Rotate hooks every 6 seconds when expanded
  useEffect(() => {
    if (!expanded) return;
    const interval = setInterval(() => {
      setHookIndex((prev) => (prev + 1) % MOTIVATOR_HOOKS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [expanded]);

  if (dismissed || isReviewModalOpen || !visible) return null;

  const currentHook = MOTIVATOR_HOOKS[hookIndex];
  const reviewBadge = lockedBadges.find(
    (b) => b.id === "first_review" || b.id === "review_pro"
  );
  const badgePoints = reviewBadge?.points ?? 25;

  return (
    <div className="fixed bottom-20 md:bottom-6 start-6 z-40 flex flex-col items-start gap-2">
      {/* Expanded popover card */}
      {expanded && (
        <div
          className={cn(
            "w-[260px] rounded-xl border border-border/60 bg-card/95 backdrop-blur-lg shadow-xl p-3.5",
            "animate-in fade-in slide-in-from-bottom-4 duration-300"
          )}
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 end-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <p className="text-sm font-semibold text-foreground leading-tight pe-4 transition-all duration-300">
            {currentHook.text}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentHook.sub}
          </p>

          {/* Rewards with pulsing coin */}
          {!gamLoading && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 gap-1"
              >
                <Coins className="w-3 h-3 text-coin animate-pulse" />
                +{badgePoints} pts
              </Badge>
              {reviewBadge && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 gap-1"
                >
                  <Trophy className="w-3 h-3" />
                  {reviewBadge.name}
                </Badge>
              )}
            </div>
          )}

          <Button
            size="sm"
            onClick={onWriteReview}
            className="mt-2.5 h-7 text-xs gap-1.5 w-full"
          >
            <PenLine className="w-3.5 h-3.5" />
            {user ? "Write a Review" : "Sign in to Review"}
          </Button>
        </div>
      )}

      {/* FAB icon */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "shadow-[0_0_12px_hsl(var(--primary)/0.3)]",
          visible && "animate-bounce-in"
        )}
        aria-label="Write a review"
      >
        {expanded ? (
          <X className="w-5 h-5" />
        ) : (
          <PenLine className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
