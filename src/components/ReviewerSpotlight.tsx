import { Star, PenLine } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReviewerBadge } from '@/components/ReviewerBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SPOTLIGHT_REVIEWERS = [
  { name: 'Ahmed K.', initials: 'AK', rating: 5, snippet: 'Saved me from a bad developer deal in 6th October', reviewCount: 8 },
];

interface ReviewerSpotlightProps {
  onWriteReview?: () => void;
}

export const ReviewerSpotlight = ({ onWriteReview }: ReviewerSpotlightProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Spotlight strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SPOTLIGHT_REVIEWERS.map((r) => (
          <div
            key={r.name}
            className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm"
          >
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {r.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs font-semibold text-foreground truncate">{r.name}</span>
                <ReviewerBadge reviewCount={r.reviewCount} compact />
              </div>
              <div className="flex gap-0.5 mb-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-2.5 h-2.5 ${s <= r.rating ? 'fill-accent text-accent' : 'text-muted-foreground/20'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">
                "{r.snippet}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
