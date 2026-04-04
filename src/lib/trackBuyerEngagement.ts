import { supabase } from '@/integrations/supabase/client';

type EngagementField = 'developers_viewed' | 'projects_saved' | 'reports_unlocked' | 'helpful_votes' | 'community_posts' | 'community_replies' | 'community_votes';

/**
 * Increment a buyer engagement counter by 1 via secure server-side RPC.
 * Creates the row if it doesn't exist yet.
 * Also increments the weekly engagement table and updates daily streak.
 */
export async function trackBuyerEngagement(userId: string, field: EngagementField) {
  try {
    await supabase.rpc('increment_engagement', { _field: field });
  } catch (err) {
    console.error('Error tracking engagement:', err);
  }
}
