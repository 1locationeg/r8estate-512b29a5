import { ExternalLink } from "lucide-react";

interface ComparisonStripProps {
  entityName: string;
  score: number;
  marketAverage?: number;
  theme?: "dark" | "light";
  ctaUrl?: string;
}

const ScoreBar = ({
  label,
  value,
  maxValue = 5,
  color,
  isDark,
}: {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  isDark: boolean;
}) => (
  <div className="flex items-center gap-2 text-[10px]">
    <span className={`w-20 truncate font-medium ${isDark ? "text-white/70" : "text-gray-500"}`}>{label}</span>
    <div className={`flex-1 h-2 rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${(value / maxValue) * 100}%`, backgroundColor: color }}
      />
    </div>
    <span className="w-6 text-right font-bold" style={{ color }}>{value.toFixed(1)}</span>
  </div>
);

export const ComparisonStrip = ({
  entityName,
  score,
  marketAverage = 3.5,
  theme = "dark",
  ctaUrl,
}: ComparisonStripProps) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-2xl p-4 max-w-[580px] w-full ${
        isDark
          ? "bg-[hsl(203,81%,21%)] text-white"
          : "bg-white text-[hsl(203,81%,21%)] border border-[hsl(203,20%,88%)]"
      }`}
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold">{entityName} vs Market Average</h3>
        {ctaUrl && (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-semibold"
            style={{ color: "#fac417" }}
          >
            View full comparison <ExternalLink size={10} />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        <ScoreBar label={entityName} value={score} color="#fac417" isDark={isDark} />
        <ScoreBar label="Market avg" value={marketAverage} color={isDark ? "#ffffff66" : "#9ca3af"} isDark={isDark} />
      </div>

      <div className={`text-center text-[9px] mt-3 opacity-30 font-medium`}>
        Powered by R8ESTATE
      </div>
    </div>
  );
};
