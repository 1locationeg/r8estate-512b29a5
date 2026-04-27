import { Star, PenLine, Coins } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      <button
        type="button"
        onClick={handleClick}
        className="group w-full flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-full border border-border/60 bg-card hover:bg-card/80 hover:border-primary/40 hover:shadow-sm transition-all text-left"
      >
        {/* Avatar */}
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 ring-2 ring-background">
          <AvatarFallback className="text-[10px] sm:text-xs bg-primary/10 text-primary font-bold">
            {FEATURED.initials}
          </AvatarFallback>
        </Avatar>

        {/* Proof — name + 5★ inline, snippet truncated */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
              {FEATURED.name}
            </span>
            <div className="flex gap-px shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-2.5 h-2.5 ${
                    s <= FEATURED.rating
                      ? 'fill-accent text-accent'
                      : 'text-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground italic leading-tight truncate">
            "{FEATURED.snippet}"
          </p>
        </div>

        {/* Inline CTA pill */}
        <span className="shrink-0 inline-flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full bg-primary text-primary-foreground text-[11px] sm:text-xs font-semibold shadow-sm group-hover:shadow-md transition-shadow">
          <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-coin" />
          <span className="text-coin font-bold">+25</span>
          <span className="w-px h-3 bg-primary-foreground/25 mx-0.5 hidden sm:block" />
          <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden sm:block" />
          <span className="hidden sm:inline">Review</span>
        </span>
      </button>
    </div>
  );
};
