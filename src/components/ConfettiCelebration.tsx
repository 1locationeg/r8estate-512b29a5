import { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'square' | 'circle' | 'strip';
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(45, 93%, 58%)',   // gold
  'hsl(210, 79%, 56%)',  // blue
  'hsl(340, 82%, 59%)',  // pink
  'hsl(150, 60%, 50%)',  // green
];

function createParticle(canvasWidth: number): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: -10 - Math.random() * 40,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    size: Math.random() * 6 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
    shape: (['square', 'circle', 'strip'] as const)[Math.floor(Math.random() * 3)],
  };
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
}

export function ConfettiCelebration({ trigger, duration = 3000, particleCount = 60 }: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = Date.now() - startTimeRef.current;
    const fadeStart = duration * 0.7;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.vy += 0.08; // gravity
      p.y += p.vy;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;

      if (elapsed > fadeStart) {
        p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (duration - fadeStart));
      }

      if (p.y < canvas.height + 20 && p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'strip') {
          ctx.fillRect(-p.size / 2, -p.size * 1.5 / 2, p.size, p.size * 1.5);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      }
    }

    if (alive && elapsed < duration + 500) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setActive(false);
    }
  }, [duration]);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to parent
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas.width));
    startTimeRef.current = Date.now();
    setActive(true);
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [trigger, particleCount, animate]);

  if (!active && !trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * Hook to detect newly earned badges/tier changes and trigger confetti.
 * Uses localStorage to remember previously seen state.
 */
export function useConfettiTrigger(storageKey: string, earnedBadgeIds: string[], tierId: string) {
  const [shouldFire, setShouldFire] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    const prev = stored ? JSON.parse(stored) : { badges: [], tier: '' };

    const newBadges = earnedBadgeIds.filter((id) => !prev.badges.includes(id));
    const tierChanged = prev.tier && prev.tier !== tierId;

    if (newBadges.length > 0 || tierChanged) {
      setShouldFire(true);
      // Reset after animation
      setTimeout(() => setShouldFire(false), 3500);
    }

    // Save current state
    localStorage.setItem(storageKey, JSON.stringify({ badges: earnedBadgeIds, tier: tierId }));
  }, [storageKey, earnedBadgeIds, tierId]);

  return shouldFire;
}
