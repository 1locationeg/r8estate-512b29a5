import { useState, useEffect, useRef } from "react";
import {
  Sparkles, MapPin, TrendingUp, Shield, MessageCircle, Settings2,
  Loader2, Send, Bot, Search, AlertTriangle, Info, Zap, Clock,
  Rocket, Tag, CreditCard, TrendingDown, FileCheck, Users,
  ArrowRight, Eye, Scale, ChevronRight
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

const QUICK_PROMPTS = [
  "Top-rated developers in my areas",
  "New launches matching my budget",
  "Compare 2 developers for me",
  "What should I watch out for?",
];

/* ── Alert Card (yellow/blue tinted) ── */
interface AlertCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  onLink: () => void;
  variant?: "warning" | "info";
}
const AlertCard = ({ icon, title, description, linkText, onLink, variant = "info" }: AlertCardProps) => (
  <div className={`rounded-lg border-l-4 px-4 py-3 ${
    variant === "warning"
      ? "border-l-amber-400 bg-amber-50 dark:bg-amber-950/20"
      : "border-l-primary/60 bg-primary/5 dark:bg-primary/10"
  }`}>
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile?.full_name?.split(" ")[0] || "";

  // Fetch live data
  useEffect(() => {
    if (!user) return;
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const load = async () => {
      const [revRes, launchRes, dealRes] = await Promise.all([
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved").gte("created_at", weekAgo),
        supabase.from("launches").select("id, project_name, location_district, current_price_per_m2, status, down_payment_pct, installment_years")
          .in("status", ["reservations_open", "upcoming"]).order("created_at", { ascending: false }).limit(5),
        supabase.from("deals").select("id, headline, business_id, price, down_payment_percent, deal_type")
          .eq("status", "verified").order("created_at", { ascending: false }).limit(5),
      ]);
      setRecentReviewCount(revRes.count || 0);
      setActiveLaunches(launchRes.data || []);
      setActiveDeals(dealRes.data || []);
      setTrustDropCount(riskFlags.filter(f => f.delta < 0).length);
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

  return (
    <div className="space-y-8 relative">
      {/* ── Header ── */}
      <div className="flex items-center justify-between ai-slide-up">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center ai-icon-glow ai-shimmer-border">
            <Sparkles className="w-5 h-5 text-primary-foreground relative z-10" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ai-pulse-dot ring-2 ring-background z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{greeting}{name ? `, ${name}` : ""}</h1>
            <p className="text-xs text-muted-foreground">
              Monitoring {preferences.preferred_locations.length} location{preferences.preferred_locations.length !== 1 ? "s" : ""} · {PURPOSE_LABELS[preferences.purpose] || preferences.purpose} · {budgetLabel}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onEditPreferences} title="Edit preferences" className="hover:bg-primary/5">
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Profile Match Bar ── */}
      <div className="flex items-center gap-3 flex-wrap rounded-lg border border-border bg-card px-4 py-2.5 ai-scale-in">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Profile match:</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Budget up to {budgetLabel}</span>
        {preferences.preferred_locations.slice(0, 3).map(loc => (
          <span key={loc} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">{loc}</span>
        ))}
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{PURPOSE_LABELS[preferences.purpose] || preferences.purpose}</span>
      </div>

      {/* ════════════════════════════════════════════
          SECTION 1: RESEARCH
         ════════════════════════════════════════════ */}
      <section>
        <SectionHeading icon={<Search className="w-5 h-5" />} title="Research" />

        <div className="space-y-3 mb-5">
          {trustDropCount > 0 && (
            <AlertCard
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
              title="Trust Score Alert"
              description={`${trustDropCount} developer${trustDropCount > 1 ? "s" : ""} on your shortlist had their trust score drop this week. Review their profile.`}
              linkText="View Developers"
              onLink={() => navigate("/developers")}
              variant="warning"
            />
          )}
          {recentReviewCount > 0 && (
            <AlertCard
              icon={<Info className="w-4 h-4 text-primary" />}
              title="New Verified Reviews"
              description={`${recentReviewCount} new verified reviews added for developers on your shortlist.`}
              linkText="View Reviews"
              onLink={() => navigate("/reviews")}
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
                  <div>
                    <p className="font-medium text-foreground">{f.business} — {Math.abs(f.delta)}% {f.delta < 0 ? "drop" : "rise"}</p>
                    <p className="text-xs text-muted-foreground">{f.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Developer DNA Cards placeholder */}
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

      {/* ════════════════════════════════════════════
          SECTION 2: CHOOSE
         ════════════════════════════════════════════ */}
      <section>
        <SectionHeading icon={<Rocket className="w-5 h-5" />} title="Choose" />

        <div className="space-y-3 mb-5">
          {activeLaunches.length > 0 && (
            <AlertCard
              icon={<Zap className="w-4 h-4 text-primary" />}
              title="Phase 2 Launching Soon"
              description={`${activeLaunches[0]?.project_name || "A project"} moves to Phase 2 soon — price likely +8% over current Phase 1.`}
              linkText="View Launch"
              onLink={() => navigate("/launch-watch")}
            />
          )}
          <AlertCard
            icon={<Info className="w-4 h-4 text-primary" />}
            title="New Payment Plan"
            description={`A new payment plan just matched your budget window: 5% down, 10 years.`}
            linkText="Compare Deals"
            onLink={() => navigate("/deal-watch")}
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
              {activeLaunches.slice(0, 3).map(l => (
                <div key={l.id} className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/launch-watch")}>
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
                  {activeDeals.slice(0, 4).map(d => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => navigate("/deal-watch")}>
                      <td className="px-3 py-2 font-medium text-foreground truncate max-w-[180px]">{d.headline}</td>
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

      {/* ════════════════════════════════════════════
          SECTION 3: FINANCE
         ════════════════════════════════════════════ */}
      <section>
        <SectionHeading icon={<CreditCard className="w-5 h-5" />} title="Finance" />

        <div className="space-y-3 mb-5">
          <AlertCard
            icon={<Zap className="w-4 h-4 text-primary" />}
            title="Best Payment Match"
            description={`We found launches with payment plans that fit within your ${budgetLabel} budget.`}
            linkText="View Finance Options"
            onLink={() => sendMessage("Show me the best payment plans for my budget")}
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4">Compare payment plans across your watchlisted projects matched to your profile and budget.</p>

        {/* Payment Plan Comparison placeholder */}
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

      {/* ════════════════════════════════════════════
          SECTION 4: PROTECT
         ════════════════════════════════════════════ */}
      <section>
        <SectionHeading icon={<Shield className="w-5 h-5" />} title="Protect" subtitle="Contract Watchdog & Delivery Milestones" />

        <div className="space-y-3 mb-5">
          <AlertCard
            icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            title="Delivery Check Due"
            description="Your reservation anniversary is next month — ask your developer about contract milestones."
            linkText="Add Milestone"
            onLink={() => sendMessage("Help me track my contract delivery milestones")}
            variant="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milestones */}
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

          {/* Community Alerts */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">Community Alerts</h3>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
              <div className="rounded-md bg-destructive/5 border border-destructive/15 p-3">
                <p className="text-sm font-semibold text-destructive">Delay Reported</p>
                <p className="text-xs text-muted-foreground mt-0.5">From buyers in your project</p>
                <p className="text-sm font-medium text-foreground mt-2">Phase 2 Delivery</p>
                <p className="text-xs text-muted-foreground">Multiple buyers have reported receiving notice of a 3-month delay for Phase 2 units due to permit issues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ai-divider-glow" />

      {/* ════════════════════════════════════════════
          AGENT CHAT (collapsible at bottom)
         ════════════════════════════════════════════ */}
      <section>
        <SectionHeading icon={<MessageCircle className="w-5 h-5" />} title="Ask R8 Agent" subtitle="Query live data — reviews, trust scores, launches, comparisons" />

        <div className="rounded-xl overflow-hidden ai-glass ai-shimmer-border relative" style={{ minHeight: 380 }}>
          {/* Chat header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 relative z-10">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">R8 Agent</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ai-pulse-dot" />
            {isLoading && toolStatus && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-primary ai-glass rounded-full px-2.5 py-1 shadow-[0_0_8px_1px_hsla(var(--glow-primary),0.1)]">
                <Search className="w-3 h-3 animate-pulse" /> Searching database...
              </span>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="overflow-y-auto p-4 space-y-3 relative z-10" style={{ maxHeight: 320 }}>
            {messages.length === 0 && (
              <div className="text-center py-6 ai-slide-up">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-3 ai-float">
                  <Bot className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">What would you like to know?</p>
                <p className="text-xs text-muted-foreground/60 mb-4">I query live data — reviews, trust scores, launches, comparisons</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                  {QUICK_PROMPTS.map((q, i) => (
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
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && !toolStatus && (
              <div className="flex justify-start">
                <div className="ai-glass rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
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
