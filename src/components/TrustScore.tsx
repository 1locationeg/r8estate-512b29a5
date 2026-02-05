interface TrustScoreProps {
  score: number;
}

export const TrustScore = ({ score }: TrustScoreProps) => {
  const getColor = (score: number) => {
    if (score >= 66) return "text-trust-excellent";
    if (score >= 50) return "text-trust-good";
    return "text-trust-fair";
  };

  const getLabel = (score: number) => {
    if (score >= 66) return "Excellent";
    if (score >= 50) return "Good";
    return "Fair";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(score / 100) * 150.8} 150.8`}
            className={getColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getColor(score)}`}>{score}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">TrustScore</span>
        <span className={`text-sm font-semibold ${getColor(score)}`}>{getLabel(score)}</span>
      </div>
    </div>
  );
};
