import { useMemo } from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import {
  calcProfileCompletion,
  calcEarnedBadges,
  calcTotalPoints,
  getTier,
  getNextTier,
  calcMissionProgress,
  BADGES,
  TIERS,
  type GamificationInput,
} from '@/lib/gamification';
import { developers, reviews } from '@/data/mockData';

// Use first developer as mock "my business" (mirrors DeveloperDashboard)
const myDev = developers[0];
const myReviews = reviews.filter((r) => r.developerId === myDev.id);

export function useGamification() {
  const { profile, isLoading } = useBusinessProfile();

  return useMemo(() => {
    if (isLoading || !profile) {
      return {
        isLoading: true,
        profileCompletion: 0,
        missingFields: [] as string[],
        totalPoints: 0,
        currentTier: TIERS[0],
        nextTier: TIERS[1],
        pointsToNext: TIERS[1].minPoints,
        earnedBadges: [] as typeof BADGES,
        lockedBadges: BADGES,
        missions: [] as ReturnType<typeof calcMissionProgress>,
        allBadges: BADGES,
      };
    }

    const { percent: profileCompletion, missing } = calcProfileCompletion(profile);

    const input: GamificationInput = {
      profileCompletion,
      reviewCount: myDev.reviewCount,
      reviewReplies: myReviews.filter((r) => r.developerReply).length,
      avgRating: myDev.rating,
      trustScore: myDev.trustScore,
      galleryCount: 0,
      teamCount: 3,
      hasLicense: !!profile.license_url,
      joinedDate: new Date(),
      communityPosts: 0,
      communityReplies: 0,
    };

    const earnedIds = calcEarnedBadges(input);
    const totalPoints = calcTotalPoints(earnedIds, profileCompletion);
    const currentTier = getTier(totalPoints);
    const nextTier = getNextTier(totalPoints);
    const missions = calcMissionProgress(input);

    const earnedBadges = BADGES.filter((b) => earnedIds.includes(b.id));
    const lockedBadges = BADGES.filter((b) => !earnedIds.includes(b.id));

    return {
      isLoading: false,
      profileCompletion,
      missingFields: missing,
      totalPoints,
      currentTier,
      nextTier,
      pointsToNext: nextTier ? nextTier.minPoints - totalPoints : 0,
      earnedBadges,
      lockedBadges,
      missions,
      allBadges: BADGES,
    };
  }, [profile, isLoading]);
}
