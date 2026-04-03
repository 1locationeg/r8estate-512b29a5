import { useState, useRef, useEffect } from "react";
import { Sparkles, Bot, Send, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrustRadarAlerts } from "@/components/TrustRadarAlerts";
import { CopilotWeeklyDigest } from "@/components/CopilotWeeklyDigest";
import { CopilotMatchedLaunches } from "@/components/CopilotMatchedLaunches";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getStationForRoute } from "@/lib/journeyStations";
import { COPILOT_QUESTIONS, COPILOT_DEFAULT_QUESTIONS } from "@/lib/copilotQuestions";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const CopilotPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const station = getStationForRoute(location.pathname);
  const questions = station ? (COPILOT_QUESTIONS[station.key] || COPILOT_DEFAULT_QUESTIONS) : COPILOT_DEFAULT_QUESTIONS;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile?.full_name?.split(" ")[0] || "";

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

    let assistantSoFar = "";

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              const snap = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant")
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snap } : m);
                return [...prev, { role: "assistant", content: snap }];
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onSignOut={() => {}} getDashboardRoute={() => user ? "/buyer" : "/auth"} />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">R8 Copilot</h1>
            <p className="text-xs text-muted-foreground">
              {greeting}{name ? `, ${name}` : ""}. Your AI-powered real estate assistant.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-2 flex flex-col rounded-xl border border-border bg-card overflow-hidden" style={{ minHeight: 500 }}>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <Bot className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-1">What would you like to know?</p>
                  <p className="text-xs text-muted-foreground/60 mb-6">Ask about developers, trust scores, market trends, or your property journey</p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    {questions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/[0.04] text-primary hover:bg-primary/10 transition-colors"
                      >
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
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}>
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

            {/* Input */}
            <div className="border-t border-border p-3">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your copilot anything..."
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={1000}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TrustRadarAlerts />
            <CopilotWeeklyDigest />
          </div>
        </div>

        {/* Matched Launches */}
        <div className="mt-6">
          <CopilotMatchedLaunches />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CopilotPage;
