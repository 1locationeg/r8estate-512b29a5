import { Flame, Trophy, Sparkles, Shield, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StreakTrackerVisualProps {
  currentStreak: number;
  longestStreak: number;
  streakBonusPoints: number;
}

const STREAK_DAYS = 7;

export const StreakTrackerVisual = ({ currentStreak, longestStreak, streakBonusPoints }: StreakTrackerVisualProps) => {
  const { t, i18n } = useTranslation();

  const streakMilestones = [
    { days: 3, bonus: 10, labelKey: 'gamification.threeDay', icon: Flame },
    { days: 7, bonus: 25, labelKey: 'gamification.oneWeek', icon: Sparkles },
    { days: 14, bonus: 50, labelKey: 'gamification.twoWeeks', icon: Trophy },
    { days: 30, bonus: 100, labelKey: 'gamification.oneMonth', icon: Gift },
  ];

  const today = new Date();
  const dayLocale = i18n.language === 'ar' ? 'ar' : 'en';
  const days = Array.from({ length: STREAK_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (STREAK_DAYS - 1 - i));
    const dayName = d.toLocaleDateString(dayLocale, { weekday: 'short' }).slice(0, 2);
    const isActive = i >= STREAK_DAYS - currentStreak;
    const isToday = i === STREAK_DAYS - 1;
    return { dayName, isActive, isToday };
  });

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            currentStreak >= 7 ? 'bg-orange-500/20' : currentStreak >= 3 ? 'bg-amber-500/20' : 'bg-muted'
          )}>
            <Flame className={cn(
              'w-5 h-5',
              currentStreak >= 7 ? 'text-orange-500' : currentStreak >= 3 ? 'text-amber-500' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{t('gamification.dailyStreak')}</h3>
            <p className="text-[10px] text-muted-foreground">{t('gamification.stayActive')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="gap-1 text-xs">
            <Shield className="w-3 h-3" /> {t('gamification.streakProtection')}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-5">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
              day.isActive
                ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                : day.isToday
                  ? 'bg-muted border-dashed border-muted-foreground/30 text-muted-foreground'
                  : 'bg-muted/50 border-transparent text-muted-foreground/30'
            )}>
              {day.isActive ? (
                <Flame className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-medium">{day.dayName}</span>
              )}
            </div>
            <span className={cn(
              'text-[9px] font-medium',
              day.isToday ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {day.dayName}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2.5 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Flame className={cn('w-4 h-4', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
            <span className="text-lg font-bold text-foreground">{currentStreak}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{t('gamification.current')}</p>
        </div>
        <div className="text-center p-2.5 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-lg font-bold text-foreground">{longestStreak}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{t('gamification.best')}</p>
        </div>
        <div className="text-center p-2.5 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-foreground">{streakBonusPoints}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{t('gamification.bonusPts')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {streakMilestones.map((m) => {
          const reached = longestStreak >= m.days;
          const Icon = m.icon;
          return (
            <div
              key={m.days}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                reached
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-600'
                  : 'bg-muted/30 border-border text-muted-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-medium">{t(m.labelKey)}</span>
              <span className="font-bold">+{m.bonus}</span>
              {reached && <Badge className="bg-orange-500/20 text-orange-600 border-0 text-[9px] px-1">✓</Badge>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
