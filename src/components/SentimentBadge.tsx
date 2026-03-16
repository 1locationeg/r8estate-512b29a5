import { Smile, Frown, Meh, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReviewAnalysis } from "@/hooks/useReviewAnalysis";

interface SentimentBadgeProps {
  analysis: ReviewAnalysis;
  compact?: boolean;
}

const sentimentConfig = {
  positive: { icon: Smile, label: "Positive", className: "bg-trust-excellent/10 text-trust-excellent border-trust-excellent/30" },
  negative: { icon: Frown, label: "Negative", className: "bg-destructive/10 text-destructive border-destructive/30" },
  neutral: { icon: Meh, label: "Neutral", className: "bg-muted text-muted-foreground border-border" },
  mixed: { icon: ArrowLeftRight, label: "Mixed", className: "bg-accent/10 text-accent-foreground border-accent/30" },
};

export const SentimentBadge = ({ analysis, compact = false }: SentimentBadgeProps) => {
  const config = sentimentConfig[analysis.sentiment];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 flex items-center gap-1 cursor-default ${config.className}`}>
            <Icon className="w-3 h-3" />
            {!compact && config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs font-medium mb-1">AI Sentiment: {config.label} ({Math.round(analysis.sentiment_confidence * 100)}%)</p>
          {analysis.themes.length > 0 && (
            <p className="text-xs text-muted-foreground">Themes: {analysis.themes.join(", ")}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{analysis.insight}</p>
        </TooltipContent>
      </Tooltip>

      {analysis.is_suspicious && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-1 cursor-default bg-destructive/10 text-destructive border-destructive/30">
              <AlertTriangle className="w-3 h-3" />
              {!compact && "Flagged"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs font-medium mb-1">⚠️ Suspicious Review (Score: {Math.round(analysis.suspicion_score * 100)}%)</p>
            {analysis.suspicion_reasons?.map((r, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {r}</p>
            ))}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
