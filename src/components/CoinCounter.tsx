import { useEffect, useState, useRef } from 'react';
import { Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CoinCounterProps {
  totalPoints: number;
  variant?: 'compact' | 'expanded';
  tierEmoji?: string;
  tierName?: string;
  nextTierPoints?: number | null;
  className?: string;
  darkMode?: boolean;
}

export function CoinCounter({ totalPoints, variant = 'compact', tierEmoji, tierName, nextTierPoints, className, darkMode }: CoinCounterProps) {
  const navigate = useNavigate();
  const [displayPoints, setDisplayPoints] = useState(totalPoints);
  const [animating, setAnimating] = useState(false);
  const prevPoints = useRef(totalPoints);

  useEffect(() => {
    if (totalPoints !== prevPoints.current) {
      setAnimating(true);
      const diff = totalPoints - prevPoints.current;
      const steps = Math.min(Math.abs(diff), 20);
      const stepSize = diff / steps;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayPoints(totalPoints);
          clearInterval(interval);
          setTimeout(() => setAnimating(false), 300);
        } else {
          setDisplayPoints(Math.round(prevPoints.current + stepSize * step));
        }
      }, 30);
      prevPoints.current = totalPoints;
      return () => clearInterval(interval);
    }
  }, [totalPoints]);

  if (variant === 'compact') {
    return (
      <button
        onClick={() => navigate('/buyer/achievements')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-coin/15 border border-coin/30 hover:bg-coin/25 transition-all cursor-pointer',
          animating && 'animate-coin-pop',
          className
        )}
        aria-label={`${displayPoints} coins — view achievements`}
      >
        <Coins className="w-4 h-4 text-coin" />
        <span className="text-xs font-bold text-coin-foreground">{displayPoints}</span>
      </button>
    );
  }

  // Expanded variant for sidebar
  return (
    <button
      onClick={() => navigate('/buyer/achievements')}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-start',
        darkMode
          ? 'bg-white/5 border border-white/10 hover:bg-white/10'
          : 'bg-coin/10 border border-coin/20 hover:bg-coin/15',
        animating && (darkMode ? 'ring-2 ring-coin/40' : 'ring-2 ring-coin/40'),
        className
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
        darkMode ? 'bg-coin/20' : 'bg-coin/20',
        animating && 'animate-coin-pop'
      )}>
        <Coins className="w-5 h-5 text-coin" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-lg font-bold text-center",
            darkMode ? 'text-sidebar-foreground' : 'text-foreground'
          )}>{displayPoints}</span>
          <span className={cn(
            "text-xs",
            darkMode ? 'text-sidebar-muted' : 'text-muted-foreground'
          )}>coins</span>
        </div>
        {tierEmoji && tierName && (
          <p className={cn(
            "text-[11px] truncate",
            darkMode ? 'text-sidebar-muted' : 'text-muted-foreground'
          )}>
            {tierEmoji} {tierName}
            {nextTierPoints != null && ` · ${nextTierPoints} to next`}
          </p>
        )}
      </div>
    </button>
  );
}
