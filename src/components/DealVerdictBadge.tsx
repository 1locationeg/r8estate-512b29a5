import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DealVerdictBadgeProps {
  avgRating: number;
  ratingCount: number;
  dealType: string;
}

type Verdict = "above_market" | "standard" | "below_market" | "new";

function getVerdict(avgRating: number, ratingCount: number): Verdict {
  if (ratingCount < 3) return "new";
  if (avgRating >= 4.0) return "above_market";
  if (avgRating >= 2.5) return "standard";
  return "below_market";
}

const verdictConfig: Record<Verdict, {
  label: string;
  icon: typeof TrendingUp;
  className: string;
  tooltip: string;
}> = {
  above_market: {
    label: "Above Market",
    icon: TrendingUp,
    className: "bg-emerald-500/15 text-emerald-700 border-emerald-300",
    tooltip: "Buyers rate this deal above average — strong value signal",
  },
  standard: {
    label: "Market Standard",
    icon: Minus,
    className: "bg-amber-500/15 text-amber-700 border-amber-300",
    tooltip: "This deal is rated as standard — comparable to similar offers",
  },
  below_market: {
    label: "Below Market",
    icon: TrendingDown,
    className: "bg-red-500/15 text-red-700 border-red-300",
    tooltip: "Buyers rate this deal below average — proceed with caution",
  },
  new: {
    label: "Awaiting Verdict",
    icon: Minus,
    className: "bg-muted text-muted-foreground border-border",
    tooltip: "Not enough ratings yet to determine market positioning",
  },
};

export const DealVerdictBadge = ({ avgRating, ratingCount }: DealVerdictBadgeProps) => {
  const verdict = getVerdict(avgRating, ratingCount);
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0.5 gap-1 font-semibold cursor-help ${config.className}`}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] text-xs">
        {config.tooltip}
      </TooltipContent>
    </Tooltip>
  );
};
