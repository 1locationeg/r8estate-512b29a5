import { useEffect, useState } from 'react';
import { CheckCircle2, Trophy, Star, PartyPopper, Eye, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { useNavigate } from 'react-router-dom';

interface ReviewSuccessOverlayProps {
  open: boolean;
  onClose: () => void;
  isFirstReview?: boolean;
  developerName?: string;
  rating?: number;
}

export function ReviewSuccessOverlay({
  open,
  onClose,
  isFirstReview = false,
  developerName = '',
  rating = 5,
}: ReviewSuccessOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Stagger the content reveal
      const t1 = setTimeout(() => setShowContent(true), 200);
      const t2 = setTimeout(() => setConfettiTrigger(true), 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setShowContent(false);
      setConfettiTrigger(false);
    }
  }, [open]);

  if (!open) return null;

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

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          {isFirstReview
            ? `Amazing! You've earned the First Reviewer badge. Your review of ${developerName} helps the community make better decisions.`
            : `Thank you for reviewing ${developerName}. Your feedback helps others make informed decisions.`}
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

        {isFirstReview && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-accent" />
            🏆 First Reviewer Badge Unlocked!
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2 w-full mt-2">
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
