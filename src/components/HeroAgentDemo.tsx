import { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles, Search, Star, ShieldCheck, ShieldAlert, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── scenario data ── */
const scenarios = [
  {
    userQuery: "Show me compounds in New Cairo with proven on-time delivery",
    thinkingSteps: [
      "Scanning 452 developer reports...",
      "Analyzing 1,200+ verified reviews...",
      "Computing trust scores...",
    ],
    resultCard: {
      name: "Mivida",
      developer: "Emaar Misr",
      trustScore: 97,
      rating: 4.8,
      badges: [
        { icon: "clock", label: "On-Time 98%" },
        { icon: "check", label: "Finishing: Excellent" },
      ],
      variant: "positive" as const,
    },
    agentReply:
      "I recommend Mivida by Emaar. They have a 98% on-time delivery rate and 4.8/5 finishing quality.",
    chips: ["Compare alternatives", "View reviews"],
  },
  {
    userQuery: "Any red flags for Ora Developers?",
    thinkingSteps: [
      "Running risk assessment...",
      "Checking delivery history...",
      "Scanning buyer complaints...",
    ],
    resultCard: {
      name: "Ora Developers",
      developer: "Ora",
      trustScore: 25,
      rating: 2.1,
      badges: [
        { icon: "alert", label: "Delivery: 18mo late" },
        { icon: "alert", label: "Quality: Below Standard" },
      ],
      variant: "negative" as const,
    },
    agentReply:
      "⚠️ Caution: Ora Developers has multiple verified complaints about delivery delays and finishing quality.",
    chips: ["See all reviews", "Compare alternatives"],
  },
];

/* ── phases ── */
type Phase = "typing" | "thinking" | "result" | "reply" | "chips" | "hold";

const TYPING_SPEED = 35;
const THINK_DURATION = 2000;
const REPLY_SPEED = 25;
const HOLD_DURATION = 4000;

/* ── mini trust ring ── */
const TrustRing = ({ score, variant }: { score: number; variant: "positive" | "negative" }) => {
  const color = variant === "positive" ? "text-trust-excellent" : "text-destructive";
  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg className="w-9 h-9 -rotate-90">
        <circle cx="50%" cy="50%" r="38%" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-muted/40" />
        <circle cx="50%" cy="50%" r="38%" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray={`${score} 100`} strokeLinecap="round" className={color} />
      </svg>
      <span className={cn("absolute inset-0 flex items-center justify-center text-[9px] font-bold", color)}>{score}</span>
    </div>
  );
};

/* ── badge icon resolver ── */
const BadgeIcon = ({ icon }: { icon: string }) => {
  const cls = "w-3 h-3";
  if (icon === "clock") return <Clock className={cls} />;
  if (icon === "check") return <CheckCircle className={cls} />;
  return <AlertTriangle className={cls} />;
};

interface HeroAgentDemoProps {
  onRevealShowcase?: () => void;
}

