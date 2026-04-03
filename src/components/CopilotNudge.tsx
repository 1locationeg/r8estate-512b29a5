import { useState } from "react";
import { X, Sparkles } from "lucide-react";

interface CopilotNudgeProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const CopilotNudge = ({ message, actionLabel, onAction }: CopilotNudgeProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="flex-1 text-foreground/80 text-xs">{message}</span>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-xs font-semibold text-primary hover:underline shrink-0">
          {actionLabel}
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground shrink-0">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
