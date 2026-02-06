interface TrustGaugeMiniProps {
  score: number;
  size?: "xs" | "sm";
}

export const TrustGaugeMini = ({ score, size = "sm" }: TrustGaugeMiniProps) => {
  const getColor = (score: number) => {
    if (score >= 66) return "text-trust-excellent";
    if (score >= 50) return "text-trust-good";
    return "text-trust-fair";
  };

  const dimensions = size === "xs" ? "w-7 h-7" : "w-8 h-8";
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";

  return (
    <div className={`relative ${dimensions} flex-shrink-0`}>
      <svg className={`${dimensions} transform -rotate-90`}>
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          className="text-muted/50"
        />
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray={`${(score / 100) * 100} 100`}
          strokeLinecap="round"
          className={getColor(score)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${textSize} font-bold ${getColor(score)}`}>{score}</span>
      </div>
    </div>
  );
};
