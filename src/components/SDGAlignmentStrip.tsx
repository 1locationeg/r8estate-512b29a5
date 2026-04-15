import { useNavigate } from "react-router-dom";
import { Building2, Leaf, Handshake, ArrowRight } from "lucide-react";

const goals = [
  { number: 11, label: "Sustainable Cities", icon: Building2, color: "hsl(35, 85%, 55%)" },
  { number: 13, label: "Climate Action", icon: Leaf, color: "hsl(145, 60%, 40%)" },
  { number: 17, label: "Partnerships", icon: Handshake, color: "hsl(210, 70%, 50%)" },
];

export const SDGAlignmentStrip = () => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full rounded-xl border border-border/60 bg-card p-3 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all duration-300"
      onClick={() => navigate("/impact")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap shrink-0">
            SDG Aligned
          </span>
          {goals.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.number} className="flex items-center gap-1.5 shrink-0">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${g.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: g.color }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold" style={{ color: g.color }}>SDG {g.number}</span>
                  <span className="text-[9px] text-muted-foreground leading-none">{g.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
};
