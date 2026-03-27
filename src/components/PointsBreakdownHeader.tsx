import { Coins, Flame, Trophy, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsBreakdownHeaderProps {
  totalPoints: number;
  currentStreak: number;
  tierName: string;
  tierEmoji: string;
  earnedBadges: number;
  totalBadges: number;
  className?: string;
}

export const PointsBreakdownHeader = ({
  totalPoints,
  currentStreak,
  tierName,
  tierEmoji,
  earnedBadges,
  totalBadges,
  className,
}: PointsBreakdownHeaderProps) => {
  const stats = [
    {
      icon: Coins,
      label: 'Available coins',
      value: totalPoints.toLocaleString(),
      sublabel: 'Points breakdown →',
      iconColor: 'text-coin',
      bgColor: 'bg-coin/10',
    },
    {
      icon: Award,
      label: 'Badges earned',
      value: `${earnedBadges}/${totalBadges}`,
      sublabel: 'View all →',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      label: "Today's points",
      value: '0',
      sublabel: 'Complete tasks →',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Flame,
      label: 'Streak count',
      value: `${currentStreak}`,
      sublabel: currentStreak > 0 ? 'Keep it going!' : 'Start today!',
      iconColor: currentStreak >= 3 ? 'text-orange-500' : 'text-muted-foreground',
      bgColor: currentStreak >= 3 ? 'bg-orange-500/10' : 'bg-muted',
    },
  ];

  return (
    <div className={cn('bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground', className)}>
      {/* Top Row: Greeting + Level */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tierEmoji}</span>
          <div>
            <p className="text-xs text-primary-foreground/70 font-medium">Level</p>
            <p className="text-sm font-bold">{tierName}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', 'bg-white/15')}>
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-primary-foreground/70 font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-primary-foreground/60 mt-0.5">{stat.sublabel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
