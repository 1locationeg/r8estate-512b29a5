import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type TourStep = { selector: string; title: string; body: string };

interface Props {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}

export function DemoTour({ steps, open, onClose }: Props) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => { if (open) setI(0); }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = document.querySelector(steps[i]?.selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // delay to let scroll settle
        setTimeout(() => setRect(el.getBoundingClientRect()), 350);
      } else {
        setRect(null);
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, i, steps]);

  if (!open || !steps.length) return null;

  const step = steps[i];
  const pad = 8;
  const spotlight = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  // Tooltip placement (below spotlight, fallback center)
  const tooltipStyle: React.CSSProperties = spotlight
    ? {
        position: "fixed",
        top: Math.min(spotlight.top + spotlight.height + 12, window.innerHeight - 220),
        left: Math.max(12, Math.min(spotlight.left, window.innerWidth - 340)),
        width: 320,
        zIndex: 10001,
      }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 320, zIndex: 10001 };

  return (
    <>
      {/* Overlay with cutout */}
      <div className="fixed inset-0 z-[10000] pointer-events-auto" onClick={onClose}>
        <svg className="w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlight && (
                <rect
                  x={spotlight.left}
                  y={spotlight.top}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx={12}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#tour-mask)" />
          {spotlight && (
            <rect
              x={spotlight.left}
              y={spotlight.top}
              width={spotlight.width}
              height={spotlight.height}
              rx={12}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          )}
        </svg>
      </div>

      <div style={tooltipStyle} className="bg-background border-2 border-primary rounded-xl shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs text-muted-foreground">Step {i + 1} of {steps.length}</p>
            <h4 className="font-bold text-base">{step.title}</h4>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-muted-foreground">{step.body}</p>
        <div className="flex items-center justify-between mt-4">
          <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
            <ChevronLeft className="w-4 h-4 me-1" /> Back
          </Button>
          {i < steps.length - 1 ? (
            <Button size="sm" onClick={() => setI(i + 1)}>
              Next <ChevronRight className="w-4 h-4 ms-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={onClose}>Done</Button>
          )}
        </div>
      </div>
    </>
  );
}