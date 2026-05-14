import { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAvatarOverlay, type AvatarAudience, type AvatarOverlay, type AvatarOverlayPosition } from '@/contexts/AvatarOverlayContext';
import { cn } from '@/lib/utils';

type AvatarWithOverlayProps = {
  src?: string | null;
  alt?: string;
  fallback?: ReactNode;
  audience?: AvatarAudience | string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  overlay?: AvatarOverlay | null;
};

const positionClasses: Record<AvatarOverlayPosition, string> = {
  'top-start': 'top-0 start-0 -translate-x-1/4 -translate-y-1/4',
  'top-end': 'top-0 end-0 translate-x-1/4 -translate-y-1/4',
  'bottom-start': 'bottom-0 start-0 -translate-x-1/4 translate-y-1/4',
  'bottom-end': 'bottom-0 end-0 translate-x-1/4 translate-y-1/4',
  center: 'top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2',
};

export function AvatarWithOverlay({
  src,
  alt = 'User avatar',
  fallback,
  audience = 'all',
  className,
  imageClassName,
  fallbackClassName,
  overlay: providedOverlay,
}: AvatarWithOverlayProps) {
  const activeOverlay = useAvatarOverlay(audience);
  const overlay = providedOverlay === undefined ? activeOverlay : providedOverlay;

  return (
    <span className={cn('relative inline-flex shrink-0 overflow-visible', className)}>
      <Avatar className="h-full w-full rounded-[inherit]">
        <AvatarImage src={src || undefined} alt={alt} className={imageClassName} />
        <AvatarFallback className={fallbackClassName}>{fallback}</AvatarFallback>
      </Avatar>
      {overlay?.icon_url && (
        <span
          className={cn(
            'pointer-events-none absolute z-10 rounded-full border-2 border-background bg-background/80 shadow-[0_0_18px_hsl(var(--primary)/0.38)] backdrop-blur-sm',
            positionClasses[overlay.position] || positionClasses['bottom-end'],
          )}
          style={{ width: `${overlay.size_percent}%`, height: `${overlay.size_percent}%` }}
          aria-hidden="true"
        >
          <img src={overlay.icon_url} alt="" className="h-full w-full rounded-full object-contain" loading="lazy" />
        </span>
      )}
    </span>
  );
}