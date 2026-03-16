import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  calcBuyerProfileCompletion,
  calcBuyerEarnedBadges,
  calcBuyerTotalPoints,
  getBuyerTier,
  getNextBuyerTier,
  calcBuyerMissionProgress,
  BUYER_BADGES,
  type BuyerGamificationInput,
} from '@/lib/buyerGamification';

interface EngagementData {
  developers_viewed: number;
  projects_saved: number;
  reports_unlocked: number;
  helpful_votes: number;
  community_posts: number;
  community_replies: number;
  community_votes: number;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_bonus_points: number;
}

export function useBuyerGamification() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [hasVerifiedPurchase, setHasVerifiedPurchase] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Fetch engagement, review count, and receipt status in parallel
        const [engRes, reviewRes, receiptRes, streakRes] = await Promise.all([
          supabase
            .from('buyer_engagement')
            .select('developers_viewed, projects_saved, reports_unlocked, helpful_votes, community_posts, community_replies, community_votes')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('receipt_submissions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'approved'),
          supabase
            .from('user_streaks')
            .select('current_streak, longest_streak, streak_bonus_points')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (engRes.data) {
          setEngagement(engRes.data as EngagementData);
        } else {
          await supabase.from('buyer_engagement').insert({ user_id: user.id });
          setEngagement({ developers_viewed: 0, projects_saved: 0, reports_unlocked: 0, helpful_votes: 0, community_posts: 0, community_replies: 0, community_votes: 0 });
        }

        setStreakData(streakRes.data as StreakData | null);
        setReviewCount(reviewRes.count ?? 0);
        setHasVerifiedPurchase((receiptRes.count ?? 0) > 0);
      } catch (err) {
        console.error('Error fetching buyer engagement:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isLoading = authLoading || dataLoading;

  return useMemo(() => {
    const profileFields = profile ?? {};
    const { percent: profileCompletion, missing } = calcBuyerProfileCompletion(profileFields);

    const input: BuyerGamificationInput = {
      profileCompletion,
      reviewsWritten: reviewCount,
      developersViewed: engagement?.developers_viewed ?? 0,
      projectsSaved: engagement?.projects_saved ?? 0,
      reportsUnlocked: engagement?.reports_unlocked ?? 0,
      hasVerifiedPurchase,
      helpfulVotes: engagement?.helpful_votes ?? 0,
      joinedDate: profile?.created_at ? new Date(profile.created_at) : new Date(),
      communityPosts: engagement?.community_posts ?? 0,
      communityReplies: engagement?.community_replies ?? 0,
      communityVotes: engagement?.community_votes ?? 0,
      currentStreak: streakData?.current_streak ?? 0,
      longestStreak: streakData?.longest_streak ?? 0,
      streakBonusPoints: streakData?.streak_bonus_points ?? 0,
    };

    const earnedIds = calcBuyerEarnedBadges(input);
    const totalPoints = calcBuyerTotalPoints(earnedIds, profileCompletion, input.streakBonusPoints);
    const currentTier = getBuyerTier(totalPoints);
    const nextTier = getNextBuyerTier(totalPoints);
    const missions = calcBuyerMissionProgress(input);

    const earnedBadges = BUYER_BADGES.filter((b) => earnedIds.includes(b.id));
    const lockedBadges = BUYER_BADGES.filter((b) => !earnedIds.includes(b.id));

    return {
      isLoading,
      profileCompletion,
      missingFields: missing,
      totalPoints,
      currentTier,
      nextTier,
      pointsToNext: nextTier ? nextTier.minPoints - totalPoints : 0,
      earnedBadges,
      lockedBadges,
      missions,
      allBadges: BUYER_BADGES,
      currentStreak: input.currentStreak,
      longestStreak: input.longestStreak,
      streakBonusPoints: input.streakBonusPoints,
    };
  }, [profile, isLoading, reviewCount, engagement, hasVerifiedPurchase, streakData]);
}
