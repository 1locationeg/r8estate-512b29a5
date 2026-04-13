import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ReviewerTier = {
  id: string;
  name: string;
  emoji: string;
  minReviews: number;
  color: string;
};

const REVIEWER_TIERS: ReviewerTier[] = [
  { id: 'new', name: 'New Reviewer', emoji: '✍️', minReviews: 1, color: 'text-muted-foreground' },
  { id: 'active', name: 'Active Reviewer', emoji: '🔥', minReviews: 3, color: 'text-accent' },
  { id: 'pro', name: 'Pro Reviewer', emoji: '⭐', minReviews: 5, color: 'text-primary' },
  { id: 'elite', name: 'Elite Reviewer', emoji: '👑', minReviews: 10, color: 'text-coin' },
];

export const getReviewerTier = (reviewCount: number): ReviewerTier | null => {
  if (reviewCount < 1) return null;
  let tier = REVIEWER_TIERS[0];
  for (const t of REVIEWER_TIERS) {
    if (reviewCount >= t.minReviews) tier = t;
  }
  return tier;
};

export const getNextReviewerTier = (reviewCount: number): { tier: ReviewerTier; remaining: number } | null => {
  for (const t of REVIEWER_TIERS) {
    if (reviewCount < t.minReviews) {
      return { tier: t, remaining: t.minReviews - reviewCount };
    }
  }
  return null;
};

interface ReviewerBadgeProps {
  reviewCount: number;
  compact?: boolean;
  className?: string;
}

export const ReviewerBadge = ({ reviewCount, compact = false, className }: ReviewerBadgeProps) => {
  const tier = getReviewerTier(reviewCount);
  if (!tier) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[9px] md:text-[10px] px-1.5 py-0 h-4 md:h-[18px] gap-0.5 font-semibold border-current/20 flex-shrink-0',
        tier.color,
        className,
      )}
    >
      <span className="leading-none">{tier.emoji}</span>
      {!compact && tier.name}
    </Badge>
  );
};
