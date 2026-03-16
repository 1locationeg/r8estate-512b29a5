import { supabase } from '@/integrations/supabase/client';

type EngagementField = 'developers_viewed' | 'projects_saved' | 'reports_unlocked' | 'helpful_votes' | 'community_posts' | 'community_replies' | 'community_votes';

/**
 * Increment a buyer engagement counter by 1.
 * Creates the row if it doesn't exist yet.
 * Also increments the weekly engagement table and updates daily streak.
 */
export async function trackBuyerEngagement(userId: string, field: EngagementField) {
  // All-time tracking
  const { data } = await supabase
    .from('buyer_engagement')
    .select('id, ' + field)
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    const currentVal = (data as Record<string, any>)[field] ?? 0;
    await supabase
      .from('buyer_engagement')
      .update({ [field]: currentVal + 1 })
      .eq('user_id', userId);
  } else {
    await supabase
      .from('buyer_engagement')
      .insert({ user_id: userId, [field]: 1 });
  }

  // Weekly tracking + streak (fire and forget)
  trackWeeklyEngagement(userId, field);
  updateStreak(userId);
}

async function updateStreak(userId: string) {
  try {
    await supabase.rpc('update_user_streak', { _user_id: userId });
  } catch (err) {
    console.error('Error updating streak:', err);
  }
}

async function trackWeeklyEngagement(userId: string, field: EngagementField) {
  const weekStart = getWeekStart();

  const { data } = await supabase
    .from('weekly_buyer_engagement')
    .select('id, ' + field)
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (data) {
    const currentVal = (data as Record<string, any>)[field] ?? 0;
    await supabase
      .from('weekly_buyer_engagement')
      .update({ [field]: currentVal + 1 })
      .eq('id', (data as any).id);
  } else {
    await supabase
      .from('weekly_buyer_engagement')
      .insert({ user_id: userId, [field]: 1, week_start: weekStart });
  }
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
}
