import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, Medal, Crown, ArrowLeft, MessageSquare, Reply, ThumbsUp, Eye, Heart, Flame, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBuyerTier, BUYER_TIERS } from "@/lib/buyerGamification";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";

interface LeaderboardEntry {
  user_id: string; full_name: string; avatar_url: string | null;
  community_posts: number; community_replies: number; community_votes: number;
  developers_viewed: number; projects_saved: number; helpful_votes: number;
  reports_unlocked: number; total_points: number;
}

const rankIcons = [
  <Crown className="w-5 h-5 text-accent" />,
  <Medal className="w-5 h-5 text-muted-foreground" />,
  <Medal className="w-5 h-5 text-amber-700" />,
];

const Leaderboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"points" | "posts" | "replies">("points");
  const [period, setPeriod] = useState<"week" | "alltime">("week");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const rpcName = period === "week" ? "get_weekly_leaderboard" : "get_leaderboard";
      const { data, error } = await supabase.rpc(rpcName, { _limit: 50 });
      if (!error && data) setEntries(data as LeaderboardEntry[]);
      else setEntries([]);
      setLoading(false);
    };
    fetchLeaderboard();
  }, [period]);

  const sorted = [...entries].sort((a, b) => {
    if (tab === "posts") return b.community_posts - a.community_posts;
    if (tab === "replies") return b.community_replies - a.community_replies;
    return b.total_points - a.total_points;
  });

  const getStatValue = (entry: LeaderboardEntry) => {
    if (tab === "posts") return entry.community_posts;
    if (tab === "replies") return entry.community_replies;
    return entry.total_points;
  };

  const getStatLabel = () => {
    if (tab === "posts") return t("leaderboard.posts", "posts");
    if (tab === "replies") return t("leaderboard.replies", "replies");
    return t("leaderboard.pts", "pts");
  };

  const currentUserRank = user ? sorted.findIndex((e) => e.user_id === user.id) + 1 : 0;

  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);

  return (
    <StationPageWrapper className="min-h-screen bg-background">
      <PageHeader
        title={t("leaderboard.title", "Leaderboard")}
        breadcrumbs={[{ label: t("leaderboard.title", "Leaderboard") }]}
        rightSlot={<LanguageSwitcher />}
      />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 mb-4"><Trophy className="w-8 h-8 text-accent" /></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("leaderboard.title")}</h2>
          <p className="text-muted-foreground text-sm">{t("leaderboard.subtitle")}</p>
        </div>

        <div className="flex items-center justify-center gap-1 mb-6">
          <button onClick={() => setPeriod("week")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${period === "week" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <Calendar className="w-4 h-4" />{t("leaderboard.thisWeek")}
          </button>
          <button onClick={() => setPeriod("alltime")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${period === "alltime" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <Clock className="w-4 h-4" />{t("leaderboard.allTime")}
          </button>
        </div>

        {period === "week" && (
          <div className="text-center mb-4">
            <span className="text-[11px] text-muted-foreground bg-secondary/70 px-3 py-1 rounded-full">
              ⏱ {daysUntilMonday !== 1 ? t("leaderboard.resetsInPlural", { days: daysUntilMonday }) : t("leaderboard.resetsIn", { days: daysUntilMonday })}
            </span>
          </div>
        )}

        {user && currentUserRank > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">#{currentUserRank}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{t("leaderboard.yourRank")}</p>
              <p className="text-xs text-muted-foreground">
                {sorted[currentUserRank - 1]?.total_points ?? 0} {period === "week" ? t("leaderboard.weeklyPoints") : t("leaderboard.totalPoints")} {t("leaderboard.pts")}
              </p>
            </div>
            <div className="text-end">
              <span className="text-sm">{getBuyerTier(sorted[currentUserRank - 1]?.total_points ?? 0).emoji}{" "}{getBuyerTier(sorted[currentUserRank - 1]?.total_points ?? 0).name}</span>
            </div>
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="points" className="gap-1.5 text-xs"><Flame className="w-3.5 h-3.5" /> {t("leaderboard.tabPoints")}</TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5 text-xs"><MessageSquare className="w-3.5 h-3.5" /> {t("leaderboard.tabPosts")}</TabsTrigger>
            <TabsTrigger value="replies" className="gap-1.5 text-xs"><Reply className="w-3.5 h-3.5" /> {t("leaderboard.tabReplies")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary/50 animate-pulse" />)}</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">{period === "week" ? t("leaderboard.noActivityWeek") : t("leaderboard.noContributors")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 0, 2].map((idx) => {
                  const entry = sorted[idx];
                  if (!entry) return null;
                  const tier = getBuyerTier(entry.total_points);
                  const isFirst = idx === 0;
                  return (
                    <div key={entry.user_id} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${isFirst ? "bg-accent/10 border-accent/30 -mt-4 shadow-md" : "bg-card border-border"}`}>
                      <div className="mb-2">{rankIcons[idx]}</div>
                      <Avatar className={`${isFirst ? "h-14 w-14" : "h-11 w-11"} mb-2`}>
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">{entry.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-semibold text-foreground text-center truncate w-full">{entry.full_name}</p>
                      <span className="text-[10px] text-muted-foreground">{tier.emoji} {tier.name}</span>
                      <p className={`text-sm font-bold mt-1 ${isFirst ? "text-accent" : "text-primary"}`}>{getStatValue(entry)} {getStatLabel()}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {sorted.slice(sorted.length >= 3 ? 3 : 0).map((entry, i) => {
              const rank = (sorted.length >= 3 ? 3 : 0) + i + 1;
              const tier = getBuyerTier(entry.total_points);
              const isCurrentUser = user?.id === entry.user_id;
              return (
                <div key={entry.user_id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isCurrentUser ? "bg-primary/5 border-primary/20" : "bg-card border-border hover:bg-secondary/50"}`}>
                  <span className="w-8 text-center text-sm font-bold text-muted-foreground">{rank}</span>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{entry.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {entry.full_name}{isCurrentUser && <span className="ms-1.5 text-[10px] text-primary font-normal">{t("leaderboard.you")}</span>}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{tier.emoji} {tier.name}</span><span>·</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" /> {entry.community_posts}</span>
                      <span className="flex items-center gap-0.5"><Reply className="w-2.5 h-2.5" /> {entry.community_replies}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" /> {entry.community_votes}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold text-primary">{getStatValue(entry)}</p>
                    <p className="text-[10px] text-muted-foreground">{getStatLabel()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 bg-secondary/50 border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />{t("leaderboard.howPointsWork")}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> {t("leaderboard.communityPost")}: <span className="font-medium text-foreground">15 {t("leaderboard.pts")}</span></div>
            <div className="flex items-center gap-1.5"><Reply className="w-3 h-3" /> {t("leaderboard.reply")}: <span className="font-medium text-foreground">10 {t("leaderboard.pts")}</span></div>
            <div className="flex items-center gap-1.5"><ThumbsUp className="w-3 h-3" /> {t("leaderboard.vote")}: <span className="font-medium text-foreground">5 {t("leaderboard.pts")}</span></div>
            <div className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {t("leaderboard.developerView")}: <span className="font-medium text-foreground">2 {t("leaderboard.pts")}</span></div>
            <div className="flex items-center gap-1.5"><Heart className="w-3 h-3" /> {t("leaderboard.projectSaved")}: <span className="font-medium text-foreground">4 {t("leaderboard.pts")}</span></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {BUYER_TIERS.filter(t => t.id !== 'newcomer').map((tier) => (
              <span key={tier.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-card border border-border">
                {tier.emoji} {tier.name}<span className="text-muted-foreground">({tier.minPoints}+)</span>
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </StationPageWrapper>
  );
};

export default Leaderboard;