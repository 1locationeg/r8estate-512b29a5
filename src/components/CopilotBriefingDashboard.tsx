import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, MapPin, TrendingUp, Shield, MessageCircle, Settings2,
  Loader2, Send, Bot, Search, AlertTriangle, Info, Zap, Clock,
  Rocket, Tag, CreditCard, TrendingDown, FileCheck, Users,
  ArrowRight, Eye, Scale, ChevronRight, Bookmark, Heart, Star,
  Activity, Target, BarChart3, Radio, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

interface RiskFlag {
  business: string;
  business_id: string;
  risk: "High" | "Medium" | "Low";
  reason: string;
  delta: number;
  current_avg: number | null;
  prior_avg: number | null;
}

interface Preferences {
  purpose: string;
  budget_range: string;
  preferred_locations: string[];
  concerns: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UserActivity {
  savedItems: any[];
  followedDevelopers: any[];
  userReviews: any[];
  interests: any[];
  engagement: any | null;
  streak: any | null;
}

interface CopilotBriefingDashboardProps {
  preferences: Preferences;
  riskFlags: RiskFlag[];
  onEditPreferences: () => void;
}

const AGENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/copilot-agent`;

const BUDGET_LABELS: Record<string, string> = {
  under_2m: "Under 2M EGP", "2m_5m": "2–5M EGP", "5m_10m": "5–10M EGP",
  "10m_20m": "10–20M EGP", "20m_plus": "20M+ EGP",
};
const PURPOSE_LABELS: Record<string, string> = {
  first_home: "First Home", investment: "Investment", resale: "Resale",
  vacation: "Vacation Home", commercial: "Commercial",
};

/* ── Agent Status Bar ── */
const CYCLING_TEXTS = [
  "Monitoring your locations...",
  "Scanning trust scores...",
  "Checking new launches...",
  "Analyzing market trends...",
  "Watching developer reviews...",
];

const AgentStatusBar = ({ preferences, name, onEdit, followCount }: {
  preferences: Preferences; name: string; onEdit: () => void; followCount: number;
}) => {
  const [textIdx, setTextIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTextIdx(i => (i + 1) % CYCLING_TEXTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const budgetLabel = BUDGET_LABELS[preferences.budget_range] || preferences.budget_range;

  return (
    <div className="flex items-center justify-between ai-slide-up">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-xl flex items-center justify-center ai-breathe ai-shimmer-border" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--glow-subtle)) 40%, hsl(var(--accent)) 70%, hsl(var(--brand-red)) 100%)' }}>
          <Sparkles className="w-5 h-5 text-primary-foreground relative z-10 drop-shadow-[0_0_6px_hsla(var(--accent),0.6)]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 ring-background z-10" style={{ background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--trust-excellent)))' }}>
            <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: 'hsl(var(--accent))' }} />
          </span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            R8 Agent {name ? <span className="text-sm font-normal text-muted-foreground">for {name}</span> : ""}
          </h1>
          <p className="text-xs text-primary font-medium transition-all duration-300" key={textIdx}>
            {CYCLING_TEXTS[textIdx]}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {preferences.preferred_locations.length} locations · {PURPOSE_LABELS[preferences.purpose]} · {budgetLabel}
            {followCount > 0 && ` · ${followCount} developers tracked`}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit} title="Edit preferences" className="hover:bg-primary/5">
        <Settings2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

/* ── Agent Activity Log ── */
interface ActivityEntry { icon: React.ReactNode; text: string; time: string; }

const AgentActivityLog = ({ entries }: { entries: ActivityEntry[] }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    if (visibleCount < entries.length) {
      const t = setTimeout(() => setVisibleCount(c => c + 1), 600);
      return () => clearTimeout(t);
    }
  }, [visibleCount, entries.length]);

  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-3 ai-scan-line">
      <div className="flex items-center gap-2 mb-2">
        <Radio className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Agent Activity</span>
        <span className="text-[10px] text-muted-foreground ml-auto">Live</span>
      </div>
      <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-hide">
        {entries.slice(0, visibleCount).map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-xs ai-log-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="text-primary/70 shrink-0">{e.icon}</span>
            <span className="text-foreground/80 flex-1">{e.text}</span>
            <span className="text-[10px] text-muted-foreground/50 shrink-0">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Agent Action Card (replaces AlertCard) ── */
interface AgentActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  onLink: () => void;
  variant?: "warning" | "info" | "success";
  badge?: string;
  delay?: number;
}
const AgentActionCard = ({ icon, title, description, linkText, onLink, variant = "info", badge, delay = 0 }: AgentActionCardProps) => (
  <div
    className={`rounded-lg border-l-4 px-4 py-3 ai-scale-in ${
      variant === "warning"
        ? "border-l-amber-400 bg-amber-50 dark:bg-amber-950/20"
        : variant === "success"
        ? "border-l-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
        : "border-l-primary/60 bg-primary/5 dark:bg-primary/10"
    }`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mb-0.5">Agent decided · just now</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <button onClick={onLink} className="text-xs font-medium text-foreground hover:text-primary mt-1 inline-flex items-center gap-0.5 transition-colors">
          {linkText} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
);

/* ── Section Heading ── */
const SectionHeading = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-0.5">
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-muted-foreground ml-7">{subtitle}</p>}
  </div>
);

/* ── Activity Stat Pill ── */
const StatPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
    <span className="text-muted-foreground">{icon}</span>
    <div>
      <p className="text-lg font-bold text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  </div>
);

/* ── Tool Execution Steps ── */
const TOOL_STEPS = [
  "Connecting to reviews database...",
  "Analyzing reviews...",
  "Computing trust scores...",
  "Generating insights...",
];

const ToolExecutionSteps = ({ active }: { active: boolean }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) { setStep(0); return; }
    if (step < TOOL_STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 800);
      return () => clearTimeout(t);
    }
  }, [active, step]);

  if (!active) return null;

  return (
    <div className="flex justify-start">
      <div className="ai-glass rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
        <div className="space-y-1.5">
          {TOOL_STEPS.map((label, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${
              i < step ? "text-primary" : i === step ? "text-foreground" : "text-muted-foreground/20"
            }`}>
              {i < step ? (
                <CheckCircle2 className="w-3 h-3 text-primary" />
              ) : i === step ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
              ) : (
                <span className="w-3 h-3 rounded-full border border-border" />
              )}
              <span>{label}</span>
              {i < step && <span className="text-[9px] text-primary/50">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CopilotBriefingDashboard = ({ preferences, riskFlags, onEditPreferences }: CopilotBriefingDashboardProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live data
  const [recentReviewCount, setRecentReviewCount] = useState(0);
  const [activeLaunches, setActiveLaunches] = useState<any[]>([]);
  const [activeDeals, setActiveDeals] = useState<any[]>([]);
  const [trustDropCount, setTrustDropCount] = useState(0);

  // User activity
  const [activity, setActivity] = useState<UserActivity>({
    savedItems: [], followedDevelopers: [], userReviews: [], interests: [], engagement: null, streak: null,
  });

  const name = profile?.full_name?.split(" ")[0] || "";

  // Fetch live data + user activity
  useEffect(() => {
    if (!user) return;
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const load = async () => {
      const [revRes, launchRes, dealRes, savedRes, followedRes, reviewsRes, interestsRes, engRes, streakRes] = await Promise.all([
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved").gte("created_at", weekAgo),
        supabase.from("launches").select("id, project_name, location_district, current_price_per_m2, status, down_payment_pct, installment_years")
          .in("status", ["reservations_open", "upcoming"]).order("created_at", { ascending: false }).limit(5),
        supabase.from("deals").select("id, headline, business_id, price, down_payment_percent, deal_type")
          .eq("status", "verified").order("created_at", { ascending: false }).limit(5),
        supabase.from("saved_items").select("item_name, item_type, item_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("followed_businesses").select("business_name, business_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("reviews").select("developer_name, rating, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("user_interests").select("entity_name, interest_type, strength").eq("user_id", user.id).order("strength", { ascending: false }).limit(10),
        supabase.from("buyer_engagement").select("developers_viewed, projects_saved, reports_unlocked, helpful_votes, community_posts, community_replies").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
      ]);
      setRecentReviewCount(revRes.count || 0);
      setActiveLaunches(launchRes.data || []);
      setActiveDeals(dealRes.data || []);
      setTrustDropCount(riskFlags.filter(f => f.delta < 0).length);
      setActivity({
        savedItems: savedRes.data || [],
        followedDevelopers: followedRes.data || [],
        userReviews: reviewsRes.data || [],
        interests: interestsRes.data || [],
        engagement: engRes.data || null,
        streak: streakRes.data || null,
      });
    };
    load();
  }, [user, riskFlags]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setToolStatus(null);
    let assistantSoFar = "";
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const resp = await fetch(AGENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg], preferences }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            if (parsed.tool_status) {
              if (parsed.tools_used?.length) {
                setToolStatus(`Queried: ${parsed.tools_used.join(", ")}`);
                setTimeout(() => setToolStatus(null), 3000);
              }
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              const snap = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snap } : m);
                return [...prev, { role: "assistant", content: snap }];
              });
            }
          } catch { break; }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble. Please try again." }]);
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  };

  const budgetLabel = BUDGET_LABELS[preferences.budget_range] || preferences.budget_range;
  const hasActivity = activity.savedItems.length > 0 || activity.followedDevelopers.length > 0 || activity.userReviews.length > 0;
  const eng = activity.engagement;

  // Build agent activity log entries from state
  const agentLogEntries: ActivityEntry[] = [];
  if (activity.followedDevelopers.length > 0) {
    agentLogEntries.push({ icon: <Eye className="w-3 h-3" />, text: `Scanned ${activity.followedDevelopers.length} developers you follow for trust changes`, time: "2m ago" });
  }
  if (activeLaunches.length > 0) {
    agentLogEntries.push({ icon: <Rocket className="w-3 h-3" />, text: `Found ${activeLaunches.length} launches matching your budget`, time: "3m ago" });
  }
  if (trustDropCount > 0) {
    agentLogEntries.push({ icon: <AlertTriangle className="w-3 h-3" />, text: `Flagged ${trustDropCount} developer${trustDropCount > 1 ? "s" : ""} with declining reviews`, time: "4m ago" });
  }
  if (recentReviewCount > 0) {
    agentLogEntries.push({ icon: <Star className="w-3 h-3" />, text: `Processed ${recentReviewCount} new verified reviews this week`, time: "5m ago" });
  }
  if (activity.savedItems.length > 0) {
    agentLogEntries.push({ icon: <Bookmark className="w-3 h-3" />, text: `Updated portfolio risk assessment for ${activity.savedItems.length} saved items`, time: "6m ago" });
  }
  agentLogEntries.push({ icon: <MapPin className="w-3 h-3" />, text: `Monitoring ${preferences.preferred_locations.join(", ")}`, time: "8m ago" });

  // Dynamic quick prompts
  const dynamicPrompts: string[] = [];
  if (activity.followedDevelopers.length > 0) dynamicPrompts.push(`Trust update on ${activity.followedDevelopers[0].business_name}`);
  if (activity.savedItems.length > 0) dynamicPrompts.push("Compare my saved projects");
  if (activity.userReviews.length > 0) dynamicPrompts.push("How do my reviewed developers rank?");
  if (activity.interests.length > 0) dynamicPrompts.push(`New launches near ${activity.interests[0]?.entity_name || "my interests"}`);
  dynamicPrompts.push("Top-rated developers in my areas");
  dynamicPrompts.push("What should I watch out for?");
  const quickPrompts = dynamicPrompts.slice(0, 5);

  return (
    <div className="space-y-8 relative">
      {/* ── Agent Status Bar ── */}
      <AgentStatusBar
        preferences={preferences}
        name={name}
        onEdit={onEditPreferences}
        followCount={activity.followedDevelopers.length}
      />

      {/* ── Agent Activity Log ── */}
      <AgentActivityLog entries={agentLogEntries} />

      {/* ── Your Activity Context ── */}
      <section className="ai-scale-in">
        <SectionHeading
          icon={<Activity className="w-5 h-5" />}
          title="Your Profile"
          subtitle="Everything you do on R8Estate makes your agent smarter"
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatPill icon={<Heart className="w-4 h-4" />} label="Following" value={activity.followedDevelopers.length} />
          <StatPill icon={<Bookmark className="w-4 h-4" />} label="Saved" value={activity.savedItems.length} />
          <StatPill icon={<Star className="w-4 h-4" />} label="Reviews" value={activity.userReviews.length} />
          <StatPill icon={<Zap className="w-4 h-4" />} label="Day Streak" value={activity.streak?.current_streak || 0} />
        </div>

        {/* Engagement insights */}
        {eng && (eng.developers_viewed > 0 || eng.community_posts > 0) && (
          <div className="rounded-lg border border-border bg-card p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Your Engagement</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {eng.developers_viewed > 0 && <span>{eng.developers_viewed} developers viewed</span>}
              {eng.projects_saved > 0 && <span>· {eng.projects_saved} projects saved</span>}
              {eng.community_posts > 0 && <span>· {eng.community_posts} community posts</span>}
              {eng.helpful_votes > 0 && <span>· {eng.helpful_votes} helpful votes received</span>}
            </div>
          </div>
        )}

        {/* Followed Developers */}
        {activity.followedDevelopers.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Developers You Follow</h3>
              </div>
              <button onClick={() => navigate("/portfolio")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.followedDevelopers.map((dev, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(`What's the latest trust score and reviews for ${dev.business_name}?`)}
                  className="text-xs px-3 py-1.5 rounded-full ai-glass border border-primary/15 text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center gap-1.5"
                >
                  <Heart className="w-3 h-3 text-primary" />
                  {dev.business_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Items */}
        {activity.savedItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Saved Items</h3>
              </div>
              <button onClick={() => navigate("/portfolio")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.savedItems.slice(0, 6).map((item, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(`Tell me about ${item.item_name}`)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-foreground hover:bg-muted/50 transition-all flex items-center gap-1.5"
                >
                  <Bookmark className="w-3 h-3 text-muted-foreground" />
                  {item.item_name}
                  <span className="text-[10px] text-muted-foreground capitalize">({item.item_type})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interests cloud */}
        {activity.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">Your Interest Map</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.interests.slice(0, 8).map((interest, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(`Show me updates on ${interest.entity_name}`)}
                  className="text-xs px-3 py-1.5 rounded-full ai-glass border border-accent/15 text-foreground hover:bg-accent/10 transition-all"
                  style={{ opacity: 0.6 + (interest.strength / 10) * 0.4 }}
                >
                  {interest.entity_name}
                  <span className="ml-1 text-[9px] text-muted-foreground">
                    {"●".repeat(Math.min(Math.ceil(interest.strength / 2), 5))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Your Reviews */}
        {activity.userReviews.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">Your Reviews</h3>
            </div>
            <div className="space-y-1.5">
              {activity.userReviews.slice(0, 3).map((rev, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(`How is ${rev.developer_name} doing compared to when I reviewed them?`)}
                  className="w-full text-left rounded-md border border-border bg-card px-3 py-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{rev.developer_name}</span>
                    <span className="text-xs text-amber-500">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                  </div>
                  {rev.title && <p className="text-xs text-muted-foreground truncate">{rev.title}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasActivity && (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Start exploring to personalize your agent</p>
            <p className="text-xs text-muted-foreground/60">Save items, follow developers, write reviews — every action makes R8 Agent smarter for you.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/developers")} className="text-xs">
                <Eye className="w-3 h-3 mr-1" /> Browse Developers
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/launch-watch")} className="text-xs">
                <Rocket className="w-3 h-3 mr-1" /> View Launches
              </Button>
            </div>
          </div>
        )}
      </section>

      <div className="ai-divider-glow" />

      {/* ── Profile Match Bar ── */}
      <div className="flex items-center gap-3 flex-wrap rounded-lg border border-border bg-card px-4 py-2.5 ai-scale-in">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Profile match:</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Budget up to {budgetLabel}</span>
        {preferences.preferred_locations.slice(0, 3).map(loc => (
          <span key={loc} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{loc}</span>
        ))}
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{PURPOSE_LABELS[preferences.purpose] || preferences.purpose}</span>
      </div>

      {/* ═══ SECTION 1: RESEARCH ═══ */}
      <section>
        <SectionHeading icon={<Search className="w-5 h-5" />} title="Research" />
        <div className="space-y-3 mb-5">
          {trustDropCount > 0 && (
            <AgentActionCard
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
              title="Trust Score Alert"
              description={`${trustDropCount} developer${trustDropCount > 1 ? "s" : ""} on your shortlist had their trust score drop this week.`}
              linkText="Want me to investigate?"
              onLink={() => navigate("/developers")}
              variant="warning"
              badge="Risk flagged"
              delay={0}
            />
          )}
          {recentReviewCount > 0 && (
            <AgentActionCard
              icon={<Info className="w-4 h-4 text-primary" />}
              title="New Verified Reviews"
              description={`${recentReviewCount} new verified reviews added this week.`}
              linkText="Should I summarize them?"
              onLink={() => navigate("/reviews")}
              delay={200}
            />
          )}
          {activity.followedDevelopers.length > 0 && (
            <AgentActionCard
              icon={<Heart className="w-4 h-4 text-emerald-600" />}
              title="Agent is Monitoring"
              description={`Actively tracking ${activity.followedDevelopers.length} developer${activity.followedDevelopers.length > 1 ? "s" : ""} you follow for trust score changes.`}
              linkText="View Portfolio"
              onLink={() => navigate("/portfolio")}
              variant="success"
              badge="Auto-tracking"
              delay={400}
            />
          )}
        </div>

        {/* Trust Radar Alerts */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-base font-bold text-foreground">Trust Radar Alerts</h3>
          </div>
          {riskFlags.length === 0 ? (
            <p className="text-sm text-muted-foreground ml-6">No new trust alerts. All monitored developers are stable.</p>
          ) : (
            <div className="space-y-2 ml-6">
              {riskFlags.map((f, i) => (
                <div key={i} className={`flex items-start gap-2 text-sm rounded-md px-3 py-2 border-l-4 ${
                  f.risk === "High" ? "border-l-destructive bg-destructive/5" : "border-l-amber-400 bg-amber-50 dark:bg-amber-950/20"
                }`}>
                  {f.delta < 0 ? <TrendingDown className="w-4 h-4 text-destructive mt-0.5 shrink-0" /> : <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{f.business} — {Math.abs(f.delta)}% {f.delta < 0 ? "drop" : "rise"}</p>
                    <p className="text-xs text-muted-foreground">{f.reason}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold shrink-0">Agent flagged</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Developer DNA */}
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">Developer DNA Cards</h3>
        </div>
        <p className="text-sm text-muted-foreground ml-6 mb-2">Top developers matching your profile — ranked by trust score and buyer fit.</p>
        <button onClick={() => sendMessage("Show me top-rated developers in " + preferences.preferred_locations.join(", "))} className="ml-6 text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
          Ask Agent to generate <ChevronRight className="w-3 h-3" />
        </button>
      </section>

      <div className="ai-divider-glow" />

      {/* ═══ SECTION 2: CHOOSE ═══ */}
      <section>
        <SectionHeading icon={<Rocket className="w-5 h-5" />} title="Choose" />
        <div className="space-y-3 mb-5">
          {activeLaunches.length > 0 && (
            <AgentActionCard
              icon={<Zap className="w-4 h-4 text-primary" />}
              title="Phase 2 Launching Soon"
              description={`${activeLaunches[0]?.project_name || "A project"} moves to Phase 2 soon — price likely +8% over current Phase 1.`}
              linkText="Should I compare phases?"
              onLink={() => navigate("/launch-watch")}
              badge="Agent picked"
            />
          )}
          <AgentActionCard
            icon={<Info className="w-4 h-4 text-primary" />}
            title="New Payment Plan"
            description={`A new payment plan just matched your budget window: 5% down, 10 years.`}
            linkText="Want me to calculate?"
            onLink={() => navigate("/deal-watch")}
            badge="Matched for you"
            delay={200}
          />
        </div>

        {/* Launch Watch Feed */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">Launch Watch Feed</h3>
            </div>
            <button onClick={() => navigate("/launch-watch")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {activeLaunches.length === 0 ? (
            <p className="text-sm text-muted-foreground ml-6">No active launches found in your preferred areas.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
              {activeLaunches.slice(0, 3).map((l, idx) => (
                <div key={l.id} className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer relative" onClick={() => navigate("/launch-watch")}>
                  {idx === 0 && (
                    <span className="absolute -top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Agent picked</span>
                  )}
                  <p className="text-sm font-semibold text-foreground truncate">{l.project_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{l.location_district}</p>
                  {l.current_price_per_m2 && <p className="text-xs font-medium text-primary mt-1">{Number(l.current_price_per_m2).toLocaleString()} EGP/m²</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deal Watch */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">Deal Watch</h3>
            </div>
            <button onClick={() => navigate("/deal-watch")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {activeDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active deals in your watchlist to compare.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Down %</th>
                </tr></thead>
                <tbody>
                  {activeDeals.slice(0, 4).map((d, idx) => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => navigate("/deal-watch")}>
                      <td className="px-3 py-2 font-medium text-foreground truncate max-w-[180px]">
                        {d.headline}
                        {idx === 0 && <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent-foreground font-semibold">Matched</span>}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground capitalize">{d.deal_type?.replace("_", " ") || "—"}</td>
                      <td className="px-3 py-2 text-right text-foreground">{d.price ? `${Number(d.price).toLocaleString()} EGP` : "—"}</td>
                      <td className="px-3 py-2 text-right text-foreground">{d.down_payment_percent ? `${d.down_payment_percent}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="ai-divider-glow" />

      {/* ═══ SECTION 3: FINANCE ═══ */}
      <section>
        <SectionHeading icon={<CreditCard className="w-5 h-5" />} title="Finance" />
        <div className="space-y-3 mb-5">
          <AgentActionCard
            icon={<Zap className="w-4 h-4 text-primary" />}
            title="Best Payment Match"
            description={`Found launches with payment plans that fit your ${budgetLabel} budget.`}
            linkText="Want me to compare them?"
            onLink={() => sendMessage("Show me the best payment plans for my budget")}
            badge="Agent picked"
          />
        </div>
        <p className="text-sm text-muted-foreground mb-4">Compare payment plans across your watchlisted projects matched to your profile and budget.</p>
        <div className="mb-5">
          <h3 className="text-base font-bold text-foreground mb-2">Payment Plan Comparison</h3>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <CreditCard className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Add projects to your watchlist to compare payment plans.</p>
            <button onClick={() => sendMessage("Calculate installment for a 3M EGP unit, 10% down, 7 years")} className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-0.5">
              Try installment calculator <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      <div className="ai-divider-glow" />

      {/* ═══ SECTION 4: PROTECT ═══ */}
      <section>
        <SectionHeading icon={<Shield className="w-5 h-5" />} title="Protect" subtitle="Contract Watchdog & Delivery Milestones" />
        <div className="space-y-3 mb-5">
          <AgentActionCard
            icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            title="Delivery Check Due"
            description="Your reservation anniversary is next month — ask your developer about contract milestones."
            linkText="Want me to set a reminder?"
            onLink={() => sendMessage("Help me track my contract delivery milestones")}
            variant="warning"
            badge="Auto-alert"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">Your Milestones</h3>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Scale className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No milestones tracked yet. Add one to start monitoring your project.</p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">Community Alerts</h3>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
              <div className="rounded-md bg-destructive/5 border border-destructive/15 p-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-destructive">Delay Reported</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">Agent flagged</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">From buyers in your project</p>
                <p className="text-sm font-medium text-foreground mt-2">Phase 2 Delivery</p>
                <p className="text-xs text-muted-foreground">Multiple buyers have reported receiving notice of a 3-month delay for Phase 2 units due to permit issues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ai-divider-glow" />

      {/* ═══ AGENT CHAT ═══ */}
      <section>
        <SectionHeading icon={<MessageCircle className="w-5 h-5" />} title="Ask R8 Agent" subtitle="Query live data — reviews, trust scores, launches, comparisons" />

        <div className="rounded-xl overflow-hidden ai-glass ai-shimmer-border relative" style={{ minHeight: 380 }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 relative z-10">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center ai-breathe">
              <Bot className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">R8 Agent</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ai-pulse-dot" />
            {hasActivity && (
              <span className="ml-1 text-[10px] text-muted-foreground">
                · Knows your {activity.followedDevelopers.length} follows, {activity.savedItems.length} saves
              </span>
            )}
            {isLoading && toolStatus && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-primary ai-glass rounded-full px-2.5 py-1 shadow-[0_0_8px_1px_hsla(var(--glow-primary),0.1)]">
                <Search className="w-3 h-3 animate-pulse" /> {toolStatus}
              </span>
            )}
          </div>

          <div ref={scrollRef} className="overflow-y-auto p-4 space-y-3 relative z-10" style={{ maxHeight: 320 }}>
            {messages.length === 0 && (
              <div className="text-center py-6 ai-slide-up">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-3 ai-float">
                  <Bot className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {hasActivity ? "I know your preferences. Ask me anything!" : "What would you like to know?"}
                </p>
                <p className="text-xs text-muted-foreground/60 mb-4">
                  {hasActivity
                    ? `Based on your ${activity.followedDevelopers.length} follows and ${activity.savedItems.length} saved items`
                    : "I query live data — reviews, trust scores, launches, comparisons"
                  }
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                  {quickPrompts.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)} className="text-xs px-3 py-1.5 rounded-full ai-glass border border-primary/15 text-primary hover:bg-primary/10 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md shadow-[0_2px_12px_-2px_hsla(var(--glow-primary),0.3)]"
                    : "ai-glass text-foreground rounded-bl-md"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {/* Tool execution steps visualization */}
            <ToolExecutionSteps active={isLoading && !!toolStatus} />
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && !toolStatus && (
              <div className="flex justify-start">
                <div className="ai-glass rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="ai-thinking flex gap-1.5">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/30 p-3 relative z-10">
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your agent anything..."
                className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                maxLength={1000}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
