import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ShieldCheck, BadgeCheck, UserCheck, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewWithCategories } from "@/hooks/useReviews";

interface VerificationLegendProps {
  developerVerified: boolean;
  reviews: ReviewWithCategories[];
}

export const VerificationLegend = ({
  developerVerified,
  reviews,
}: VerificationLegendProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const verifiedBuyerCount = reviews.filter((r) => r.verified).length;
  const identityCount = reviews.filter((r) => r.profileVerified).length;

  const items = [
    {
      icon: <ShieldCheck className="w-4 h-4" />,
      title: t("trustMethod.legend.verifiedBusiness.title", "Verified Business"),
      criterion: t(
        "trustMethod.legend.verifiedBusiness.criterion",
        "Owner submitted a trade license and an admin approved the claim."
      ),
      status: developerVerified
        ? t("trustMethod.legend.statusEarned", "Earned")
        : t("trustMethod.legend.statusNotYet", "Not yet"),
      earned: developerVerified,
    },
    {
      icon: <Receipt className="w-4 h-4" />,
      title: t("trustMethod.legend.verifiedBuyer.title", "Verified Buyer"),
      criterion: t(
        "trustMethod.legend.verifiedBuyer.criterion",
        "Reviewer uploaded an approved purchase receipt for this developer."
      ),
      status: t("trustMethod.legend.countOnReviews", {
        count: verifiedBuyerCount,
        defaultValue: "{{count}} on this profile",
      }),
      earned: verifiedBuyerCount > 0,
    },
    {
      icon: <BadgeCheck className="w-4 h-4" />,
      title: t("trustMethod.legend.identity.title", "Identity-Linked Reviewer"),
      criterion: t(
        "trustMethod.legend.identity.criterion",
        "Reviewer linked a verified Facebook or LinkedIn profile."
      ),
      status: t("trustMethod.legend.countOnReviews", {
        count: identityCount,
        defaultValue: "{{count}} on this profile",
      }),
      earned: identityCount > 0,
    },
    {
      icon: <UserCheck className="w-4 h-4" />,
      title: t("trustMethod.legend.kyc.title", "KYC-Verified Reviewer"),
      criterion: t(
        "trustMethod.legend.kyc.criterion",
        "Reviewer completed full KYC (national ID + selfie) reviewed by an admin."
      ),
      status: t("trustMethod.legend.kyc.statusHelp", "Visible per-review on each card"),
      earned: false,
    },
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground">
          {t("trustMethod.legend.title", "How verifications are earned")}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul className="divide-y divide-border">
          {items.map((item, i) => (
            <li key={i} className="px-4 py-3 flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 shrink-0 p-1.5 rounded-md",
                  item.earned
                    ? "bg-trust-excellent/10 text-trust-excellent"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full shrink-0 font-semibold",
                      item.earned
                        ? "bg-trust-excellent/10 text-trust-excellent"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">
                  {item.criterion}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};