import { useEffect, useState } from 'react';
import { CheckCircle2, Trophy, Star, PartyPopper, Eye, Coins, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { getReviewerTier, getNextReviewerTier } from '@/components/ReviewerBadge';
import { useNavigate } from 'react-router-dom';

interface ReviewSuccessOverlayProps {
  open: boolean;
  onClose: () => void;
  isFirstReview?: boolean;
  developerName?: string;
  rating?: number;
  totalReviews?: number;
}

export function ReviewSuccessOverlay({
  open,
  onClose,
  isFirstReview = false,
  developerName = '',
  rating = 5,
  totalReviews = 1,
}: ReviewSuccessOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const navigate = useNavigate();

  const currentTier = getReviewerTier(totalReviews);
  const nextTier = getNextReviewerTier(totalReviews);

  useEffect(() => {
    if (open) {
      const t1 = setTimeout(() => setShowContent(true), 200);
      const t2 = setTimeout(() => setConfettiTrigger(true), 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setShowContent(false);
      setConfettiTrigger(false);
    }
  }, [open]);

  if (!open) return null;

  const shareOnWhatsApp = () => {
    const text = `I just reviewed ${developerName} on R8ESTATE! Help others make better real estate decisions 🏠⭐`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `Just shared my experience with ${developerName} on @R8ESTATE. Transparency matters in Egyptian real estate! 🏠`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <ConfettiCelebration trigger={confettiTrigger} duration={4000} particleCount={isFirstReview ? 120 : 60} />

      <div
        className={`relative flex flex-col items-center gap-4 p-8 mx-4 max-w-sm w-full rounded-2xl bg-card border border-border shadow-2xl transition-all duration-500 ${
          showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        {/* Icon */}
        <div className={`relative flex items-center justify-center w-20 h-20 rounded-full ${
          isFirstReview ? 'bg-accent/20' : 'bg-primary/15'
        }`}>
          {isFirstReview ? (
            <Trophy className="w-10 h-10 text-accent animate-bounce-in" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-primary animate-bounce-in" />
          )}
          <PartyPopper className="absolute -top-1 -end-1 w-5 h-5 text-accent animate-bounce-in" style={{ animationDelay: '0.3s' }} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground text-center">
          {isFirstReview ? '🏆 First Review Badge Earned!' : 'Review Submitted!'}
        </h2>

        {/* Reviewer Rank */}
        {currentTier && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <span>{currentTier.emoji}</span>
            You're a {currentTier.name}!
          </div>
        )}

        {/* Impact preview */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Your review will appear on <span className="font-semibold text-foreground">{developerName}</span>'s profile and help thousands make better decisions.
        </p>

        {/* Stars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 transition-all duration-300 ${
                s <= rating ? 'text-accent fill-accent' : 'text-muted'
              }`}
              style={{ animationDelay: `${s * 0.1}s` }}
            />
          ))}
        </div>

        {/* Coins earned */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-coin/15 border border-coin/30">
          <Coins className="w-4 h-4 text-coin" />
          <span className="text-sm font-bold text-coin-foreground">
            +{isFirstReview ? 50 : 25} coins earned!
          </span>
        </div>

        {/* Next milestone */}
        {nextTier && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Next: <span className="font-semibold text-foreground">{nextTier.tier.emoji} {nextTier.tier.name}</span>
              </span>
              <span className="text-primary font-bold">{nextTier.remaining} more review{nextTier.remaining !== 1 ? 's' : ''}</span>
            </div>
            <Progress
              value={((totalReviews / nextTier.tier.minReviews) * 100)}
              className="h-1.5"
            />
          </div>
        )}

        {/* Share buttons */}
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={shareOnWhatsApp}>
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={shareOnTwitter}>
            <Share2 className="w-3.5 h-3.5" />
            Twitter
          </Button>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 w-full mt-1">
          <Button
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => { onClose(); navigate('/reviews?mine=true'); }}
          >
            <Eye className="w-4 h-4" />
            My Reviews
          </Button>
          <Button onClick={onClose} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
