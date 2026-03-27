import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/hooks/useGamification';
import { TIERS, type BadgeDef, type MissionProgress } from '@/lib/gamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, CheckCircle2, ArrowRight, Trophy, Target, Award, Crown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfettiCelebration, useConfettiTrigger } from '@/components/ConfettiCelebration';
import { toast } from '@/hooks/use-toast';
import { DailyTasksCard } from '@/components/DailyTasksCard';
import { PointsBreakdownHeader } from '@/components/PointsBreakdownHeader';

export const GamificationPanel = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    profileCompletion,
    missingFields,
    totalPoints,
    currentTier,
    nextTier,
    pointsToNext,
    earnedBadges,
    lockedBadges,
    missions,
  } = useGamification();

  const confettiTrigger = useConfettiTrigger(
    'biz_gamification_state',
    earnedBadges.map((b) => b.id),
    currentTier.id,
  );

  // Toast notifications for newly earned badges
  useEffect(() => {
    if (isLoading || earnedBadges.length === 0) return;
    const seenKey = 'biz_seen_badges';
    const seen: string[] = JSON.parse(localStorage.getItem(seenKey) || '[]');
    const fresh = earnedBadges.filter((b) => !seen.includes(b.id));
    if (fresh.length > 0) {
      fresh.forEach((badge) => {
        toast({
          title: `🏆 Badge Earned: ${badge.name}`,
          description: `${badge.description} (+${badge.points} pts)`,
        });
      });
      localStorage.setItem(seenKey, JSON.stringify(earnedBadges.map((b) => b.id)));
    }
  }, [isLoading, earnedBadges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <ConfettiCelebration trigger={confettiTrigger} />

      {/* Points Breakdown Header */}
      <PointsBreakdownHeader
        totalPoints={totalPoints}
        currentStreak={0}
        tierName={currentTier.name}
        tierEmoji={currentTier.emoji}
        earnedBadges={earnedBadges.length}
        totalBadges={earnedBadges.length + lockedBadges.length}
      />

      {/* Daily Tasks */}
      <DailyTasksCard />

      {/* Profile Completion CTA */}
      {profileCompletion < 100 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">Profile Completion</span>
              </div>
              <span className="text-sm font-bold text-accent">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2 mb-3" />
            <div className="flex flex-wrap gap-1.5 mb-3">
              {missingFields.slice(0, 4).map((f) => (
                <Badge key={f} variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                  {f}
                </Badge>
              ))}
              {missingFields.length > 4 && (
                <Badge variant="outline" className="text-[10px]">+{missingFields.length - 4} more</Badge>
              )}
            </div>
            <Button size="sm" className="w-full gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate('/business/profile')}>
              Complete Your Profile <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tier Roadmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-accent" />
            Tier Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TIERS.map((tier) => {
            const isActive = tier.id === currentTier.id;
            const isUnlocked = totalPoints >= tier.minPoints;
            return (
              <div
                key={tier.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  isActive ? 'border-accent bg-accent/5 shadow-sm' : isUnlocked ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-60'
                )}
              >
                <span className="text-xl">{tier.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm font-semibold', isActive ? 'text-accent' : 'text-foreground')}>{tier.name}</p>
                    {isActive && <Badge className="text-[9px] bg-accent text-accent-foreground px-1.5 py-0">Current</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{tier.perks.join(' · ')}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{tier.minPoints} pts</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            Badges ({earnedBadges.length}/{earnedBadges.length + lockedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned />
            ))}
            {lockedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned={false} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Missions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            Missions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {missions.map((mp) => (
            <MissionCard key={mp.mission.id} progress={mp} onAction={() => navigate('/business/profile')} />
          ))}
        </CardContent>
      </Card>

      {/* Leaderboard Teaser */}
      <Card className="bg-gradient-to-br from-card to-secondary/30">
        <CardContent className="p-5 text-center">
          <Trophy className="w-10 h-10 text-accent mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">Leaderboard</h3>
          <p className="text-xs text-muted-foreground mb-3">See how you rank against other businesses on the platform</p>
          <div className="space-y-2 mb-4">
            {[
              { rank: 1, name: 'Emaar Properties', points: 1250, emoji: '💎' },
              { rank: 2, name: 'DAMAC', points: 980, emoji: '🥇' },
              { rank: 3, name: 'Nakheel', points: 720, emoji: '🥇' },
            ].map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3 p-2.5 bg-card border border-border rounded-lg">
                <span className="text-sm font-bold text-accent w-6">#{entry.rank}</span>
                <span className="text-sm">{entry.emoji}</span>
                <span className="flex-1 text-sm font-medium text-foreground text-start">{entry.name}</span>
                <span className="text-xs font-semibold text-muted-foreground">{entry.points} pts</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">Your rank: #{4} · Climb tiers to move up!</p>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Sub-components ──

function BadgeCard({ badge, earned }: { badge: BadgeDef; earned: boolean }) {
  const Icon = badge.icon;
  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all',
        earned ? 'border-accent/30 bg-accent/5' : 'border-border bg-muted/30 opacity-50'
      )}
    >
      {!earned && <Lock className="absolute top-2 end-2 w-3 h-3 text-muted-foreground" />}
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', earned ? 'bg-accent/20' : 'bg-muted')}>
        <Icon className={cn('w-5 h-5', earned ? 'text-accent' : 'text-muted-foreground')} />
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground leading-tight">{badge.name}</p>
        <p className="text-[9px] text-muted-foreground mt-0.5">{badge.description}</p>
      </div>
      <Badge variant={earned ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0">
        {earned ? `+${badge.points} pts` : `${badge.points} pts`}
      </Badge>
    </div>
  );
}

function MissionCard({ progress, onAction }: { progress: MissionProgress; onAction: () => void }) {
  const { mission, current, completed } = progress;
  const pct = mission.id === 'reach_rating_4'
    ? completed ? 100 : Math.min((current / mission.target) * 100, 99)
    : Math.min((current / mission.target) * 100, 100);

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border', completed ? 'border-trust-excellent/30 bg-trust-excellent/5' : 'border-border')}>
      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-trust-excellent flex-shrink-0" />
      ) : (
        <Target className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className={cn('text-xs font-semibold', completed ? 'text-trust-excellent' : 'text-foreground')}>{mission.title}</p>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{mission.type}</Badge>
        </div>
        <p className="text-[10px] text-muted-foreground mb-1.5">{mission.description}</p>
        <div className="flex items-center gap-2">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-[10px] font-medium text-muted-foreground">
            {mission.id === 'reach_rating_4' ? `${current}/${mission.target}` : `${current}/${mission.target}`}
          </span>
        </div>
      </div>
      {!completed && (
        <Button size="sm" variant="ghost" className="flex-shrink-0 h-7 w-7 p-0" onClick={onAction}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
