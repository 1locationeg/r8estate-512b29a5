import { Coins, Flame, Trophy, TrendingUp, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const stats = [
    {
      icon: Coins,
      label: t('gamification.availableCoins'),
      value: totalPoints.toLocaleString(),
      sublabel: t('gamification.pointsBreakdown'),
      iconColor: 'text-coin',
      bgColor: 'bg-coin/10',
    },
    {
      icon: Award,
      label: t('gamification.badgesEarned'),
      value: `${earnedBadges}/${totalBadges}`,
      sublabel: t('gamification.viewAllBadges'),
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      label: t('gamification.todaysPoints'),
      value: '0',
      sublabel: t('gamification.completeTasks'),
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Flame,
      label: t('gamification.streakCount'),
      value: `${currentStreak}`,
      sublabel: currentStreak > 0 ? t('gamification.keepItGoing') : t('gamification.startToday'),
      iconColor: currentStreak >= 3 ? 'text-orange-500' : 'text-muted-foreground',
      bgColor: currentStreak >= 3 ? 'bg-orange-500/10' : 'bg-muted',
    },
  ];

  return (
    <div className={cn('bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tierEmoji}</span>
          <div>
            <p className="text-xs text-primary-foreground/70 font-medium">{t('gamification.level')}</p>
            <p className="text-sm font-bold">{tierName}</p>
          </div>
        </div>
      </div>

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
