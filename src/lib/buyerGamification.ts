import { Award, Star, Search, Heart, Shield, MessageSquare, Eye, FileText, Zap, Trophy, CheckCircle2 } from 'lucide-react';

// ── Buyer Tier Definitions ──
export interface BuyerTier {
  id: string;
  name: string;
  emoji: string;
  minPoints: number;
  color: string;
  perks: string[];
}

export const BUYER_TIERS: BuyerTier[] = [
  { id: 'newcomer', name: 'Newcomer', emoji: '🌱', minPoints: 0, color: 'text-muted-foreground', perks: ['Basic access'] },
  { id: 'explorer', name: 'Explorer', emoji: '🔍', minPoints: 50, color: 'text-blue-500', perks: ['Basic access', 'Save up to 20 projects'] },
  { id: 'insider', name: 'Insider', emoji: '⭐', minPoints: 150, color: 'text-amber-500', perks: ['Unlimited saves', 'Comparison reports', 'Priority support'] },
  { id: 'expert', name: 'Expert', emoji: '🏆', minPoints: 350, color: 'text-accent', perks: ['Expert badge on reviews', 'Early access to listings', 'Advanced analytics'] },
  { id: 'ambassador', name: 'Ambassador', emoji: '💎', minPoints: 600, color: 'text-primary', perks: ['VIP events', 'Direct developer contact', 'Exclusive deals', 'Featured reviewer'] },
];

// ── Buyer Badge Definitions ──
export interface BuyerBadgeDef {
  id: string;
  name: string;
  description: string;
  icon: typeof Award;
  points: number;
  category: 'profile' | 'engagement' | 'research' | 'community';
}

export const BUYER_BADGES: BuyerBadgeDef[] = [
  { id: 'profile_complete', name: 'Profile Complete', description: 'Fill in all profile fields', icon: CheckCircle2, points: 30, category: 'profile' },
  { id: 'first_review', name: 'First Review', description: 'Write your first developer review', icon: Star, points: 25, category: 'engagement' },
  { id: 'review_pro', name: 'Review Pro', description: 'Write 5+ reviews', icon: MessageSquare, points: 50, category: 'engagement' },
  { id: 'verified_buyer', name: 'Verified Buyer', description: 'Submit a purchase receipt', icon: Shield, points: 40, category: 'profile' },
  { id: 'explorer', name: 'Explorer', description: 'View 10+ developer profiles', icon: Eye, points: 20, category: 'research' },
  { id: 'collector', name: 'Collector', description: 'Save 5+ projects', icon: Heart, points: 20, category: 'research' },
  { id: 'deep_diver', name: 'Deep Diver', description: 'Unlock 3+ trust reports', icon: FileText, points: 35, category: 'research' },
  { id: 'early_bird', name: 'Early Bird', description: 'Join the platform in its first year', icon: Zap, points: 30, category: 'profile' },
  { id: 'top_reviewer', name: 'Top Reviewer', description: 'Write 10+ detailed reviews', icon: Trophy, points: 80, category: 'community' },
  { id: 'helpful_voter', name: 'Helpful Voter', description: 'Mark 10+ reviews as helpful', icon: Award, points: 25, category: 'community' },
  // Community badges
  { id: 'first_post', name: 'Conversation Starter', description: 'Create your first community post', icon: MessageSquare, points: 15, category: 'community' },
  { id: 'active_poster', name: 'Active Contributor', description: 'Create 5+ community posts', icon: MessageSquare, points: 40, category: 'community' },
  { id: 'first_reply', name: 'Helping Hand', description: 'Reply to a community post', icon: MessageSquare, points: 10, category: 'community' },
  { id: 'reply_streak', name: 'Discussion Leader', description: 'Write 10+ community replies', icon: MessageSquare, points: 50, category: 'community' },
  { id: 'community_voter', name: 'Community Voter', description: 'Vote on 10+ community posts or replies', icon: Award, points: 20, category: 'community' },
  { id: 'community_champion', name: 'Community Champion', description: 'Create 10+ posts and 20+ replies', icon: Trophy, points: 100, category: 'community' },
  // Streak badges
  { id: 'streak_3', name: 'On Fire', description: '3-day activity streak', icon: Zap, points: 10, category: 'engagement' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day activity streak', icon: Zap, points: 25, category: 'engagement' },
  { id: 'streak_14', name: 'Unstoppable', description: '14-day activity streak', icon: Zap, points: 50, category: 'engagement' },
  { id: 'streak_30', name: 'Streak Legend', description: '30-day activity streak', icon: Trophy, points: 100, category: 'engagement' },
];

// ── Buyer Mission Definitions ──
export interface BuyerMissionDef {
  id: string;
  title: string;
  description: string;
  target: number;
  points: number;
  type: 'daily' | 'weekly' | 'milestone';
}

export const BUYER_MISSIONS: BuyerMissionDef[] = [
  { id: 'complete_profile', title: 'Complete Your Profile', description: 'Fill in all your profile details', target: 100, points: 30, type: 'milestone' },
  { id: 'write_3_reviews', title: 'Share Your Experience', description: 'Write 3 developer reviews', target: 3, points: 30, type: 'milestone' },
  { id: 'save_5_projects', title: 'Build Your Shortlist', description: 'Save 5 projects to your list', target: 5, points: 20, type: 'milestone' },
  { id: 'view_10_devs', title: 'Do Your Research', description: 'View 10 developer profiles', target: 10, points: 25, type: 'milestone' },
  { id: 'verify_purchase', title: 'Get Verified', description: 'Submit a purchase receipt for verification', target: 1, points: 40, type: 'milestone' },
  { id: 'create_3_posts', title: 'Join the Community', description: 'Create 3 community posts', target: 3, points: 25, type: 'milestone' },
  { id: 'reply_5_threads', title: 'Share Your Knowledge', description: 'Reply to 5 community threads', target: 5, points: 20, type: 'milestone' },
  { id: 'vote_10_times', title: 'Be Heard', description: 'Vote on 10 community posts or replies', target: 10, points: 15, type: 'milestone' },
];

// ── Buyer Profile Completion ──
export interface BuyerProfileFields {
  full_name?: string | null;
  phone_number?: string | null;
  buyer_type?: string | null;
  budget_range?: string | null;
  avatar_url?: string | null;
  interests?: string[] | null;
}

export function calcBuyerProfileCompletion(fields: BuyerProfileFields): { percent: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ['Full Name', !!fields.full_name?.trim()],
    ['Phone Number', !!fields.phone_number?.trim()],
    ['Buyer Type', !!fields.buyer_type?.trim()],
    ['Budget Range', !!fields.budget_range?.trim()],
    ['Profile Photo', !!fields.avatar_url?.trim()],
    ['Interests', (fields.interests?.length ?? 0) > 0],
  ];

  const filled = checks.filter(([, ok]) => ok).length;
  const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return { percent: Math.round((filled / checks.length) * 100), missing };
}

