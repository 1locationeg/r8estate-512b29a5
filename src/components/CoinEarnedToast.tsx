import { toast } from 'sonner';
import { POINTS_PER_ACTION } from '@/lib/buyerGamification';

type ActionKey = keyof typeof POINTS_PER_ACTION;

export function showCoinToast(action: ActionKey, customMessage?: string) {
  const points = POINTS_PER_ACTION[action];
  const messages: Record<ActionKey, string> = {
    developer_view: 'Developer profile viewed!',
    project_save: 'Project saved!',
    review_write: 'Review submitted!',
    report_unlock: 'Trust report unlocked!',
    community_post: 'Post published!',
    community_reply: 'Reply posted!',
    community_vote: 'Vote counted!',
    helpful_vote: 'Helpful vote recorded!',
    profile_complete: 'Profile completed!',
    verified_purchase: 'Purchase verified!',
  };

  toast.success(customMessage || messages[action], {
    description: `🪙 +${points} coins earned!`,
    duration: 3000,
  });
}
