import { useMemo } from 'react';
import { useBusinessProfile } from './useBusinessProfile';
import {
  calcProfileCompletion,
  calcEarnedBadges,
  calcTotalPoints,
  getTier,
  getNextTier,
  calcMissionProgress,
  BADGES,
  type GamificationInput,
  type MissionProgress,
  type Tier,
  type BadgeDef,
} from '@/lib/gamification';
import { developers, reviews } from '@/data/mockData';

// Use first developer as mock "my business" (mirrors DeveloperDashboard)
const myDev = developers[0];
const myReviews = reviews.filter((r) => r.developerId === myDev.id);

export function useGamification() {
  const { profile, isLoading } = useBusinessProfile();

  return useMemo(() => {
    if (isLoading) {
      return {
        isLoading: true,
        profileCompletion: 0,
        missingFields: [],
        totalPoints: 0,
        currentTier: TIERS[0],
        nextTier: TIERS[1],
        pointsToNext: TIERS[1].minPoints,
        earnedBadges: [],
        lockedBadges: BADGES,
        missions: [],
        allBadges: BADGES,
      };
    }

    const profileFields = profile ?? {};
    const { percent: profileCompletion, missing } = calcProfileCompletion(profileFields);

    const input: GamificationInput = {
      profileCompletion,
      reviewCount: myDev.reviewCount,
      reviewReplies: myReviews.filter((r) => r.developerReply).length,
      avgRating: myDev.rating,
      trustScore: myDev.trustScore,
      galleryCount: 0, // TODO: from actual gallery
      teamCount: 3, // mock
      hasLicense: !!profile?.license_url,
      joinedDate: new Date(), // would come from user created_at
      communityPosts: 0, // TODO: fetch from DB
      communityReplies: 0, // TODO: fetch from DB
    };

    const earnedIds = calcEarnedBadges(input);
    const totalPoints = calcTotalPoints(earnedIds, profileCompletion);
    const currentTier = getTier(totalPoints);
    const nextTier = getNextTier(totalPoints);
    const missions = calcMissionProgress(input);

    const earnedBadges = BADGES.filter((b) => earnedIds.includes(b.id));
    const lockedBadges = BADGES.filter((b) => !earnedIds.includes(b.id));

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
      allBadges: BADGES,
    };
  }, [profile, isLoading]);
}
