import { Star, CheckCircle } from "lucide-react";

interface MicroBadgeProps {
  entityName: string;
  score: number;
  reviewCount: number;
  isVerified?: boolean;
  theme?: "dark" | "light";
  ctaUrl?: string;
  onCtaClick?: () => void;
}

export const MicroBadge = ({
  entityName,
  score,
  reviewCount,
  isVerified = true,
  theme = "dark",
  ctaUrl,
  onCtaClick,
}: MicroBadgeProps) => {
  const isDark = theme === "dark";
  const stars = Math.round(score);

  const Wrapper = ctaUrl ? "a" : "div";
  const wrapperProps = ctaUrl
    ? { href: ctaUrl, target: "_blank", rel: "noopener noreferrer", onClick: onCtaClick }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`inline-flex items-center gap-4 rounded-2xl px-5 py-4 max-w-[440px] transition-shadow hover:shadow-xl ${
        isDark
          ? "bg-[hsl(203,81%,21%)] text-white"
          : "bg-white text-[hsl(203,81%,21%)] border border-[hsl(203,20%,88%)]"
      }`}
      style={{ fontFamily: "Montserrat, sans-serif", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}
    >
      {/* R8 Score */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-4xl font-extrabold leading-none tracking-tight" style={{ color: "#fac417" }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mt-1">
          R8 Score
        </span>
      </div>

      {/* Divider */}
      <div className={`w-px h-14 ${isDark ? "bg-white/20" : "bg-gray-200"}`} />

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-base font-bold truncate">{entityName}</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={15}
              className={i < stars ? "text-[#fac417] fill-[#fac417]" : isDark ? "text-white/30" : "text-gray-300"}
            />
          ))}
          <span className="text-xs opacity-60 ms-1.5 font-medium">({reviewCount})</span>
        </div>
        {isVerified && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <CheckCircle size={13} className="text-[hsl(105,50%,30%)]" />
            <span className="text-[11px] font-semibold" style={{ color: "hsl(105,50%,30%)" }}>
              Verified by R8ESTATE
            </span>
          </div>
        )}
      </div>
    </Wrapper>
  );
};
