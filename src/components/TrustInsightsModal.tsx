import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Send,
  Shield,
  AlertTriangle,
  Users,
  TrendingUp,
  Loader2,
  Bot,
  User,
  X,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuestionCategory {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  questions: string[];
}

interface TrustInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trust-insights`;

export const TrustInsightsModal = ({ open, onOpenChange }: TrustInsightsModalProps) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories: QuestionCategory[] = [
    {
      id: "developer",
      icon: <Shield className="w-4 h-4" />,
      label: t("trustInsights.developerTrust"),
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
      questions: [
        t("trustInsights.questions.developerTrackRecord"),
        t("trustInsights.questions.developerDeliveryHistory"),
        t("trustInsights.questions.developerFinancialStability"),
      ],
    },
    {
      id: "risk",
      icon: <AlertTriangle className="w-4 h-4" />,
      label: t("trustInsights.riskAssessment"),
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
      questions: [
        t("trustInsights.questions.offPlanRisks"),
        t("trustInsights.questions.paymentPlanSafety"),
        t("trustInsights.questions.reraProtection"),
      ],
    },
    {
      id: "experience",
      icon: <Users className="w-4 h-4" />,
      label: t("trustInsights.buyerExperience"),
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
      questions: [
        t("trustInsights.questions.customerService"),
        t("trustInsights.questions.transparencyPractices"),
        t("trustInsights.questions.communicationQuality"),
      ],
    },
    {
      id: "market",
      icon: <TrendingUp className="w-4 h-4" />,
      label: t("trustInsights.marketInsights"),
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
      questions: [
        t("trustInsights.questions.marketTiming"),
        t("trustInsights.questions.locationValue"),
        t("trustInsights.questions.investmentPotential"),
      ],
    },
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    const updateAssistant = (content: string) => {
      assistantContent = content;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
        }
        return [...prev, { role: "assistant", content }];
      });
    };

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
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            updateAssistant(assistantContent + content);
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setActiveCategory(null);

    try {
      await streamChat(newMessages);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setActiveCategory(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {t("trustInsights.title")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("trustInsights.subtitle")}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("trustInsights.newChat")}
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {messages.length === 0 ? (
            /* Welcome State */
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("trustInsights.welcomeTitle")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t("trustInsights.welcomeDescription")}
                </p>
              </div>

              {/* Category Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    className={cn(
                      "flex items-center justify-start gap-2 h-auto py-3 px-4 border transition-all",
                      cat.color,
                      activeCategory === cat.id && "ring-2 ring-primary/20"
                    )}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    {cat.icon}
                    <span className="text-sm font-medium">{cat.label}</span>
                  </Button>
                ))}
              </div>

              {/* Suggested Questions */}
              {activeCategory && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    {t("trustInsights.suggestedQuestions")}
                  </p>
                  {categories
                    .find((c) => c.id === activeCategory)
                    ?.questions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuestionClick(question)}
                        className="w-full text-start p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm text-foreground"
                      >
                        {question}
                      </button>
                    ))}
                </div>
              )}

              {!activeCategory && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  {t("trustInsights.selectCategory")}
                </p>
              )}
            </div>
          ) : (
            /* Messages */
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <User className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {t("trustInsights.thinking")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-border bg-card"
        >
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("trustInsights.inputPlaceholder")}
              disabled={isLoading}
              className="flex-1 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t("trustInsights.disclaimer")}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
