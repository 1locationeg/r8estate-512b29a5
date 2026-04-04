// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Loader2, X, Search, Shield, AlertTriangle, Users, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/copilot-agent`;

const CATEGORIES = [
  {
    key: "trust",
    label: "Developer Trust",
    icon: Shield,
    questions: [
      "What's the trust score for Mountain View?",
      "Which developers have the most verified reviews?",
      "Compare Palm Hills vs Emaar Misr",
    ],
  },
  {
    key: "risk",
    label: "Risk Assessment",
    icon: AlertTriangle,
    questions: [
      "Are there any red flags for SODIC?",
      "Which developers have declining ratings?",
      "Show me developers with low verified buyer %",
    ],
  },
  {
    key: "buyer",
    label: "Buyer Experience",
    icon: Users,
    questions: [
      "What do buyers say about delivery timelines?",
      "Show me the best-rated developers in New Cairo",
      "What are common complaints in reviews?",
    ],
  },
  {
    key: "market",
    label: "Market Insights",
    icon: TrendingUp,
    questions: [
      "What are the latest launches in 6th October?",
      "Calculate installment for 3M EGP, 10% down, 8 years",
      "Which areas have the most new launches?",
    ],
  },
];

export const AIChatWidget = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
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

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (resp.status === 429) {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Rate limit reached. Please try again later." }]);
        return;
      }
      if (resp.status === 402) {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ AI credits exhausted. Please add funds." }]);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to connect");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.tool_status) {
              if (parsed.tools_used?.length) {
                const toolNames = parsed.tools_used.map((t: string) => 
                  t.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                ).join(", ");
                setToolStatus(`Querying: ${toolNames}`);
                setTimeout(() => setToolStatus(null), 3000);
              }
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  }, [input, isLoading, messages]);

  const selectedCat = CATEGORIES.find((c) => c.key === activeCategory);
  const hasMessages = messages.length > 0;

  return (
    <div className="fixed bottom-24 end-6 z-50 w-[400px] max-w-[calc(100vw-1.5rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-accent/80 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-primary animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary-foreground tracking-wide">AI Trust Insights</p>
            <p className="text-[10px] text-primary-foreground/60">Powered by R8ESTATE Intelligence</p>
          </div>
        </div>
        <button onClick={onClose} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages / Welcome */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasMessages && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">How can I help you?</h3>
            <p className="text-xs text-muted-foreground mb-5 px-4 leading-relaxed">
              Ask me anything about off-plan real estate, developer trust, risks, and market insights.
            </p>

            {/* Category Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full px-2 mb-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(isActive ? null : cat.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-foreground hover:bg-secondary hover:border-border"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Suggested questions for active category */}
            {selectedCat ? (
              <div className="flex flex-col gap-1.5 w-full px-2 animate-in fade-in duration-200">
                {selectedCat.questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveCategory(null); sendMessage(q); }}
                    className="text-start text-xs px-3 py-2 rounded-lg border border-primary/15 bg-primary/[0.04] text-foreground hover:bg-primary/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/60">Select a category above to see suggested questions</p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
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

        {/* Tool status indicator */}
        {isLoading && toolStatus && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5 text-xs text-primary">
              <Search className="w-3 h-3 animate-pulse" />
              <span>{toolStatus}</span>
            </div>
          </div>
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && !toolStatus && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Agent processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 shrink-0 space-y-1">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about developers, risks, or market trends..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={1000}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 rounded-lg">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground/50 text-center">AI insights are for informational purposes. Always conduct your own due diligence.</p>
      </div>
    </div>
  );
};
