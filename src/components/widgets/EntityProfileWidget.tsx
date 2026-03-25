import { Star, CheckCircle, ExternalLink } from "lucide-react";

interface ReviewSnippet {
  authorName: string;
  rating: number;
  comment: string;
}

interface EntityProfileWidgetProps {
  entityName: string;
  entityType: string;
  score: number;
  reviewCount: number;
  isVerified?: boolean;
  recentReviews?: ReviewSnippet[];
  theme?: "dark" | "light";
  ctaUrl?: string;
  onCtaClick?: () => void;
}

export const EntityProfileWidget = ({
  entityName,
  entityType,
  score,
  reviewCount,
  isVerified = true,
  recentReviews = [],
  theme = "dark",
  ctaUrl,
  onCtaClick,
}: EntityProfileWidgetProps) => {
  const isDark = theme === "dark";
  const scorePercent = (score / 5) * 100;

  return (
    <div
      className={`rounded-2xl p-5 max-w-[420px] w-full ${
        isDark
          ? "bg-[hsl(203,81%,21%)] text-white"
          : "bg-white text-[hsl(203,81%,21%)] border border-[hsl(203,20%,88%)]"
      }`}
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold truncate">{entityName}</h3>
          <span
            className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
              isDark ? "bg-white/10 text-white/80" : "bg-gray-100 text-gray-600"
            }`}
          >
            {entityType}
          </span>
        </div>

        {/* Score ring */}
        <div className="relative shrink-0 w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}
              strokeWidth="5"
            />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="#fac417"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${scorePercent * 1.76} 176`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-extrabold leading-none" style={{ color: "#fac417" }}>
              {score.toFixed(1)}
            </span>
            <span className="text-[8px] font-semibold opacity-60">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className={`flex items-center gap-4 text-xs mb-4 pb-3 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < Math.round(score) ? "text-[#fac417] fill-[#fac417]" : isDark ? "text-white/20" : "text-gray-300"} />
          ))}
        </div>
        <span className="opacity-60">{reviewCount} reviews</span>
        {isVerified && (
          <div className="flex items-center gap-1 ms-auto">
            <CheckCircle size={12} className="text-[hsl(105,50%,30%)]" />
            <span className="text-[10px] font-medium" style={{ color: "hsl(105,50%,30%)" }}>Verified</span>
          </div>
        )}
      </div>

      {/* Review snippets */}
      {recentReviews.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {recentReviews.slice(0, 2).map((r, i) => (
            <div key={i} className={`rounded-lg p-2.5 text-xs ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{r.authorName}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={9} className={j < r.rating ? "text-[#fac417] fill-[#fac417]" : isDark ? "text-white/20" : "text-gray-300"} />
                  ))}
                </div>
              </div>
              <p className={`line-clamp-2 ${isDark ? "text-white/70" : "text-gray-600"}`}>
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {ctaUrl && (
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCtaClick}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-colors"
          style={{ backgroundColor: "#fac417", color: "hsl(203,81%,21%)" }}
        >
          See full profile on R8ESTATE
          <ExternalLink size={12} />
        </a>
      )}

      {/* Footer */}
      <div className={`text-center text-[9px] mt-3 opacity-40 font-medium`}>
        Powered by R8ESTATE
      </div>
    </div>
  );
};
