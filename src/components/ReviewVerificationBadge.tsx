import { ShieldCheck, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReviewVerificationBadgeProps {
  verificationLevel?: string;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  identityVerified?: boolean;
  compact?: boolean;
}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const ReviewVerificationBadge = ({
  verificationLevel = "none",
  facebookUrl,
  linkedinUrl,
  identityVerified,
  compact = false,
}: ReviewVerificationBadgeProps) => {
  const { t } = useTranslation();

  if (verificationLevel === "none" && !identityVerified) return null;

  const isTransaction = verificationLevel === "transaction";
  const isIdentity = verificationLevel === "identity" || identityVerified;

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-1">
        {/* Transaction Verified (Verified Buyer) — highest tier */}
        {isTransaction && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-trust-excellent/10 text-trust-excellent text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                {!compact && "Verified Buyer"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">This reviewer's transaction has been verified with documentation</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Identity Verified via Social Profile */}
        {isIdentity && !isTransaction && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                {!compact && "Identity Verified"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">This reviewer's identity has been verified via social profile</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Clickable social links */}
        {facebookUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FacebookIcon className="w-2.5 h-2.5 text-[#1877F2]" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">View Facebook Profile</p>
            </TooltipContent>
          </Tooltip>
        )}

        {linkedinUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkedInIcon className="w-2.5 h-2.5 text-[#0A66C2]" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">View LinkedIn Profile</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
