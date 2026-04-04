import { useState, useEffect, useRef } from "react";
import { Sparkles, MapPin, TrendingUp, Shield, AlertTriangle, MessageCircle, Settings2, Loader2, Send, Bot, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrustRadarAlerts } from "@/components/TrustRadarAlerts";
import { CopilotWeeklyDigest } from "@/components/CopilotWeeklyDigest";
import { CopilotMatchedLaunches } from "@/components/CopilotMatchedLaunches";
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
  under_2m: "Under 2M EGP",
  "2m_5m": "2M – 5M EGP",
  "5m_10m": "5M – 10M EGP",
  "10m_20m": "10M – 20M EGP",
  "20m_plus": "20M+ EGP",
};

const PURPOSE_LABELS: Record<string, string> = {
  first_home: "First Home",
  investment: "Investment",
  resale: "Resale",
  vacation: "Vacation Home",
  commercial: "Commercial",
};

const QUICK_PROMPTS = [
  "Top-rated developers in my areas",
  "New launches matching my budget",
  "Compare 2 developers for me",
  "What should I watch out for?",
];

export const CopilotBriefingDashboard = ({ preferences, riskFlags, onEditPreferences }: CopilotBriefingDashboardProps) => {
  const { user, profile } = useAuth();
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile?.full_name?.split(" ")[0] || "";

  useEffect(() => {
    if (!user) return;
    const generateInsights = async () => {
      setLoadingInsights(true);
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        const prompt = `Based on my preferences, give me exactly 3 brief personalized insights (each 1-2 sentences max). My profile: Purpose: ${preferences.purpose}, Budget: ${preferences.budget_range}, Locations: ${preferences.preferred_locations.join(", ")}, Concerns: ${preferences.concerns.join(", ")}. Format as 3 separate insights, each on its own line starting with an emoji. Keep them actionable and data-aware.`;

        const resp = await fetch(AGENT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: [{ role: "user", content: prompt }], preferences }),
        });

        if (!resp.ok || !resp.body) throw new Error("Failed");
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let fullText = "";

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
              if (parsed.tool_status) continue;
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullText += content;
            } catch { break; }
          }
        }

        const lines = fullText.split("\n").filter((l) => l.trim().length > 10);
        setInsights(lines.slice(0, 3));
      } catch (e) {
        console.error("Insights error:", e);
        setInsights([
          "📊 Check the latest launches in your preferred areas",
          "🛡️ Monitor developer trust scores for your followed companies",
          "💡 Ask me anything about the market",
        ]);
      } finally {
        setLoadingInsights(false);
      }
    };
    generateInsights();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
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
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snap } : m));
                return [...prev, { role: "assistant", content: snap }];
              });
            }
          } catch { break; }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble. Please try again." }]);
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  };

  const INSIGHT_ICONS = [MapPin, TrendingUp, Shield];

  return (
    <div className="space-y-6 relative">
      {/* Personalized Header with glow */}
      <div className="flex items-center justify-between ai-slide-up">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center ai-icon-glow ai-shimmer-border">
            <Sparkles className="w-5 h-5 text-primary-foreground relative z-10" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ai-pulse-dot ring-2 ring-background z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {greeting}{name ? `, ${name}` : ""}
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitoring {preferences.preferred_locations.length} location{preferences.preferred_locations.length !== 1 ? "s" : ""} · {PURPOSE_LABELS[preferences.purpose] || preferences.purpose} · {BUDGET_LABELS[preferences.budget_range] || preferences.budget_range}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onEditPreferences} title="Edit preferences" className="hover:bg-primary/5">
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Insight Cards with glass + glow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loadingInsights
          ? [0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl ai-glass p-4 animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted/50 rounded w-full" />
                <div className="h-3 bg-muted/50 rounded w-2/3 mt-1" />
              </div>
            ))
          : insights.map((insight, i) => {
              const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
              return (
                <div
                  key={i}
                  className="relative rounded-xl ai-glass p-4 cursor-pointer group hover:shadow-[0_0_20px_-4px_hsla(var(--glow-primary),0.15)] transition-all duration-300 ai-scale-in"
                  style={{ animationDelay: `${i * 0.12}s` }}
                  onClick={() => sendMessage(`Tell me more: ${insight}`)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/15 transition-colors group-hover:shadow-[0_0_10px_2px_hsla(var(--glow-primary),0.1)]">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              );
            })}
      </div>

      {/* AI divider */}
      <div className="ai-divider-glow" />

      {/* Main 2-column layout: Chat + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Panel with shimmer border */}
        <div className="lg:col-span-2 flex flex-col rounded-xl overflow-hidden ai-glass ai-shimmer-border relative" style={{ minHeight: 420 }}>
          {/* Chat header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 relative z-10">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">R8 Agent</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ai-pulse-dot" />
            {isLoading && toolStatus && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-primary ai-glass rounded-full px-2.5 py-1 shadow-[0_0_8px_1px_hsla(var(--glow-primary),0.1)]">
                <Search className="w-3 h-3 animate-pulse" />
                Searching database...
              </span>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
            {messages.length === 0 && (
              <div className="text-center py-8 ai-slide-up">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-3 ai-float">
                  <Bot className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">What would you like to know?</p>
                <p className="text-xs text-muted-foreground/60 mb-5">I query live data — reviews, trust scores, launches, comparisons</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                  {QUICK_PROMPTS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full ai-glass border border-primary/15 text-primary hover:bg-primary/10 hover:shadow-[0_0_8px_1px_hsla(var(--glow-primary),0.1)] transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md shadow-[0_2px_12px_-2px_hsla(var(--glow-primary),0.3)]"
                      : "ai-glass text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
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
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your agent anything..."
                className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:shadow-[0_0_10px_1px_hsla(var(--glow-primary),0.08)] transition-all"
                maxLength={1000}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 shadow-[0_2px_10px_-2px_hsla(var(--glow-primary),0.25)]">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar with glass */}
        <div className="space-y-4">
          <div className="ai-scale-in" style={{ animationDelay: "0.15s" }}>
            <TrustRadarAlerts
              riskFlags={riskFlags}
              onAskCopilot={(q) => { setInput(q); inputRef.current?.focus(); }}
            />
          </div>
          <div className="ai-scale-in" style={{ animationDelay: "0.25s" }}>
            <CopilotWeeklyDigest />
          </div>
        </div>
      </div>

      {/* AI divider */}
      <div className="ai-divider-glow" />

      {/* Matched Launches */}
      <div className="ai-slide-up" style={{ animationDelay: "0.3s" }}>
        <CopilotMatchedLaunches />
      </div>
    </div>
  );
};
