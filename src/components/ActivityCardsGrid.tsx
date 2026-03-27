import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Coins, Star, Eye, Heart, MessageSquare, Search, FileText, Users, Trophy, Shield, ArrowRight, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { POINTS_PER_ACTION } from '@/lib/buyerGamification';

interface ActivityCard {
  id: string;
  titleKey: string;
  descKey: string;
  points: number;
  icon: typeof Star;
  route: string;
  color: string;
  requiresLevel?: number;
}

const ACTIVITIES: ActivityCard[] = [
  { id: 'browse_devs', titleKey: 'gamification.browseDevelopers', descKey: 'gamification.browseDevelopersDesc', points: POINTS_PER_ACTION.developer_view, icon: Eye, route: '/directory', color: 'bg-primary/10 text-primary' },
  { id: 'write_review', titleKey: 'gamification.writeReviewActivity', descKey: 'gamification.writeReviewActivityDesc', points: POINTS_PER_ACTION.review_write, icon: Star, route: '/directory', color: 'bg-accent/10 text-accent' },
  { id: 'save_project', titleKey: 'gamification.saveProjectActivity', descKey: 'gamification.saveProjectActivityDesc', points: POINTS_PER_ACTION.project_save, icon: Heart, route: '/', color: 'bg-brand-red/10 text-brand-red' },
  { id: 'community_post', titleKey: 'gamification.startDiscussion', descKey: 'gamification.startDiscussionDesc', points: POINTS_PER_ACTION.community_post, icon: MessageSquare, route: '/community', color: 'bg-trust-excellent/10 text-trust-excellent' },
  { id: 'community_reply', titleKey: 'gamification.replyToPost', descKey: 'gamification.replyToPostDesc', points: POINTS_PER_ACTION.community_reply, icon: Users, route: '/community', color: 'bg-blue-500/10 text-blue-500' },
  { id: 'community_vote', titleKey: 'gamification.voteOnPosts', descKey: 'gamification.voteOnPostsDesc', points: POINTS_PER_ACTION.community_vote, icon: Trophy, route: '/community', color: 'bg-amber-500/10 text-amber-500' },
  { id: 'helpful_vote', titleKey: 'gamification.markHelpful', descKey: 'gamification.markHelpfulDesc', points: POINTS_PER_ACTION.helpful_vote, icon: Shield, route: '/reviews', color: 'bg-purple-500/10 text-purple-500' },
  { id: 'unlock_report', titleKey: 'gamification.unlockReport', descKey: 'gamification.unlockReportDesc', points: POINTS_PER_ACTION.report_unlock, icon: FileText, route: '/directory', color: 'bg-teal-500/10 text-teal-500' },
  { id: 'search_explore', titleKey: 'gamification.searchDiscover', descKey: 'gamification.searchDiscoverDesc', points: POINTS_PER_ACTION.developer_view, icon: Search, route: '/', color: 'bg-indigo-500/10 text-indigo-500' },
  { id: 'verify_purchase', titleKey: 'gamification.verifyPurchase', descKey: 'gamification.verifyPurchaseDesc', points: POINTS_PER_ACTION.verified_purchase, icon: Shield, route: '/buyer/settings', color: 'bg-emerald-500/10 text-emerald-500', requiresLevel: 2 },
];

interface ActivityCardsGridProps {
  currentTierIndex?: number;
}

export const ActivityCardsGrid = ({ currentTierIndex = 0 }: ActivityCardsGridProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t("gamification.moreActivities")}</h3>
        <p className="text-[10px] text-muted-foreground">{t("gamification.earnByActive")}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACTIVITIES.map((activity) => {
          const Icon = activity.icon;
          const locked = activity.requiresLevel && currentTierIndex < activity.requiresLevel;
          
          return (
            <button
              key={activity.id}
              onClick={() => !locked && navigate(activity.route)}
              disabled={!!locked}
              className={cn(
                'relative flex flex-col items-center text-center p-3 rounded-xl border transition-all group',
                locked
                  ? 'bg-muted/30 border-border opacity-60 cursor-not-allowed'
                  : 'bg-card border-border hover:border-primary/40 hover:shadow-sm cursor-pointer'
              )}
            >
              <div className="absolute -top-2 -end-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-coin/20 text-[10px] font-bold text-coin-foreground">
                {locked ? <Lock className="w-3 h-3" /> : <><Coins className="w-3 h-3 text-coin" />+{activity.points}</>}
              </div>

              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-2', activity.color)}>
                <Icon className="w-5 h-5" />
              </div>

              <p className="text-xs font-semibold text-foreground leading-tight mb-0.5">{t(activity.titleKey)}</p>
              <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{t(activity.descKey)}</p>

              {locked && (
                <Badge className="mt-1.5 text-[9px] bg-muted text-muted-foreground border-0">
                  {t("gamification.levelRequired", { level: activity.requiresLevel })}
                </Badge>
              )}

              {!locked && (
                <span className="mt-1.5 text-[10px] text-primary font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("gamification.go")} <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
