import { ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVerifiedBuyer } from "@/hooks/useVerifiedBuyer";

interface VerifiedBuyerBadgeProps {
  userId: string | undefined | null;
  compact?: boolean;
}

/**
 * Shows a "Verified Buyer" badge next to a user's name
 * if they have an approved receipt submission.
 */
export const VerifiedBuyerBadge = ({ userId, compact = false }: VerifiedBuyerBadgeProps) => {
  const { isVerified, isLoading } = useVerifiedBuyer(userId);

  if (isLoading || !isVerified) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-trust-excellent/10 text-trust-excellent text-[10px] font-semibold">
            <ShieldCheck className="w-3 h-3" />
            {!compact && "Verified Buyer"}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">This user's purchase has been verified with documentation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
