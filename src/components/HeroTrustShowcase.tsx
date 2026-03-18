import { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Star, BadgeCheck, RotateCcw, Building2, MapPin, Clock, Hammer, FileText, MessageCircle } from "lucide-react";

// ── Score color logic ──
const getScoreColor = (s: number) => {
  if (s >= 80) return "hsl(142, 71%, 45%)";
  if (s >= 66) return "hsl(80, 60%, 45%)";
  if (s >= 50) return "hsl(48, 96%, 53%)";
  if (s >= 30) return "hsl(20, 80%, 50%)";
  return "hsl(0, 72%, 51%)";
};

const getTrustLabel = (s: number) => {
  if (s >= 90) return "Exceptional";
  if (s >= 75) return "High Trust";
  if (s >= 60) return "Moderate";
  if (s >= 40) return "Mixed";
  return "Low Trust";
};

// ── Review scenarios ──
interface ReviewScenario {
  score: number;
  reviewer: string;
  initial: string;
  avatar: string;
  project: string;
  location: string;
  developer: string;
  rating: number;
  comment: string;
  dimensions: { label: string; value: string; positive: boolean }[];
  trustLabel: string;
}

const scenarios: ReviewScenario[] = [
  {
    score: 25,
    reviewer: "Ahmed K.",
    initial: "A",
    avatar: "https://i.pravatar.cc/80?img=12",
    project: "Galleria 40",
    location: "New Cairo",
    developer: "Ora Developers",
    rating: 1.5,
    comment: "\"Delivery delayed 18 months with zero communication. Finishing quality was far below the brochure. Very disappointing.\"",
    dimensions: [
      { label: "Delivery", value: "18mo late", positive: false },
      { label: "Build quality", value: "Poor", positive: false },
      { label: "Response", value: "No reply", positive: false },
    ],
    trustLabel: "Low Trust",
  },
  {
    score: 55,
    reviewer: "Sarah M.",
    initial: "S",
    avatar: "https://i.pravatar.cc/80?img=5",
    project: "Open Air Mall",
    location: "New Cairo",
    developer: "Marakez",
    rating: 3,
    comment: "\"Decent mall experience, great variety of stores — but parking is a nightmare and some units still vacant after a year.\"",
    dimensions: [
      { label: "Delivery", value: "3mo late", positive: false },
      { label: "Build quality", value: "Average", positive: false },
      { label: "Response", value: "Slow", positive: false },
    ],
    trustLabel: "Mixed",
  },
  {
    score: 88,
    reviewer: "Fatima Al-R.",
    initial: "F",
    avatar: "https://i.pravatar.cc/80?img=9",
    project: "Mivida",
    location: "New Cairo",
    developer: "Emaar Misr",
    rating: 4.5,
    comment: "\"Excellent compound, green spaces everywhere. Delivered on schedule with premium finishing. Community life is wonderful.\"",
    dimensions: [
      { label: "Delivery", value: "On time", positive: true },
      { label: "Build quality", value: "Excellent", positive: true },
      { label: "Response", value: "Fast", positive: true },
    ],
    trustLabel: "High Trust",
  },
  {
    score: 97,
    reviewer: "Omar J.",
    initial: "O",
    avatar: "https://i.pravatar.cc/80?img=53",
    project: "Mountain View iCity",
    location: "New Cairo",
    developer: "Mountain View",
    rating: 5,
    comment: "\"Absolutely world-class compound. Every detail perfect — from handover to community management. Above and beyond.\"",
    dimensions: [
      { label: "Delivery", value: "Early", positive: true },
      { label: "Build quality", value: "Premium", positive: true },
      { label: "Response", value: "Instant", positive: true },
    ],
    trustLabel: "Exceptional",
  },
];

const presets = [25, 55, 88, 97];

function getClosestScenario(score: number): ReviewScenario {
  let closest = scenarios[0];
  let minDist = Math.abs(score - scenarios[0].score);
  for (const s of scenarios) {
    const d = Math.abs(score - s.score);
    if (d < minDist) {
      minDist = d;
      closest = s;
    }
  }
  return closest;
}

const dimensionIcons: Record<string, typeof Clock> = {
  Delivery: Clock,
  "Build quality": Hammer,
  "Brochure match": FileText,
  Response: MessageCircle,
};

