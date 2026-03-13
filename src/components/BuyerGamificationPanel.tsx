import { useNavigate } from 'react-router-dom';
import { useBuyerGamification } from '@/hooks/useBuyerGamification';
import { BUYER_TIERS, type BuyerBadgeDef, type BuyerMissionProgress } from '@/lib/buyerGamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight, Lock, Trophy, Sparkles, Target } from 'lucide-react';
import { ConfettiCelebration, useConfettiTrigger } from '@/components/ConfettiCelebration';

export const BuyerGamificationPanel = () => {
  const navigate = useNavigate();
  const {
    isLoading, currentTier, totalPoints, nextTier, pointsToNext,
    missions, earnedBadges, lockedBadges, profileCompletion, missingFields,
  } = useBuyerGamification();

  const confettiTrigger = useConfettiTrigger(
    'buyer_gamification_state',
    earnedBadges.map((b) => b.id),
    currentTier.id,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tierProgress = nextTier
    ? ((totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-2xl p-6 border border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{currentTier.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{currentTier.name}</h2>
            <p className="text-sm text-muted-foreground">{totalPoints} points earned</p>
          </div>
          <div className="ml-auto text-right">
            <div className="flex items-center gap-1 text-accent">
              <Trophy className="w-5 h-5" />
              <span className="text-lg font-bold">{earnedBadges.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">badges</p>
          </div>
        </div>
        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{currentTier.emoji} {currentTier.name}</span>
              <span>{nextTier.emoji} {nextTier.name} ({pointsToNext} pts away)</span>
            </div>
            <Progress value={tierProgress} className="h-3" />
          </div>
        )}
      </div>

      {/* Profile Completion CTA */}
      {profileCompletion < 100 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
            </div>
            <span className="text-sm font-bold text-primary">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2 mb-3" />
          <p className="text-xs text-muted-foreground mb-3">
            Missing: {missingFields.join(', ')}
          </p>
          <Button size="sm" onClick={() => navigate('/buyer/settings')}>
            Complete Profile <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Tier Roadmap */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Tier Roadmap</h3>
        <div className="space-y-3">
          {BUYER_TIERS.map((tier) => {
            const isActive = tier.id === currentTier.id;
            const isUnlocked = totalPoints >= tier.minPoints;
            return (
              <div
                key={tier.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary/10 border border-primary/20' : isUnlocked ? 'bg-secondary/50' : 'opacity-50'
                }`}
              >
                <span className="text-2xl">{tier.emoji}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>{tier.name}</p>
                  <p className="text-xs text-muted-foreground">{tier.minPoints}+ points · {tier.perks[tier.perks.length - 1]}</p>
                </div>
                {isActive && <Badge className="bg-primary text-primary-foreground text-[10px]">Current</Badge>}
                {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Badges ({earnedBadges.length}/{earnedBadges.length + lockedBadges.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {earnedBadges.map((b) => <BadgeCard key={b.id} badge={b} earned />)}
          {lockedBadges.map((b) => <BadgeCard key={b.id} badge={b} earned={false} />)}
        </div>
      </div>

      {/* Missions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Active Missions</h3>
        </div>
        <div className="space-y-3">
          {missions.map((mp) => (
            <MissionCard key={mp.mission.id} progress={mp} onAction={() => {
              if (mp.mission.id === 'complete_profile') navigate('/buyer/settings');
              else if (mp.mission.id === 'write_3_reviews') navigate('/directory');
              else if (mp.mission.id === 'save_5_projects') navigate('/');
              else if (mp.mission.id === 'view_10_devs') navigate('/directory');
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

function BadgeCard({ badge, earned }: { badge: BuyerBadgeDef; earned: boolean }) {
  const Icon = badge.icon;
  return (
    <div className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
      earned ? 'bg-accent/10 border-accent/20' : 'bg-secondary/30 border-border opacity-50'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
        earned ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
      }`}>
        {earned ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
      </div>
      <p className="text-xs font-semibold text-foreground leading-tight">{badge.name}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
      <Badge variant="outline" className="mt-1 text-[10px]">{badge.points} pts</Badge>
    </div>
  );
}

function MissionCard({ progress, onAction }: { progress: BuyerMissionProgress; onAction: () => void }) {
  const { mission, current, completed } = progress;
  const pct = mission.id === 'complete_profile'
    ? current
    : Math.round((current / mission.target) * 100);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-foreground">{mission.title}</p>
          {completed && <Badge className="bg-trust-excellent text-white text-[10px]">Done</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>
        <div className="flex items-center gap-2">
          <Progress value={Math.min(pct, 100)} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground font-medium">
            {mission.id === 'complete_profile' ? `${current}%` : `${current}/${mission.target}`}
          </span>
        </div>
      </div>
      {!completed && (
        <Button size="sm" variant="ghost" onClick={onAction} className="flex-shrink-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
