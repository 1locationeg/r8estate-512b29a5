import { Award, Shield, Star, Image, Users, FileText, MessageSquare, TrendingUp, Zap, Trophy } from 'lucide-react';

// ── Tier Definitions ──
export interface Tier {
  id: string;
  name: string;
  emoji: string;
  minPoints: number;
  color: string; // tailwind class
  perks: string[];
}

export const TIERS: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    emoji: '🌱',
    minPoints: 0,
    color: 'text-muted-foreground',
    perks: ['Basic listing'],
  },
  {
    id: 'bronze',
    name: 'Bronze',
    emoji: '🥉',
    minPoints: 100,
    color: 'text-amber-700',
    perks: ['Basic listing', 'Priority in category'],
  },
  {
    id: 'silver',
    name: 'Silver',
    emoji: '🥈',
    minPoints: 300,
    color: 'text-slate-400',
    perks: ['Priority listing', 'Trust badge on profile', 'Analytics access'],
  },
  {
    id: 'gold',
    name: 'Gold',
    emoji: '🥇',
    minPoints: 600,
    color: 'text-accent',
    perks: ['Featured listing', 'Advanced analytics', 'Priority support', 'Verified badge boost'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    emoji: '💎',
    minPoints: 1000,
    color: 'text-primary',
    perks: ['Homepage spotlight', 'Dedicated account manager', 'Custom branding', 'API access', 'Exclusive events'],
  },
];

// ── Badge Definitions ──
export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: typeof Award;
  points: number;
  category: 'profile' | 'engagement' | 'trust' | 'content';
}

export const BADGES: BadgeDef[] = [
  { id: 'profile_pioneer', name: 'Profile Pioneer', description: 'Complete your profile to 100%', icon: Shield, points: 50, category: 'profile' },
  { id: 'first_review', name: 'First Review', description: 'Receive your first customer review', icon: Star, points: 30, category: 'engagement' },
  { id: 'review_magnet', name: 'Review Magnet', description: 'Receive 10+ reviews', icon: Star, points: 80, category: 'engagement' },
  { id: 'trust_builder', name: 'Trust Builder', description: 'Reach 70+ trust score', icon: TrendingUp, points: 60, category: 'trust' },
  { id: 'quick_responder', name: 'Quick Responder', description: 'Reply to 5+ reviews', icon: MessageSquare, points: 40, category: 'engagement' },
  { id: 'gallery_pro', name: 'Gallery Pro', description: 'Upload 10+ gallery items', icon: Image, points: 30, category: 'content' },
  { id: 'team_player', name: 'Team Player', description: 'Add 3+ team members', icon: Users, points: 25, category: 'profile' },
  { id: 'verified_biz', name: 'Verified Business', description: 'Upload a business license', icon: FileText, points: 50, category: 'trust' },
  { id: 'superstar', name: 'Superstar', description: 'Reach 4.5+ average rating', icon: Trophy, points: 100, category: 'trust' },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Join the platform in its first year', icon: Zap, points: 40, category: 'profile' },
  // Community badges for businesses
  { id: 'community_engaged', name: 'Community Engaged', description: 'Participate in 3+ community discussions', icon: Users, points: 30, category: 'engagement' },
  { id: 'community_leader', name: 'Community Leader', description: 'Create 5+ community posts and 10+ replies', icon: Trophy, points: 60, category: 'engagement' },
];

// ── Mission Definitions ──
export interface MissionDef {
  id: string;
  title: string;
  description: string;
  target: number;
  points: number;
  type: 'daily' | 'weekly' | 'milestone';
}

export const MISSIONS: MissionDef[] = [
  { id: 'complete_profile', title: 'Complete Your Profile', description: 'Fill in all business profile fields', target: 100, points: 50, type: 'milestone' },
  { id: 'get_5_reviews', title: 'Collect 5 Reviews', description: 'Get 5 customer reviews', target: 5, points: 40, type: 'milestone' },
  { id: 'reply_3_reviews', title: 'Engage With Customers', description: 'Reply to 3 reviews this week', target: 3, points: 20, type: 'weekly' },
  { id: 'upload_gallery', title: 'Showcase Your Work', description: 'Upload 5 gallery photos', target: 5, points: 25, type: 'milestone' },
  { id: 'reach_rating_4', title: 'Excellence Standard', description: 'Reach 4.0+ average rating', target: 4, points: 60, type: 'milestone' },
];

