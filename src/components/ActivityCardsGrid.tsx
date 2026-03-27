import { useNavigate } from 'react-router-dom';
import { Coins, Star, Eye, Heart, MessageSquare, Search, FileText, Users, Trophy, Shield, ArrowRight, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { POINTS_PER_ACTION } from '@/lib/buyerGamification';

interface ActivityCard {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: typeof Star;
  route: string;
  color: string;
  requiresLevel?: number;
}

const ACTIVITIES: ActivityCard[] = [
  { id: 'browse_devs', title: 'Browse Developers', description: 'Explore developer profiles and projects', points: POINTS_PER_ACTION.developer_view, icon: Eye, route: '/directory', color: 'bg-primary/10 text-primary' },
  { id: 'write_review', title: 'Write a Review', description: 'Share your experience with a developer', points: POINTS_PER_ACTION.review_write, icon: Star, route: '/directory', color: 'bg-accent/10 text-accent' },
  { id: 'save_project', title: 'Save a Project', description: 'Bookmark a project to your shortlist', points: POINTS_PER_ACTION.project_save, icon: Heart, route: '/', color: 'bg-brand-red/10 text-brand-red' },
  { id: 'community_post', title: 'Start a Discussion', description: 'Share tips, ask questions, or discuss', points: POINTS_PER_ACTION.community_post, icon: MessageSquare, route: '/community', color: 'bg-trust-excellent/10 text-trust-excellent' },
  { id: 'community_reply', title: 'Reply to a Post', description: 'Help others with your knowledge', points: POINTS_PER_ACTION.community_reply, icon: Users, route: '/community', color: 'bg-blue-500/10 text-blue-500' },
  { id: 'community_vote', title: 'Vote on Posts', description: 'Upvote helpful community content', points: POINTS_PER_ACTION.community_vote, icon: Trophy, route: '/community', color: 'bg-amber-500/10 text-amber-500' },
  { id: 'helpful_vote', title: 'Mark Helpful', description: 'Mark reviews as helpful for others', points: POINTS_PER_ACTION.helpful_vote, icon: Shield, route: '/reviews', color: 'bg-purple-500/10 text-purple-500' },
  { id: 'unlock_report', title: 'Unlock Trust Report', description: 'Get deep insights on a developer', points: POINTS_PER_ACTION.report_unlock, icon: FileText, route: '/directory', color: 'bg-teal-500/10 text-teal-500' },
  { id: 'search_explore', title: 'Search & Discover', description: 'Find developers, projects, and more', points: POINTS_PER_ACTION.developer_view, icon: Search, route: '/', color: 'bg-indigo-500/10 text-indigo-500' },
  { id: 'verify_purchase', title: 'Verify Purchase', description: 'Submit a receipt for verified buyer status', points: POINTS_PER_ACTION.verified_purchase, icon: Shield, route: '/buyer/settings', color: 'bg-emerald-500/10 text-emerald-500', requiresLevel: 2 },
];

interface ActivityCardsGridProps {
  currentTierIndex?: number;
}

export const ActivityCardsGrid = ({ currentTierIndex = 0 }: ActivityCardsGridProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">More Activities</h3>
        <p className="text-[10px] text-muted-foreground">Earn coins by being active</p>
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
              {/* Points badge */}
              <div className="absolute -top-2 -end-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-coin/20 text-[10px] font-bold text-coin-foreground">
                {locked ? <Lock className="w-3 h-3" /> : <><Coins className="w-3 h-3 text-coin" />+{activity.points}</>}
              </div>

              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-2', activity.color)}>
                <Icon className="w-5 h-5" />
              </div>

              <p className="text-xs font-semibold text-foreground leading-tight mb-0.5">{activity.title}</p>
              <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{activity.description}</p>

              {locked && (
                <Badge className="mt-1.5 text-[9px] bg-muted text-muted-foreground border-0">
                  Level {activity.requiresLevel} required
                </Badge>
              )}

              {!locked && (
                <span className="mt-1.5 text-[10px] text-primary font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Go <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
