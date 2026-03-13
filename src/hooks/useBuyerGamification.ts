import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export function useBuyerGamification() {
  const { profile, isLoading } = useAuth();

  return useMemo(() => {
    const profileFields = profile ?? {};
    const { percent: profileCompletion, missing } = calcBuyerProfileCompletion(profileFields);

    // Mock engagement stats — in production these would come from DB
    const input: BuyerGamificationInput = {
      profileCompletion,
      reviewsWritten: 3,
      developersViewed: 24,
      projectsSaved: 12,
      reportsUnlocked: 8,
      hasVerifiedPurchase: false,
      helpfulVotes: 5,
      joinedDate: profile?.created_at ? new Date(profile.created_at) : new Date(),
    };

    const earnedIds = calcBuyerEarnedBadges(input);
    const totalPoints = calcBuyerTotalPoints(earnedIds, profileCompletion);
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
    };
  }, [profile, isLoading]);
}