export const HeroAgentDemo = ({ onRevealShowcase }: HeroAgentDemoProps) => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const revealedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedChars, setTypedChars] = useState(0);
  const [thinkStep, setThinkStep] = useState(0);
  const [replyChars, setReplyChars] = useState(0);
  const [chipsVisible, setChipsVisible] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(paused);
  pauseRef.current = paused;

  const sc = scenarios[scenarioIdx];

  /* ── advance to next scenario ── */
  const nextScenario = useCallback(() => {
    setScenarioIdx((i) => (i + 1) % scenarios.length);
    setPhase("typing");
    setTypedChars(0);
    setThinkStep(0);
    setReplyChars(0);
    setChipsVisible(0);
  }, []);

  /* ── typing phase ── */
  useEffect(() => {
    if (phase !== "typing" || paused) return;
    if (typedChars >= sc.userQuery.length) {
      const t = setTimeout(() => setPhase("thinking"), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypedChars((c) => c + 1), TYPING_SPEED);
    return () => clearTimeout(t);
  }, [phase, typedChars, sc.userQuery.length, paused]);

  /* ── thinking phase ── */
  useEffect(() => {
    if (phase !== "thinking" || paused) return;
    const stepDuration = THINK_DURATION / sc.thinkingSteps.length;
    if (thinkStep >= sc.thinkingSteps.length) {
      const t = setTimeout(() => setPhase("result"), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setThinkStep((s) => s + 1), stepDuration);
    return () => clearTimeout(t);
  }, [phase, thinkStep, sc.thinkingSteps.length, paused]);

  /* ── result → reply + reveal showcase ── */
  useEffect(() => {
    if (phase !== "result" || paused) return;
    if (!revealedRef.current && onRevealShowcase) {
      revealedRef.current = true;
      onRevealShowcase();
    }
    const t = setTimeout(() => setPhase("reply"), 800);
    return () => clearTimeout(t);
  }, [phase, paused, onRevealShowcase]);

  /* ── reply typing ── */
  useEffect(() => {
    if (phase !== "reply" || paused) return;
    if (replyChars >= sc.agentReply.length) {
      const t = setTimeout(() => setPhase("chips"), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setReplyChars((c) => c + 1), REPLY_SPEED);
    return () => clearTimeout(t);
  }, [phase, replyChars, sc.agentReply.length, paused]);

  /* ── chips phase ── */
  useEffect(() => {
    if (phase !== "chips" || paused) return;
    if (chipsVisible >= sc.chips.length) {
      const t = setTimeout(() => setPhase("hold"), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setChipsVisible((c) => c + 1), 150);
    return () => clearTimeout(t);
  }, [phase, chipsVisible, sc.chips.length, paused]);

  /* ── hold → next ── */
  useEffect(() => {
    if (phase !== "hold" || paused) return;
    const t = setTimeout(nextScenario, HOLD_DURATION);
    return () => clearTimeout(t);
  }, [phase, paused, nextScenario]);

  /* ── pause on hover ── */
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleEnter = () => {
    clearTimeout(resumeTimer.current);
    setPaused(true);
  };
  const handleLeave = () => {
    resumeTimer.current = setTimeout(() => setPaused(false), 3000);
  };

  const showResult = phase === "result" || phase === "reply" || phase === "chips" || phase === "hold";
  const showReply = phase === "reply" || phase === "chips" || phase === "hold";
  const showChips = phase === "chips" || phase === "hold";

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="w-full rounded-xl border border-primary/15 bg-card/80 backdrop-blur-md shadow-lg overflow-hidden flex flex-col"
      style={{ maxHeight: 340 }}
    >
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/60">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">R8 Agent</span>
        <span className="w-1.5 h-1.5 rounded-full bg-trust-excellent animate-pulse" />
        <span className="text-[10px] text-muted-foreground">Online</span>
      </div>

      {/* chat body */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-xs">
        {/* user bubble */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary text-primary-foreground px-3 py-1.5 text-xs leading-relaxed">
            {sc.userQuery.slice(0, typedChars)}
            {phase === "typing" && <span className="animate-pulse">|</span>}
          </div>
        </div>

        {/* thinking */}
        {(phase === "thinking" || showResult) && (
          <div className="flex items-start gap-2 animate-fade-in">
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Search className="w-3 h-3 text-muted-foreground animate-pulse" />
            </div>
            <div className="flex flex-col gap-0.5">
              {sc.thinkingSteps.slice(0, phase === "thinking" ? thinkStep + 1 : sc.thinkingSteps.length).map((step, i) => (
                <span key={i} className="text-[10px] text-muted-foreground italic animate-fade-in">{step}</span>
              ))}
            </div>
          </div>
        )}

        {/* result card */}
        {showResult && (
          <div className={cn(
            "rounded-lg border p-2 animate-fade-in transition-all",
            sc.resultCard.variant === "positive"
              ? "border-trust-excellent/30 bg-trust-excellent/5"
              : "border-destructive/30 bg-destructive/5"
          )}>
            <div className="flex items-center gap-2">
              <TrustRing score={sc.resultCard.trustScore} variant={sc.resultCard.variant} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{sc.resultCard.name}</p>
                <p className="text-[10px] text-muted-foreground">{sc.resultCard.developer}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-semibold text-foreground">{sc.resultCard.rating}</span>
                </div>
              </div>
              {sc.resultCard.variant === "positive" ? (
                <ShieldCheck className="w-5 h-5 text-trust-excellent flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0" />
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {sc.resultCard.badges.map((b, i) => (
                <span key={i} className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                  sc.resultCard.variant === "positive"
                    ? "bg-trust-excellent/10 text-trust-excellent"
                    : "bg-destructive/10 text-destructive"
                )}>
                  <BadgeIcon icon={b.icon} />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* agent reply */}
        {showReply && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[90%] rounded-lg rounded-tl-sm bg-secondary text-secondary-foreground px-3 py-1.5 text-xs leading-relaxed">
              {sc.agentReply.slice(0, replyChars)}
              {phase === "reply" && <span className="animate-pulse">|</span>}
            </div>
          </div>
        )}

        {/* action chips */}
        {showChips && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {sc.chips.slice(0, chipsVisible).map((chip, i) => (
              <button
                key={i}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-primary/20 bg-background text-primary hover:bg-primary/10 transition-colors animate-fade-in cursor-default"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
