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
    <div className="flex items-center gap-1.5 md:gap-2">
      <div className="relative w-10 h-10 md:w-14 md:h-14">
        <svg className="w-10 h-10 md:w-14 md:h-14 transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="35%"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="50%"
            cy="50%"
            r="35%"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${(score / 100) * 110} 110`}
            className={getColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs md:text-sm font-bold ${getColor(score)}`}>{score}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] md:text-xs text-muted-foreground">TrustScore</span>
        <span className={`text-xs md:text-sm font-semibold ${getColor(score)}`}>{getLabel(score)}</span>
      </div>
    </div>
  );
};
