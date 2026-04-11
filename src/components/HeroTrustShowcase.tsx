import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Star, BadgeCheck, RotateCcw, Building2, MapPin, Clock, Hammer, FileText, MessageCircle, Hand, Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import egyptianAvatar1 from "@/assets/avatars/egyptian-1.jpg";
import egyptianAvatar2 from "@/assets/avatars/egyptian-2.jpg";
import egyptianAvatar3 from "@/assets/avatars/egyptian-3.jpg";
import egyptianAvatar4 from "@/assets/avatars/egyptian-4.jpg";
import egyptianAvatar5 from "@/assets/avatars/egyptian-5.jpg";

const REVIEWER_AVATARS = [egyptianAvatar1, egyptianAvatar2, egyptianAvatar3, egyptianAvatar4, egyptianAvatar5];

// ── Score color logic ──
const getScoreColor = (s: number) => {
  if (s >= 80) return "hsl(142, 71%, 45%)";
  if (s >= 66) return "hsl(80, 60%, 45%)";
  if (s >= 50) return "hsl(48, 96%, 53%)";
  if (s >= 30) return "hsl(20, 80%, 50%)";
  return "hsl(0, 72%, 51%)";
};

// Trust labels are now translated via t()
interface ReviewScenarioDef {
  score: number;
  reviewer: string;
  initial: string;
  avatar: string;
  project: string;
  location: string;
  developer: string;
  rating: number;
  commentKey: string;
  dimensions: { labelKey: string; valueKey: string; positive: boolean }[];
  trustLabelKey: string;
}

