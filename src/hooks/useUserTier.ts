import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  calcBuyerEarnedBadges,
  calcBuyerTotalPoints,
  calcBuyerProfileCompletion,
  getBuyerTier,
  type BuyerTier,
  type BuyerGamificationInput,
} from '@/lib/buyerGamification';

interface UserTierResult {
  tier: BuyerTier;
  totalPoints: number;
  isLoading: boolean;
}

// Simple in-memory cache to avoid re-fetching the same user's tier
const tierCache = new Map<string, { tier: BuyerTier; totalPoints: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useUserTier(userId: string | undefined): UserTierResult {
  const [result, setResult] = useState<{ tier: BuyerTier; totalPoints: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cached = tierCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setResult({ tier: cached.tier, totalPoints: cached.totalPoints });
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchTier = async () => {
      try {
        const [engRes, profileRes, reviewRes, receiptRes] = await Promise.all([
          supabase
            .from('buyer_engagement')
            .select('developers_viewed, projects_saved, reports_unlocked, helpful_votes, community_posts, community_replies, community_votes')
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('full_name, phone_number, buyer_type, budget_range, avatar_url, interests, created_at')
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
          supabase
            .from('receipt_submissions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'approved'),
        ]);

        if (cancelled) return;

        const eng = engRes.data as any || {};
        const profile = profileRes.data || {};
        const { percent: profileCompletion } = calcBuyerProfileCompletion(profile);

        const input: BuyerGamificationInput = {
          profileCompletion,
          reviewsWritten: reviewRes.count ?? 0,
          developersViewed: eng.developers_viewed ?? 0,
          projectsSaved: eng.projects_saved ?? 0,
          reportsUnlocked: eng.reports_unlocked ?? 0,
          hasVerifiedPurchase: (receiptRes.count ?? 0) > 0,
          helpfulVotes: eng.helpful_votes ?? 0,
          joinedDate: profile.created_at ? new Date(profile.created_at) : new Date(),
          communityPosts: eng.community_posts ?? 0,
          communityReplies: eng.community_replies ?? 0,
          communityVotes: eng.community_votes ?? 0,
        };

        const earnedIds = calcBuyerEarnedBadges(input);
        const totalPoints = calcBuyerTotalPoints(earnedIds, profileCompletion);
        const tier = getBuyerTier(totalPoints);

        const entry = { tier, totalPoints, timestamp: Date.now() };
        tierCache.set(userId, entry);
        setResult({ tier, totalPoints });
      } catch (err) {
        console.error('Error fetching user tier:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTier();
    return () => { cancelled = true; };
  }, [userId]);

  const defaultTier = getBuyerTier(0);
  return {
    tier: result?.tier ?? defaultTier,
    totalPoints: result?.totalPoints ?? 0,
    isLoading,
  };
}
