import { supabase } from '@/integrations/supabase/client';

type EngagementField = 'developers_viewed' | 'projects_saved' | 'reports_unlocked' | 'helpful_votes';

/**
 * Increment a buyer engagement counter by 1.
 * Creates the row if it doesn't exist yet.
 */
export async function trackBuyerEngagement(userId: string, field: EngagementField) {
  // Try to fetch existing row
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
}
