import { useState } from "react";
import { Star } from "lucide-react";

interface ReviewUsWidgetProps {
  entityName: string;
  theme?: "dark" | "light";
  ctaUrl?: string;
  onCtaClick?: () => void;
}

export const ReviewUsWidget = ({
  entityName,
  theme = "dark",
  ctaUrl = "#",
  onCtaClick,
}: ReviewUsWidgetProps) => {
  const isDark = theme === "dark";
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  return (
    <div
      className={`rounded-2xl p-5 max-w-[340px] w-full text-center ${
        isDark
          ? "bg-[hsl(203,81%,21%)] text-white"
          : "bg-white text-[hsl(203,81%,21%)] border border-[hsl(203,20%,88%)]"
      }`}
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <p className={`text-sm font-semibold mb-1 ${isDark ? "text-white/90" : ""}`}>
        How was your experience with
      </p>
      <p className="text-base font-bold mb-4" style={{ color: "#fac417" }}>
        {entityName}?
      </p>

      {/* Star selector */}
      <div className="flex items-center justify-center gap-1.5 mb-5">
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i < (hovered || selected);
          return (
            <button
              key={i}
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(i + 1)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={28}
                className={active ? "text-[#fac417] fill-[#fac417]" : isDark ? "text-white/25" : "text-gray-300"}
              />
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <a
        href={ctaUrl ? `${ctaUrl}${selected ? `?rating=${selected}` : ""}` : "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onCtaClick}
        className="block w-full py-2.5 rounded-xl text-sm font-bold transition-colors"
        style={{ backgroundColor: "#fac417", color: "hsl(203,81%,21%)" }}
      >
        Write a Review
      </a>

      <div className={`text-[9px] mt-3 opacity-30 font-medium`}>
        Powered by R8ESTATE
      </div>
    </div>
  );
};
