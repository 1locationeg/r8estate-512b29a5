import { useState, useEffect, useRef } from "react";

const scoreSequence = [75, 82, 68, 91, 77, 85, 72, 88, 79, 94, 65, 80];

const getScoreColor = (s: number) => {
  if (s >= 80) return "hsl(142, 71%, 45%)";
  if (s >= 66) return "hsl(80, 60%, 45%)";
  if (s >= 50) return "hsl(48, 96%, 53%)";
  if (s >= 30) return "hsl(20, 80%, 50%)";
  return "hsl(0, 72%, 51%)";
};

export const HeroTrustGauge = () => {
  const [gaugeScore, setGaugeScore] = useState(0);
  const [targetIdx, setTargetIdx] = useState(0);
  const animRef = useRef<number | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    const startVal = scoreRef.current;
    const target = scoreSequence[targetIdx];
    const startTime = performance.now();
    const duration = 1500;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      scoreRef.current = current;
      setGaugeScore(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetIdx]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetIdx(prev => (prev + 1) % scoreSequence.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pct = gaugeScore / 100;
  const arcLen = Math.PI * 90;
  const filled = pct * arcLen;
  const angle = Math.PI + pct * Math.PI;
  const mx = 100 + 90 * Math.cos(angle);
  const my = 100 + 90 * Math.sin(angle);
  const rotDeg = pct * 180 - 90;
  const color = getScoreColor(gaugeScore);

  return (
    <div className="relative w-48 h-28 md:w-56 md:h-32 mt-4 mx-auto">
      <svg viewBox="0 0 200 115" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id="heroGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
            <stop offset="16%" stopColor="hsl(20, 80%, 50%)" />
            <stop offset="33%" stopColor="hsl(40, 90%, 50%)" />
            <stop offset="50%" stopColor="hsl(48, 96%, 53%)" />
            <stop offset="75%" stopColor="hsl(80, 60%, 45%)" />
            <stop offset="100%" stopColor="hsl(142, 71%, 45%)" />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="markerShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Tick marks */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
          const tickAngle = Math.PI + (tick / 100) * Math.PI;
          const innerR = tick % 50 === 0 ? 72 : 76;
          const outerR = 80;
          const x1 = 100 + innerR * Math.cos(tickAngle);
          const y1 = 100 + innerR * Math.sin(tickAngle);
          const x2 = 100 + outerR * Math.cos(tickAngle);
          const y2 = 100 + outerR * Math.sin(tickAngle);
          return (
            <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--muted-foreground))" strokeWidth={tick % 50 === 0 ? "2" : "1"} opacity="0.3" />
          );
        })}

        {/* Background arc */}
        <path d="M 10 100 A 90 90 0 0 1 190 100" stroke="hsl(var(--border))" strokeWidth="16" fill="none" strokeLinecap="round" />

        {/* Gradient filled arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          stroke="url(#heroGaugeGradient)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLen}`}
          filter="url(#gaugeGlow)"
        />

        {/* Arrow marker */}
        <circle cx={mx} cy={my} r="9" fill="hsl(var(--background))" stroke={color} strokeWidth="3" filter="url(#markerShadow)" />
        <polygon points="-4,5 4,5 0,-7" fill={color} transform={`translate(${mx},${my}) rotate(${rotDeg})`} />

        {/* Min/Max labels */}
        <text x="12" y="113" fontSize="9" fill="hsl(var(--muted-foreground))" fontWeight="600" opacity="0.6">0</text>
        <text x="180" y="113" fontSize="9" fill="hsl(var(--muted-foreground))" fontWeight="600" opacity="0.6">100</text>
      </svg>

      {/* Center score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span className="text-3xl md:text-4xl font-black tabular-nums" style={{ color }}>
          {gaugeScore}
        </span>
        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Trust Score
        </span>
      </div>
    </div>
  );
};
