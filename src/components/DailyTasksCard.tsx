import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, CheckCircle2, Star, Search, MessageSquare, Eye, Heart, Award, ArrowRight, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: typeof Star;
  route: string;
  storageKey: string;
}

const DAILY_TASKS: DailyTask[] = [
  { id: 'view_developer', title: 'View a Developer', description: 'Check out a developer profile', points: 5, icon: Eye, route: '/directory', storageKey: 'dt_view_dev' },
  { id: 'write_review', title: 'Write a Review', description: 'Share your experience', points: 25, icon: Star, route: '/directory', storageKey: 'dt_write_review' },
  { id: 'community_post', title: 'Join a Discussion', description: 'Post or reply in the community', points: 15, icon: MessageSquare, route: '/community', storageKey: 'dt_community' },
  { id: 'save_project', title: 'Save a Project', description: 'Add a project to your shortlist', points: 5, icon: Heart, route: '/', storageKey: 'dt_save_project' },
  { id: 'search_explore', title: 'Search & Explore', description: 'Search for developers or projects', points: 5, icon: Search, route: '/', storageKey: 'dt_search' },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getCompletedTasks(): string[] {
  const today = getTodayKey();
  const stored = localStorage.getItem('daily_tasks_completed');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (parsed.date !== today) return [];
    return parsed.tasks || [];
  } catch { return []; }
}

export const DailyTasksCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedTasks] = useState<string[]>(getCompletedTasks);

  const completedCount = completedTasks.length;
  const totalTasks = DAILY_TASKS.length;
  const progress = (completedCount / totalTasks) * 100;
  const totalPointsAvailable = DAILY_TASKS.reduce((s, t) => s + t.points, 0);
  const pointsEarned = DAILY_TASKS.filter(t => completedTasks.includes(t.id)).reduce((s, t) => s + t.points, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Daily Set</h3>
            <p className="text-[10px] text-muted-foreground">{completedCount}/{totalTasks} completed</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-coin/15">
          <Coins className="w-3.5 h-3.5 text-coin" />
          <span className="text-xs font-bold text-coin-foreground">{pointsEarned}/{totalPointsAvailable}</span>
        </div>
      </div>

      <Progress value={progress} className="h-1.5 mb-4" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DAILY_TASKS.map((task) => {
          const done = completedTasks.includes(task.id);
          const Icon = task.icon;
          return (
            <button
              key={task.id}
              onClick={() => !done && navigate(task.route)}
              disabled={done}
              className={cn(
                'relative flex flex-col items-center text-center p-3 rounded-xl border transition-all group',
                done
                  ? 'bg-trust-excellent/5 border-trust-excellent/20 cursor-default'
                  : 'bg-card border-border hover:border-primary/40 hover:shadow-sm cursor-pointer'
              )}
            >
              {/* Points badge */}
              <div className={cn(
                'absolute -top-2 -end-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                done ? 'bg-trust-excellent/20 text-trust-excellent' : 'bg-coin/20 text-coin-foreground'
              )}>
                {done ? <CheckCircle2 className="w-3 h-3" /> : <><Coins className="w-3 h-3 text-coin" />+{task.points}</>}
              </div>

              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors',
                done ? 'bg-trust-excellent/10' : 'bg-secondary group-hover:bg-primary/10'
              )}>
                <Icon className={cn('w-5 h-5', done ? 'text-trust-excellent' : 'text-muted-foreground group-hover:text-primary')} />
              </div>

              <p className={cn('text-xs font-semibold leading-tight mb-0.5', done ? 'text-trust-excellent' : 'text-foreground')}>
                {task.title}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">{task.description}</p>

              {!done && (
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