// ── Profile Completion Calculator ──
export interface ProfileFields {
  company_name?: string;
  description?: string;
  logo_url?: string;
  location?: string;
  year_established?: number | null;
  employees?: number | null;
  specialties?: string[];
  email?: string;
  phone?: string;
  website?: string;
  license_url?: string;
}

export function calcProfileCompletion(fields: ProfileFields): { percent: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ['Company Name', !!fields.company_name?.trim()],
    ['Description', !!fields.description?.trim()],
    ['Logo', !!fields.logo_url?.trim()],
    ['Location', !!fields.location?.trim()],
    ['Year Established', fields.year_established != null],
    ['Employee Count', fields.employees != null],
    ['Specialties', (fields.specialties?.length ?? 0) > 0],
    ['Email', !!fields.email?.trim()],
    ['Phone', !!fields.phone?.trim()],
    ['Website', !!fields.website?.trim()],
    ['Business License', !!fields.license_url?.trim()],
  ];

  const filled = checks.filter(([, ok]) => ok).length;
  const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return { percent: Math.round((filled / checks.length) * 100), missing };
}

// ── Tier Calculator ──
export function getTier(points: number): Tier {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (points >= tier.minPoints) current = tier;
  }
  return current;
}

export function getNextTier(points: number): Tier | null {
  for (const tier of TIERS) {
    if (points < tier.minPoints) return tier;
  }
  return null;
}

// ── Earned Badges Calculator ──
export interface GamificationInput {
  profileCompletion: number;
  reviewCount: number;
  reviewReplies: number;
  avgRating: number;
  trustScore: number;
  galleryCount: number;
  teamCount: number;
  hasLicense: boolean;
  joinedDate: Date;
  communityPosts: number;
  communityReplies: number;
}

export function calcEarnedBadges(input: GamificationInput): string[] {
  const earned: string[] = [];

  if (input.profileCompletion >= 100) earned.push('profile_pioneer');
  if (input.reviewCount >= 1) earned.push('first_review');
  if (input.reviewCount >= 10) earned.push('review_magnet');
  if (input.trustScore >= 70) earned.push('trust_builder');
  if (input.reviewReplies >= 5) earned.push('quick_responder');
  if (input.galleryCount >= 10) earned.push('gallery_pro');
  if (input.teamCount >= 3) earned.push('team_player');
  if (input.hasLicense) earned.push('verified_biz');
  if (input.avgRating >= 4.5) earned.push('superstar');

  // Early adopter: joined before 2027
  if (input.joinedDate.getFullYear() <= 2026) earned.push('early_adopter');

  return earned;
}

export function calcTotalPoints(earnedBadgeIds: string[], profileCompletion: number): number {
  const badgePoints = earnedBadgeIds.reduce((sum, id) => {
    const badge = BADGES.find((b) => b.id === id);
    return sum + (badge?.points ?? 0);
  }, 0);

  // Bonus points for profile completion
  const profilePoints = Math.floor(profileCompletion / 10) * 5;

  return badgePoints + profilePoints;
}

// ── Mission Progress ──
export interface MissionProgress {
  mission: MissionDef;
  current: number;
  completed: boolean;
}

export function calcMissionProgress(input: GamificationInput): MissionProgress[] {
  return MISSIONS.map((m) => {
    let current = 0;
    switch (m.id) {
      case 'complete_profile':
        current = input.profileCompletion;
        break;
      case 'get_5_reviews':
        current = Math.min(input.reviewCount, m.target);
        break;
      case 'reply_3_reviews':
        current = Math.min(input.reviewReplies, m.target);
        break;
      case 'upload_gallery':
        current = Math.min(input.galleryCount, m.target);
        break;
      case 'reach_rating_4':
        current = input.avgRating >= m.target ? m.target : Math.floor(input.avgRating * 10) / 10;
        break;
    }
    return { mission: m, current, completed: current >= m.target };
  });
}