// ── Component ──
export const HeroTrustShowcase = () => {
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [phase, setPhase] = useState<"entrance" | "interactive">("entrance");
  const [cardVisible, setCardVisible] = useState(false);
  const [rowsVisible, setRowsVisible] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const animRef = useRef<number | null>(null);
  const cycleIdxRef = useRef(2); // start at scenario index 2 (score 88)
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runEntranceRef = useRef<(() => void) | null>(null);
  const entranceTarget = 88;

  // ── Auto-cycle logic ──
  const startCycling = useCallback(() => {
    if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    cycleIntervalRef.current = setInterval(() => {
      cycleIdxRef.current = (cycleIdxRef.current + 1) % scenarios.length;

      // When wrapping back to start, just crossfade like any other transition (no replay reset)
      const nextScore = scenarios[cycleIdxRef.current].score;
      setTransitioning(true);
      setTimeout(() => {
        setScore(nextScore);
        const startVal = displayScore;
        const startTime = performance.now();
        const duration = 800;
        const step = (now: number) => {
          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = Math.round(startVal + (nextScore - startVal) * eased);
          setDisplayScore(current);
          if (t < 1) {
            animRef.current = requestAnimationFrame(step);
          } else {
            setDisplayScore(nextScore);
          }
        };
        if (animRef.current) cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(step);
        setTimeout(() => setTransitioning(false), 50);
      }, 200);
    }, 4000);
  }, [displayScore]);

  const pauseCycling = useCallback(() => {
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      startCycling();
    }, 6000);
  }, [startCycling]);

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
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [runEntrance]);

  // ── Interactive score animation ──
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
    pauseCycling();
  };

  const handlePreset = (val: number) => {
    animateToScore(val);
    pauseCycling();
  };

  const handleReplay = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    cycleIdxRef.current = 2;
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
    <div className="w-full max-w-md mx-auto">
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
          <text x="100" y="119" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" fontWeight="900" letterSpacing="0.25em" opacity="0.6">
            TRUST SCORE
          </text>
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-5">
          <span className="text-3xl md:text-4xl font-black tabular-nums leading-none transition-colors duration-300" style={{ color }}>
            {displayScore}
          </span>
        </div>
      </div>

      {/* ── Review Card ── */}
      <div
        className={`relative mt-1 mx-2 md:mx-0 rounded-xl border border-border bg-card shadow-lg overflow-hidden transition-all ${
          cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${transitioning ? "opacity-40" : "opacity-100"}`}
        style={{ transitionDuration: transitioning ? "200ms" : "600ms" }}
      >
        <div className="p-3 space-y-1.5">
          {/* Row 1: Project location - centered & bold */}
          <div
            className={`flex justify-center transition-all duration-300 ${
              rowsVisible >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <span className="text-xs md:text-sm font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {scenario.project} · {scenario.location}
            </span>
          </div>

          {/* Row 2: Reviewer info */}
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              rowsVisible >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <img
              src={scenario.avatar}
              alt={scenario.reviewer}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{scenario.reviewer}</span>
                {/* Facebook-style verified badge */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.09 4.26L17 3.29L17.47 6.29L20.39 7.1L19.42 10L21.68 12L19.42 14L20.39 16.9L17.47 17.71L17 20.71L14.09 19.74L12 22L9.91 19.74L7 20.71L6.53 17.71L3.61 16.9L4.58 14L2.32 12L4.58 10L3.61 7.1L6.53 6.29L7 3.29L9.91 4.26L12 2Z" fill="#1877F2"/>
                  <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(scenario.rating)
                          ? "text-accent fill-accent"
                          : i < scenario.rating
                          ? "text-accent fill-accent/50"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">2 weeks ago</span>
              </div>
            </div>
          </div>

          {/* Row 3: Quote */}
          <div
            className={`transition-all duration-300 ${
              rowsVisible >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <p className="text-xs md:text-base text-foreground/80 italic leading-relaxed line-clamp-3">
              {scenario.comment}
            </p>
          </div>

          {/* Row 4: Dimension pills */}
          <div
            className={`flex flex-nowrap gap-1 overflow-hidden transition-all duration-300 ${
              rowsVisible >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            {scenario.dimensions.map((dim) => {
              const Icon = dimensionIcons[dim.label] || Clock;
              return (
                <span
                  key={dim.label}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold border ${
                    dim.positive
                      ? "bg-trust-excellent/10 text-trust-excellent border-trust-excellent/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="text-foreground/60">{dim.label}</span>
                  <span className="font-bold">{dim.value}</span>
                </span>
              );
            })}
          </div>

          {/* Row 5: Footer — developer + trust badge */}
          <div
            className={`flex items-center justify-between pt-1.5 border-t border-border transition-all duration-300 ${
              rowsVisible >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{scenario.developer}</span>
            </div>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{
                color,
                borderColor: color,
                backgroundColor: `${color}15`,
              }}
            >
              {getTrustLabel(displayScore)} · {displayScore}
            </span>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mt-4 mx-2 md:mx-0 space-y-1">
        {/* Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground w-6 text-right">0</span>
          <Slider
            value={[score]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
            className="flex-1"
          />
          <span className="text-[10px] font-bold text-muted-foreground w-6">100</span>
        </div>
        {/* Preset markers */}
        <div className="flex items-center gap-3">
          <span className="w-6" />
          <div className="flex-1 relative h-4">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`absolute -translate-x-1/2 text-[9px] font-bold transition-colors ${
                  score === p ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ left: `${p}%` }}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="w-6" />
        </div>

      </div>
    </div>
  );
};