// ── Tier Calculator ──
export function getBuyerTier(points: number): BuyerTier {
  let current = BUYER_TIERS[0];
  for (const tier of BUYER_TIERS) {
    if (points >= tier.minPoints) current = tier;
  }
  return current;
}

export function getNextBuyerTier(points: number): BuyerTier | null {
  for (const tier of BUYER_TIERS) {
    if (points < tier.minPoints) return tier;
  }
  return null;
}

// ── Buyer Gamification Input ──
export interface BuyerGamificationInput {
  profileCompletion: number;
  reviewsWritten: number;
  developersViewed: number;
  projectsSaved: number;
  reportsUnlocked: number;
  hasVerifiedPurchase: boolean;
  helpfulVotes: number;
  joinedDate: Date;
  communityPosts: number;
  communityReplies: number;
  communityVotes: number;
  currentStreak: number;
  longestStreak: number;
  streakBonusPoints: number;
}

export function calcBuyerEarnedBadges(input: BuyerGamificationInput): string[] {
  const earned: string[] = [];

  if (input.profileCompletion >= 100) earned.push('profile_complete');
  if (input.reviewsWritten >= 1) earned.push('first_review');
  if (input.reviewsWritten >= 5) earned.push('review_pro');
  if (input.reviewsWritten >= 10) earned.push('top_reviewer');
  if (input.hasVerifiedPurchase) earned.push('verified_buyer');
  if (input.developersViewed >= 10) earned.push('explorer');
  if (input.projectsSaved >= 5) earned.push('collector');
  if (input.reportsUnlocked >= 3) earned.push('deep_diver');
  if (input.helpfulVotes >= 10) earned.push('helpful_voter');
  if (input.joinedDate.getFullYear() <= 2026) earned.push('early_bird');
  // Community badges
  if (input.communityPosts >= 1) earned.push('first_post');
  if (input.communityPosts >= 5) earned.push('active_poster');
  if (input.communityReplies >= 1) earned.push('first_reply');
  if (input.communityReplies >= 10) earned.push('reply_streak');
  if (input.communityVotes >= 10) earned.push('community_voter');
  if (input.communityPosts >= 10 && input.communityReplies >= 20) earned.push('community_champion');

  return earned;
}

export function calcBuyerTotalPoints(earnedBadgeIds: string[], profileCompletion: number): number {
  const badgePoints = earnedBadgeIds.reduce((sum, id) => {
    const badge = BUYER_BADGES.find((b) => b.id === id);
    return sum + (badge?.points ?? 0);
  }, 0);
  const profilePoints = Math.floor(profileCompletion / 10) * 3;
  return badgePoints + profilePoints;
}

// ── Buyer Mission Progress ──
export interface BuyerMissionProgress {
  mission: BuyerMissionDef;
  current: number;
  completed: boolean;
}

export function calcBuyerMissionProgress(input: BuyerGamificationInput): BuyerMissionProgress[] {
  return BUYER_MISSIONS.map((m) => {
    let current = 0;
    switch (m.id) {
      case 'complete_profile': current = input.profileCompletion; break;
      case 'write_3_reviews': current = Math.min(input.reviewsWritten, m.target); break;
      case 'save_5_projects': current = Math.min(input.projectsSaved, m.target); break;
      case 'view_10_devs': current = Math.min(input.developersViewed, m.target); break;
      case 'verify_purchase': current = input.hasVerifiedPurchase ? 1 : 0; break;
      case 'create_3_posts': current = Math.min(input.communityPosts, m.target); break;
      case 'reply_5_threads': current = Math.min(input.communityReplies, m.target); break;
      case 'vote_10_times': current = Math.min(input.communityVotes, m.target); break;
    }
    return { mission: m, current, completed: current >= m.target };
  });
}
