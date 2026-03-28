import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Coins, Star, MessageSquare, FileText, Building2, Users, Rocket, ArrowRight, Lock, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BusinessActivity {
  id: string;
  titleKey: string;
  descKey: string;
  points: number;
  icon: typeof Star;
  route: string;
  color: string;
  requiresLevel?: number;
}

const BUSINESS_ACTIVITIES: BusinessActivity[] = [
  { id: 'complete_profile', titleKey: 'businessDashboard.actCompleteProfile', descKey: 'businessDashboard.actCompleteProfileDesc', points: 10, icon: Building2, route: '/business/profile', color: 'bg-business-border/10 text-business-border' },
  { id: 'reply_review', titleKey: 'businessDashboard.actReplyReview', descKey: 'businessDashboard.actReplyReviewDesc', points: 15, icon: MessageSquare, route: '/business/reviews', color: 'bg-accent/10 text-accent' },
  { id: 'request_review', titleKey: 'businessDashboard.actRequestReview', descKey: 'businessDashboard.actRequestReviewDesc', points: 10, icon: Phone, route: '/business/whatsapp-reviews', color: 'bg-trust-excellent/10 text-trust-excellent' },
  { id: 'submit_deal', titleKey: 'businessDashboard.actSubmitDeal', descKey: 'businessDashboard.actSubmitDealDesc', points: 20, icon: Rocket, route: '/business/deals/new', color: 'bg-amber-500/10 text-amber-500' },
  { id: 'add_project', titleKey: 'businessDashboard.actAddProject', descKey: 'businessDashboard.actAddProjectDesc', points: 15, icon: FileText, route: '/business/projects', color: 'bg-primary/10 text-primary' },
  { id: 'community_post', titleKey: 'businessDashboard.actCommunityPost', descKey: 'businessDashboard.actCommunityPostDesc', points: 10, icon: Users, route: '/community', color: 'bg-blue-500/10 text-blue-500' },
];

interface BusinessActivityCardsProps {
  currentTierIndex?: number;
}

export const BusinessActivityCards = ({ currentTierIndex = 0 }: BusinessActivityCardsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t('businessDashboard.growActions')}</h3>
        <p className="text-[10px] text-muted-foreground">{t('businessDashboard.earnByGrowing')}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {BUSINESS_ACTIVITIES.map((activity) => {
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
                  : 'bg-card border-border hover:border-business-border/40 hover:shadow-sm cursor-pointer'
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
                  {t('gamification.levelRequired', { level: activity.requiresLevel })}
                </Badge>
              )}

              {!locked && (
                <span className="mt-1.5 text-[10px] text-business-border font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('gamification.go')} <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
