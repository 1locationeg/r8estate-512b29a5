import { useState, useEffect, useRef } from "react";
import { Sparkles, MapPin, TrendingUp, Shield, AlertTriangle, MessageCircle, Settings2, Loader2, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrustRadarAlerts } from "@/components/TrustRadarAlerts";
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

export const CopilotBriefingDashboard = ({ preferences, riskFlags, onEditPreferences }: CopilotBriefingDashboardProps) => {
  const { user, profile } = useAuth();
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile?.full_name?.split(" ")[0] || "";

  // Generate personalized insights on mount
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
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            preferences,
          }),
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
        setInsights(["📊 Check the latest launches in your preferred areas", "🛡️ Monitor developer trust scores for your followed companies", "💡 Ask me anything about the market"]);
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
            if (parsed.tool_status) continue;
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
    }
  };

  const INSIGHT_ICONS = [MapPin, TrendingUp, Shield];

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-background" />
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
        <Button variant="ghost" size="icon" onClick={onEditPreferences} title="Edit preferences">
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loadingInsights ? (
          [0, 1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3 mt-1" />
              </CardContent>
            </Card>
          ))
        ) : (
          insights.map((insight, i) => {
            const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
            return (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setChatOpen(true); sendMessage(`Tell me more: ${insight}`); }}>
                <CardContent className="p-4">
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Risk Alerts */}
      {riskFlags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Risk Alerts
          </h3>
          <TrustRadarAlerts
            riskFlags={riskFlags}
            onAskCopilot={(q) => { setChatOpen(true); setInput(q); inputRef.current?.focus(); }}
          />
        </div>
      )}

      {/* Expandable Chat */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-primary" />
          Ask R8 Agent
          <span className="ml-auto text-xs text-muted-foreground">{chatOpen ? "▲" : "▼"}</span>
        </button>

        {chatOpen && (
          <div className="border-t border-border">
            <div ref={scrollRef} className="max-h-80 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Bot className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Ask me anything about the market, developers, or launches</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"}`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-border p-3">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your agent..."
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={1000}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
