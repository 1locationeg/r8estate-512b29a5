import { CheckCircle, AlertTriangle, XCircle, Star } from "lucide-react";

type Sentiment = "good" | "mixed" | "poor" | "none";

interface JourneyStage {
  label: string;
  sentiment: Sentiment;
  summary?: string;
}

interface ProjectJourneyWidgetProps {
  projectName: string;
  developerName: string;
  score: number;
  reviewCount: number;
  stages?: JourneyStage[];
  updatedAt?: string;
  theme?: "dark" | "light";
  ctaUrl?: string;
  onCtaClick?: () => void;
}

const sentimentConfig: Record<Sentiment, { icon: typeof CheckCircle; color: string; label: string }> = {
  good: { icon: CheckCircle, color: "#3B6D11", label: "Good" },
  mixed: { icon: AlertTriangle, color: "#d97706", label: "Mixed" },
  poor: { icon: XCircle, color: "#dc2626", label: "Poor" },
  none: { icon: CheckCircle, color: "#9ca3af", label: "N/A" },
};

const defaultStages: JourneyStage[] = [
  { label: "Sales Process", sentiment: "good" },
  { label: "Construction", sentiment: "mixed" },
  { label: "Handover", sentiment: "good" },
];

export const ProjectJourneyWidget = ({
  projectName,
  developerName,
  score,
  reviewCount,
  stages = defaultStages,
  updatedAt,
  theme = "dark",
  ctaUrl,
}: ProjectJourneyWidgetProps) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-2xl p-5 max-w-[440px] w-full ${
        isDark
          ? "bg-[hsl(203,81%,21%)] text-white"
          : "bg-white text-[hsl(203,81%,21%)] border border-[hsl(203,20%,88%)]"
      }`}
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold">{projectName}</h3>
        <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>by {developerName}</p>
      </div>

      {/* Timeline */}
      <div className="flex items-start justify-between gap-1 mb-5 relative">
        {/* Connector line */}
        <div className={`absolute top-4 left-[10%] right-[10%] h-0.5 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />

        {stages.map((stage, i) => {
          const cfg = sentimentConfig[stage.sentiment];
          const Icon = cfg.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: cfg.color + "22" }}
              >
                <Icon size={16} style={{ color: cfg.color }} />
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight">{stage.label}</span>
              <span className="text-[9px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Score row */}
      <div className={`flex items-center justify-between py-2.5 px-3 rounded-xl mb-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold" style={{ color: "#fac417" }}>{score.toFixed(1)}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className={i < Math.round(score) ? "text-[#fac417] fill-[#fac417]" : isDark ? "text-white/20" : "text-gray-300"} />
            ))}
          </div>
        </div>
        <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-400"}`}>{reviewCount} reviews</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {updatedAt && (
          <span className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"}`}>
            Updated {updatedAt}
          </span>
        )}
        <span className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"} ms-auto`}>
          Powered by R8ESTATE
        </span>
      </div>
    </div>
  );
};
