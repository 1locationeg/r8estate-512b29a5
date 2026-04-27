import { Star, PenLine, Coins, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReviewerBadge } from '@/components/ReviewerBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FEATURED = {
  name: 'Ahmed K.',
  initials: 'AK',
  rating: 5,
  snippet: 'Saved me from a bad developer deal in 6th October',
  reviewCount: 8,
  location: '6th of October',
};

interface ReviewerSpotlightProps {
  onWriteReview?: () => void;
}

export const ReviewerSpotlight = ({ onWriteReview }: ReviewerSpotlightProps) => {
  const navigate = useNavigate();
  const handleClick = onWriteReview || (() => navigate('/reviews'));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/[0.03] shadow-sm">
        {/* Decorative quote mark */}
        <Quote
          className="absolute -top-2 -right-2 w-20 h-20 text-primary/[0.05] rotate-180 pointer-events-none"
          aria-hidden
        />

        <div className="relative px-4 sm:px-5 py-0 flex flex-col gap-4">
          {/* Header — centered, balanced hierarchy */}
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
              Your review could save someone{' '}
              <span className="text-primary">millions</span>
            </h3>
          </div>

          {/* Featured review — single, focused, centered */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/40">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background shadow-sm">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                {FEATURED.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-semibold text-foreground truncate">
                  {FEATURED.name}
                </span>
                <ReviewerBadge reviewCount={FEATURED.reviewCount} compact />
                <div className="flex gap-px ml-auto shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= FEATURED.rating
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic leading-snug line-clamp-1">
                "{FEATURED.snippet}"
              </p>
            </div>
          </div>

          {/* CTA — centered, single anchor point */}
          <div className="flex justify-center">
            <Button
              size="sm"
              className="gap-2 h-9 px-4 text-xs shadow-sm hover:shadow-md transition-shadow"
              onClick={handleClick}
            >
              <span className="flex items-center gap-1 text-coin font-bold">
                <Coins className="w-3.5 h-3.5" />
                +25
              </span>
              <span className="w-px h-3.5 bg-primary-foreground/25" />
              <PenLine className="w-3.5 h-3.5" />
              Write a Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
