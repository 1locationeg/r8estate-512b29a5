import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuyerGamification } from '@/hooks/useBuyerGamification';
import { BUYER_TIERS, type BuyerBadgeDef, type BuyerMissionProgress } from '@/lib/buyerGamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight, Lock, Trophy, Sparkles, Target, Star, X, Flame } from 'lucide-react';
import { ConfettiCelebration, useConfettiTrigger } from '@/components/ConfettiCelebration';
import { toast } from '@/hooks/use-toast';

export const BuyerGamificationPanel = () => {
  const navigate = useNavigate();
  const {
    isLoading, currentTier, totalPoints, nextTier, pointsToNext,
    missions, earnedBadges, lockedBadges, profileCompletion, missingFields,
    currentStreak, longestStreak, streakBonusPoints,
  } = useBuyerGamification();

  const confettiTrigger = useConfettiTrigger(
    'buyer_gamification_state',
    earnedBadges.map((b) => b.id),
    currentTier.id,
  );

  // Track newly earned badges the user hasn't dismissed yet
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading || earnedBadges.length === 0) return;
    const seenKey = 'buyer_seen_badges';
    const seen: string[] = JSON.parse(localStorage.getItem(seenKey) || '[]');
    const fresh = earnedBadges.filter((b) => !seen.includes(b.id));
    if (fresh.length > 0) {
      setNewBadgeIds(fresh.map((b) => b.id));
      // Show toast for each newly earned badge
      fresh.forEach((badge) => {
        toast({
          title: `🏆 Badge Earned: ${badge.name}`,
          description: `${badge.description} (+${badge.points} pts)`,
        });
      });
    }
  }, [isLoading, earnedBadges]);

  const dismissNewBadge = (id: string) => {
    const seenKey = 'buyer_seen_badges';
    const seen: string[] = JSON.parse(localStorage.getItem(seenKey) || '[]');
    localStorage.setItem(seenKey, JSON.stringify([...seen, id]));
    setNewBadgeIds((prev) => prev.filter((x) => x !== id));
  };

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
    <div className="space-y-6 relative">
      <ConfettiCelebration trigger={confettiTrigger} />

      {/* Newly earned badge banners */}
      {newBadgeIds.map((id) => {
        const badge = earnedBadges.find((b) => b.id === id);
        if (!badge) return null;
        const Icon = badge.icon;
        return (
          <div
            key={id}
            className="relative bg-gradient-to-r from-accent/15 via-primary/10 to-accent/15 border border-accent/30 rounded-xl p-4 animate-fade-in"
          >
            <button
              onClick={() => dismissNewBadge(id)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-bold text-foreground">New Badge Earned!</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
              <Badge className="bg-accent text-accent-foreground text-xs flex-shrink-0">
                +{badge.points} pts
              </Badge>
            </div>
          </div>
        );
      })}
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

      {/* Streak Widget */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStreak >= 7 ? 'bg-orange-500/20' : currentStreak >= 3 ? 'bg-amber-500/20' : 'bg-muted'
            }`}>
              <Flame className={`w-5 h-5 ${
                currentStreak >= 7 ? 'text-orange-500' : currentStreak >= 3 ? 'text-amber-500' : 'text-muted-foreground'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Daily Streak</h3>
              <p className="text-xs text-muted-foreground">Be active every day to earn bonus points</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="text-xl font-bold text-foreground">{currentStreak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Current</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-xl font-bold text-foreground">{longestStreak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Best</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xl font-bold text-foreground">{streakBonusPoints}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Bonus Pts</p>
          </div>
        </div>

        {/* Streak milestones */}
        <div className="space-y-2">
          {[
            { days: 3, bonus: 10, label: '3 Days' },
            { days: 7, bonus: 25, label: '1 Week' },
            { days: 14, bonus: 50, label: '2 Weeks' },
            { days: 30, bonus: 100, label: '1 Month' },
          ].map((milestone) => {
            const reached = longestStreak >= milestone.days;
            const progress = Math.min((currentStreak / milestone.days) * 100, 100);
            return (
              <div key={milestone.days} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  reached ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'
                }`}>
                  <Flame className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-foreground">{milestone.label}</span>
                    <span className="text-[10px] text-muted-foreground">+{milestone.bonus} pts</span>
                  </div>
                  <Progress value={reached ? 100 : progress} className="h-1.5" />
                </div>
                {reached && <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px]">✓</Badge>}
              </div>
            );
          })}
        </div>
      </div>

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