const scenarioDefs: ReviewScenarioDef[] = [
  {
    score: 25,
    reviewer: "Aly R.",
    initial: "A",
    avatar: "https://i.pravatar.cc/80?img=12",
    project: "Lake Vo",
    location: "New Cairo",
    developer: "Orla Developers",
...
  { question: "Is Orla Developers safe?", verdict: "Not Recommended", rating: 2.1, reviewerCount: 253, type: "warning", proof: "253 reviews flagged concerns" },
  { question: "Best compounds in New Cairo?", verdict: "Top Pick — Mivida", rating: 4.8, reviewerCount: 312, type: "positive", proof: "Recommended by 312 verified buyers" },
  { question: "Mountain View vs Emaar?", verdict: "Wait for Launch", rating: 4.2, reviewerCount: 187, type: "insight", proof: "187 buyers suggest waiting" },
];

const agentProcessingSteps = [
  "Scanning reviews...",
  "Analyzing records...",
  "Computing score...",
];

const agentStationLabels = ["Scan", "Analyze", "Score"];
const agentStationColors = ["bg-blue-500", "bg-amber-500", "bg-trust-excellent"];

// ── Component ──
export const HeroTrustShowcase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [phase, setPhase] = useState<"entrance" | "interactive">("entrance");
  const [cardVisible, setCardVisible] = useState(false);
  const [rowsVisible, setRowsVisible] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cardPhase, setCardPhase] = useState<"reviews" | "agent">("reviews");
  const [teaserIdx, setTeaserIdx] = useState(0);
  const [teaserTypedChars, setTeaserTypedChars] = useState(0);
  
  const [teaserPhase, setTeaserPhase] = useState<"typing" | "processing" | "result">("typing");
  const [teaserStep, setTeaserStep] = useState(0);
  const [teaserProgress, setTeaserProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runEntranceRef = useRef<(() => void) | null>(null);
  const seqIdxRef = useRef(0);
  const entranceTarget = 88;

  // Sequence: agent-result → review → review → agent-full → review → loop
  const SHOWCASE_SEQUENCE = [
    { type: "agent-result" as const, agentIdx: 0 },
    { type: "review" as const, reviewIdx: 0 },
    { type: "review" as const, reviewIdx: 1 },
    { type: "agent-full" as const, agentIdx: 1 },
    { type: "review" as const, reviewIdx: 2 },
  ];

  // ── Auto-cycle logic ──
  const advanceSequence = useCallback(() => {
    const nextIdx = (seqIdxRef.current + 1) % SHOWCASE_SEQUENCE.length;
    seqIdxRef.current = nextIdx;
    const step = SHOWCASE_SEQUENCE[nextIdx];

    if (step.type === "review") {
      const nextScore = scenarioDefs[step.reviewIdx].score;
      setCardPhase("reviews");
      setTransitioning(true);
      setTimeout(() => {
        setScore(nextScore);
        setDisplayScore(nextScore);
        setTimeout(() => setTransitioning(false), 50);
      }, 200);
      // Hold review for 4s then advance
      if (cycleIntervalRef.current) clearTimeout(cycleIntervalRef.current);
      cycleIntervalRef.current = setTimeout(() => advanceSequence(), 4000) as any;
    } else if (step.type === "agent-result") {
      // Show result badge directly (no typing/processing)
      setTeaserIdx(step.agentIdx);
      setCardPhase("agent");
      setTeaserPhase("result");
      setTeaserTypedChars(agentTeaserPairs[step.agentIdx].question.length);
      setTeaserStep(3);
      setTeaserProgress(100);
      // Hold for 4s then advance
      if (cycleIntervalRef.current) clearTimeout(cycleIntervalRef.current);
      cycleIntervalRef.current = setTimeout(() => advanceSequence(), 4000) as any;
    } else if (step.type === "agent-full") {
      // Full animation — typing → processing → result; handled by effects
      setTeaserIdx(step.agentIdx);
      setCardPhase("agent");
      // Effects will drive typing → processing → result, then we advance from result effect
    }
  }, []);

  const startCycling = useCallback(() => {
    // Kick off the sequence from current position
    advanceSequence();
  }, [advanceSequence]);

  const pauseCycling = useCallback(() => {
    if (cycleIntervalRef.current) {
      clearTimeout(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      advanceSequence();
    }, 6000);
  }, [advanceSequence]);

  // ── Entrance animation ──
  const runEntrance = useCallback(() => {
    setPhase("entrance");
    setCardVisible(false);
    setRowsVisible(0);
    setScore(0);
    setDisplayScore(0);

    const start = performance.now();
    const duration = 1200;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Elastic overshoot easing
      const eased = t < 1
        ? 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 1.2)
        : 1;
      const current = Math.round(entranceTarget * Math.min(eased, 1.08));
      const clamped = Math.min(Math.max(current, 0), 100);
      setDisplayScore(clamped);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayScore(entranceTarget);
        setScore(entranceTarget);
        // Show first row before the card fades in so there's no blank white frame
        setTimeout(() => {
          setRowsVisible(1);
          requestAnimationFrame(() => setCardVisible(true));
          // Stagger remaining rows
          for (let i = 2; i <= 5; i++) {
            setTimeout(() => setRowsVisible(i), (i - 1) * 80);
          }
          setTimeout(() => {
            setPhase("interactive");
            startCycling();
          }, 600);
        }, 400);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  runEntranceRef.current = runEntrance;

  useEffect(() => {
    runEntrance();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (cycleIntervalRef.current) clearTimeout(cycleIntervalRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [runEntrance]);

  // ── Agent teaser typing effect (only for agent-full) ──
  useEffect(() => {
    if (cardPhase !== "agent") return;
    const currentStep = SHOWCASE_SEQUENCE[seqIdxRef.current];
    if (!currentStep || currentStep.type !== "agent-full") return;
    setTeaserTypedChars(0);
    setTeaserPhase("typing");
    setTeaserStep(0);
    setTeaserProgress(0);
    const q = agentTeaserPairs[teaserIdx].question;
    let charIdx = 0;
    const typeInterval = setInterval(() => {
      charIdx++;
      setTeaserTypedChars(charIdx);
      if (charIdx >= q.length) {
        clearInterval(typeInterval);
        setTimeout(() => setTeaserPhase("processing"), 300);
      }
    }, 40);
    return () => clearInterval(typeInterval);
  }, [cardPhase, teaserIdx]);

  // ── Agent teaser processing steps ──
  useEffect(() => {
    if (cardPhase !== "agent" || teaserPhase !== "processing") return;
    setTeaserStep(0);
    setTeaserProgress(0);
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      setTeaserStep(step);
      setTeaserProgress(Math.round(step * 33.33));
      if (step >= agentProcessingSteps.length) {
        clearInterval(stepInterval);
        setTimeout(() => {
          setTeaserPhase("result");
          setTeaserProgress(100);
        }, 600);
      }
    }, 1200);
    return () => clearInterval(stepInterval);
  }, [cardPhase, teaserPhase]);

  // ── Agent result hold → advance sequence ──
  useEffect(() => {
    if (cardPhase !== "agent" || teaserPhase !== "result") return;
    const timer = setTimeout(() => {
      advanceSequence();
    }, 4000);
    return () => clearTimeout(timer);
  }, [cardPhase, teaserPhase, teaserIdx, advanceSequence]);


  const animateToScore = useCallback((target: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const startVal = displayScore;
    const startTime = performance.now();
    const duration = 800;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      setDisplayScore(current);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayScore(target);
      }
    };
    animRef.current = requestAnimationFrame(step);
    setScore(target);
  }, [displayScore]);

  const handleSliderChange = (values: number[]) => {
    const val = values[0];
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setScore(val);
    setDisplayScore(val);
    setHasInteracted(true);
    pauseCycling();
  };

  const handlePreset = (val: number) => {
    animateToScore(val);
    pauseCycling();
  };

  const handleReplay = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (cycleIntervalRef.current) clearTimeout(cycleIntervalRef.current);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    seqIdxRef.current = 0;
    runEntrance();
  };

  const scenario = getClosestScenario(score);
  const color = getScoreColor(displayScore);
  const pct = displayScore / 100;
  const arcLen = Math.PI * 90;
  const filled = pct * arcLen;
  const angle = Math.PI + pct * Math.PI;
  const mx = 100 + 90 * Math.cos(angle);
  const my = 100 + 90 * Math.sin(angle);
  const rotDeg = pct * 180 - 90;

  return (
    <div className="w-full max-w-md mx-auto ai-glow-accent">
      {/* ── Gauge ── */}
      <div className="relative w-56 h-32 md:w-64 md:h-36 mx-auto">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="showcaseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
              <stop offset="16%" stopColor="hsl(20, 80%, 50%)" />
              <stop offset="33%" stopColor="hsl(40, 90%, 50%)" />
              <stop offset="50%" stopColor="hsl(48, 96%, 53%)" />
              <stop offset="75%" stopColor="hsl(80, 60%, 45%)" />
              <stop offset="100%" stopColor="hsl(142, 71%, 45%)" />
            </linearGradient>
            <filter id="showcaseGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="showcaseMarkerShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Tick marks */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
            const tickAngle = Math.PI + (tick / 100) * Math.PI;
            const innerR = tick % 50 === 0 ? 72 : tick % 20 === 0 ? 74 : 76;
            const outerR = 80;
            const x1 = 100 + innerR * Math.cos(tickAngle);
            const y1 = 100 + innerR * Math.sin(tickAngle);
            const x2 = 100 + outerR * Math.cos(tickAngle);
            const y2 = 100 + outerR * Math.sin(tickAngle);
            return (
              <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(var(--muted-foreground))" strokeWidth={tick % 50 === 0 ? "2" : "1"} opacity="0.25" />
            );
          })}

          {/* Background arc */}
          <path d="M 10 100 A 90 90 0 0 1 190 100" stroke="hsl(var(--border))" strokeWidth="14" fill="none" strokeLinecap="round" />

          {/* Filled arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            stroke="url(#showcaseGradient)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${arcLen}`}
            filter="url(#showcaseGlow)"
          />

          {/* Needle marker */}
          <circle cx={mx} cy={my} r="9" fill="hsl(var(--background))" stroke={color} strokeWidth="3" filter="url(#showcaseMarkerShadow)" />
          <polygon points="-4,5 4,5 0,-7" fill={color} transform={`translate(${mx},${my}) rotate(${rotDeg})`} />

          {/* Pulse ring at needle base */}
          <circle cx={mx} cy={my} r="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3">
            <animate attributeName="r" values="9;16;9" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Verified check for high scores */}
          {displayScore >= 66 && (
            <g transform={`translate(${mx},${my})`}>
              <circle cx="0" cy="-16" r="6" fill={color} />
              <polyline
                points="-2.5,-16 -0.5,-14 3,-18"
                fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </g>
          )}

          {/* Labels */}
          <text x="12" y="113" fontSize="8" fill="hsl(var(--muted-foreground))" fontWeight="600" opacity="0.5">0</text>
          <text x="182" y="113" fontSize="8" fill="hsl(var(--muted-foreground))" fontWeight="600" opacity="0.5">100</text>
          <text x="100" y="111" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" fontWeight="900" letterSpacing="0.25em" opacity="0.6">
            {t("spotlight.trustScore").toUpperCase()}
          </text>
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-11">
          <span className="text-2xl md:text-3xl font-black tabular-nums leading-none transition-colors duration-300" style={{ color }}>
            {displayScore}
          </span>
          <span className="text-[9px] md:text-[10px] font-bold mt-0.5 tracking-wide transition-colors duration-300" style={{ color }}>
            {t(scenario.trustLabelKey)}
          </span>
        </div>
      </div>

      {/* ── Review Card / Agent Teaser ── */}
      <div className="relative -mt-1 mx-2 md:mx-0 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Reviews content */}
        <div
          className={`transition-opacity duration-500 ${
            cardPhase === "reviews" ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
          } ${transitioning ? "opacity-40" : ""}`}
          style={{ transitionDuration: transitioning ? "200ms" : "600ms" }}
        >
          <div className="p-3 space-y-1.5">
            {/* Row 1: Project location */}
            <div className={`flex justify-center transition-all duration-300 ${rowsVisible >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
              <span className="text-xs md:text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {scenario.project} · {scenario.location}
              </span>
            </div>

            {/* Row 2: Reviewer info */}
            <div className={`flex items-center gap-2 transition-all duration-300 ${rowsVisible >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
              <img src={scenario.avatar} alt={scenario.reviewer} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{scenario.reviewer}</span>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.09 4.26L17 3.29L17.47 6.29L20.39 7.1L19.42 10L21.68 12L19.42 14L20.39 16.9L17.47 17.71L17 20.71L14.09 19.74L12 22L9.91 19.74L7 20.71L6.53 17.71L3.61 16.9L4.58 14L2.32 12L4.58 10L3.61 7.1L6.53 6.29L7 3.29L9.91 4.26L12 2Z" fill="#1877F2"/>
                    <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(scenario.rating) ? "text-accent fill-accent" : i < scenario.rating ? "text-accent fill-accent/50" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{t("showcase.weeksAgo")}</span>
                </div>
              </div>
            </div>

            {/* Row 3: Quote */}
            <div className={`transition-all duration-300 ${rowsVisible >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
              <p className="text-xs md:text-base text-foreground/80 italic leading-relaxed line-clamp-2">{t(scenario.commentKey)}</p>
            </div>

            {/* Row 4: Dimension pills */}
            <div className={`flex flex-nowrap gap-2 justify-center overflow-hidden transition-all duration-300 ${rowsVisible >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
              {scenario.dimensions.map((dim) => {
                const Icon = dimensionIconKeys[dim.labelKey] || Clock;
                return (
                  <span key={dim.labelKey} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold border ${dim.positive ? "bg-trust-excellent/10 text-trust-excellent border-trust-excellent/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-foreground/60">{t(dim.labelKey)}</span>
                    <span className="font-bold">{t(dim.valueKey)}</span>
                  </span>
                );
              })}
            </div>

          </div>
        </div>

        {/* Agent Teaser content */}
        {cardPhase === "agent" && (
          <div className="p-3 flex flex-col justify-center min-h-[180px] animate-fade-in">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-primary tracking-wide uppercase">R8 Agent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-trust-excellent animate-pulse" />
            </div>

            {/* Question typing */}
            <p className="text-base font-semibold text-foreground mb-2">
              "{agentTeaserPairs[teaserIdx].question.slice(0, teaserTypedChars)}"
              {teaserPhase === "typing" && teaserTypedChars < agentTeaserPairs[teaserIdx].question.length && (
                <span className="animate-pulse text-primary">|</span>
              )}
            </p>

            {/* Processing phase */}
            {teaserPhase === "processing" && (
              <div className="space-y-2 mb-2 animate-fade-in">
                <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider mb-1">Processing your request…</p>
                {agentProcessingSteps.map((step, i) => {
                  const isDone = i < teaserStep;
                  const isActive = i === teaserStep;
                  return (
                    <div key={i} className={`flex items-center gap-2 transition-opacity duration-300 ${isDone || isActive ? "opacity-100" : "opacity-30"}`}>
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-trust-excellent shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <span className={`text-xs ${isDone ? "text-muted-foreground" : isActive ? "text-foreground font-medium" : "text-muted-foreground/50"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
                {/* 3-Station Milestone Tracker */}
                <div className="relative flex items-center justify-between mt-3 px-2">
                  {/* Background line */}
                  <div className="absolute top-[8px] left-[8px] right-[8px] h-[3px] bg-muted-foreground/20 z-0 rounded-full" />
                  {/* Active fill line */}
                  <div
                    className="absolute top-[8px] left-[8px] h-[3px] rounded-full transition-all duration-700 ease-out z-[1]"
                    style={{
                      width: `${Math.min(teaserStep / agentProcessingSteps.length * 100, 100)}%`,
                      background: teaserStep >= 3
                        ? "linear-gradient(90deg, #3b82f6, #f59e0b, #22c55e)"
                        : teaserStep >= 2
                          ? "linear-gradient(90deg, #3b82f6, #f59e0b)"
                          : "#3b82f6",
                    }}
                  />
                  {agentStationLabels.map((label, idx) => {
                    const stationDone = teaserStep > idx;
                    const stationActive = teaserStep === idx;
                    return (
                      <div key={idx} className="flex flex-col items-center z-[2]">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                          stationDone
                            ? `${agentStationColors[idx]} border-transparent`
                            : stationActive
                              ? `${agentStationColors[idx]}/50 border-current`
                              : "bg-background border-muted-foreground/30"
                        }`}>
                          {stationDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-[11px] mt-1 font-semibold ${stationDone || stationActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Result phase — compact badge */}
            {teaserPhase === "result" && (() => {
              const pair = agentTeaserPairs[teaserIdx];
              const bgMap = { warning: "bg-destructive/10", positive: "bg-emerald-500/10", insight: "bg-amber-500/10" };
              const textMap = { warning: "text-destructive", positive: "text-emerald-600", insight: "text-amber-600" };
              const filledStars = Math.round(pair.rating);
              return (
                <div className={`animate-fade-in rounded-xl px-4 py-3 ${bgMap[pair.type]}`}>
                  <p className={`text-base md:text-lg font-extrabold leading-tight ${textMap[pair.type]}`}>
                    {pair.type === "warning" ? "⚠️" : pair.type === "positive" ? "✅" : "📊"} {pair.verdict}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4" fill={i <= filledStars ? "#00b67a" : "transparent"} color={i <= filledStars ? "#00b67a" : "hsl(var(--muted-foreground))"} strokeWidth={1.5} />
                      ))}
                      <span className="text-sm font-bold text-foreground ml-1">{pair.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {REVIEWER_AVATARS.slice(0, 4).map((src, i) => (
                          <img key={i} src={src} alt="reviewer" className="w-7 h-7 rounded-full border-2 border-background object-cover" loading="lazy" />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground ml-1.5">+{pair.reviewerCount}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{pair.proof}</p>
                </div>
              );
            })()}


            <button
              onClick={() => navigate("/copilot")}
              className={`mt-auto self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all ${teaserPhase === "result" ? "opacity-100 animate-pulse" : "opacity-60"}`}
            >
              Try R8 Agent
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
