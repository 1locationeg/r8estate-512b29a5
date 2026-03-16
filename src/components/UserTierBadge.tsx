import { useUserTier } from '@/hooks/useUserTier';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserTierBadgeProps {
  userId: string | undefined;
  className?: string;
}

/**
 * Displays a compact tier badge (emoji + name) next to a user's name.
 * Renders nothing for the default "Newcomer" tier to reduce visual noise.
 */
export const UserTierBadge = ({ userId, className }: UserTierBadgeProps) => {
  const { tier, isLoading } = useUserTier(userId);

  // Don't show for newcomers or while loading
  if (isLoading || tier.id === 'newcomer') return null;

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
      {tier.name}
    </Badge>
  );
};
