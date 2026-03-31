import { useLocation } from "react-router-dom";
import { getStationForRoute, type JourneyStation } from "@/lib/journeyStations";

const GRADIENT_COLORS: Record<string, string> = {
  research: "from-[hsl(203_81%_21%/0.06)]",
  choose: "from-[hsl(45_96%_54%/0.06)]",
  finance: "from-[hsl(180_65%_35%/0.06)]",
  protect: "from-[hsl(152_60%_38%/0.06)]",
};

const CSS_VAR_MAP: Record<string, string> = {
  research: "203 81% 21%",
  choose: "45 96% 54%",
  finance: "180 65% 35%",
  protect: "152 60% 38%",
};

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const StationPageWrapper = ({ children, className = "" }: Props) => {
  const { pathname } = useLocation();
  const station = getStationForRoute(pathname);

  if (!station) {
    return <div className={className}>{children}</div>;
  }

  const style = {
    "--station-accent": `var(--journey-${station.key})`,
  } as React.CSSProperties;

  return (
    <div style={style} className={`relative ${className}`}>
      {/* Subtle gradient tint at top */}
      <div
        className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${GRADIENT_COLORS[station.key]} to-transparent pointer-events-none z-0`}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};
