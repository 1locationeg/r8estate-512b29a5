import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Gift, Share2, Star, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/ShareMenu";
import { supabase } from "@/integrations/supabase/client";

type NudgeConfig = {
  icon: typeof Gift;
  iconColor: string;
  bgColor: string;
  title: string;
  desc: string;
  cta: string;
  action?: () => void;
};

/**
 * Engagement nudge cards shown in community feed to motivate
 * sharing, referrals, and deeper platform engagement.
 */
export const CommunityEngagementNudge = ({ variant }: { variant: "referral" | "share" | "review" | "retention" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchWhatsappNumber = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .maybeSingle();

      if (isMounted && data?.value) {
        setWhatsappNumber(data.value);
      }
    };

    void fetchWhatsappNumber();

    return () => {
      isMounted = false;
    };
  }, []);

  if (dismissed) return null;

  const configs: Record<"referral" | "share" | "review" | "retention", NudgeConfig> = {
    referral: {
      icon: Gift,
      iconColor: "text-primary",
      bgColor: "bg-primary/5 border-primary/15",
      title: t("community.referralNudge", "Your contribution makes a difference 🎁"),
      desc: t("community.referralNudgeDesc", "Share your experience and help friends make the right decision"),
      cta: t("referral.cta", "Invite a Friend"),
      action: () => {
        const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
        const shareUrl = window.location.origin;
        const shareText = "Join R8ESTATE — Egypt's most trusted real estate community! 🏠✨";
        const waUrl = cleanNumber
          ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
          : `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

        const popup = window.open(waUrl, "_blank", "noopener,noreferrer");

        if (popup) {
          popup.opener = null;
          return;
        }

        const link = document.createElement("a");
        link.href = waUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    share: {
      icon: Share2,
      iconColor: "text-accent-foreground",
      bgColor: "bg-accent/30 border-accent/20",
      title: t("community.shareNudge", "Found this helpful? Share it! 📢"),
      desc: t("community.shareNudgeDesc", "Help other buyers make better decisions by sharing valuable discussions"),
      cta: t("community.shareNow", "Share R8ESTATE"),
      action: undefined,
    },
    review: {
      icon: Star,
      iconColor: "text-primary",
      bgColor: "bg-primary/5 border-primary/15",
      title: t("community.reviewNudge", "Had a real estate experience? ⭐"),
      desc: t("community.reviewNudgeDesc", "Your review helps thousands of buyers make confident, risk-free decisions"),
      cta: t("community.writeReview", "Write a Review"),
      action: () => navigate("/reviews"),
    },
    retention: {
      icon: Star,
      iconColor: "text-primary",
      bgColor: "bg-primary/5 border-primary/15",
      title: t("retention.reviewNudge", "Ready to share your experience?"),
      desc: t("retention.longFollower", "You've been following for a while — your review matters!"),
      cta: t("retention.writeReview", "Write a Review"),
      action: () => navigate("/reviews"),
    },
  };

  const c = configs[variant];
  const Icon = c.icon;

  return (
    <div className={`relative rounded-lg border p-4 ${c.bgColor} animate-in fade-in slide-in-from-bottom-2`}>
      <button onClick={() => setDismissed(true)} className="absolute top-2 end-2 text-muted-foreground hover:text-foreground">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-background/80 border border-border">
          <Icon className={`w-4 h-4 ${c.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{c.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
          {variant === "share" ? (
            <ShareMenu
              title="R8ESTATE Community"
              description={c.desc}
              label={c.cta}
              variant="default"
              size="sm"
              className="mt-2 h-7 text-xs"
            />
          ) : (
            <Button size="sm" className="mt-2 h-7 text-xs gap-1" onClick={c.action}>
              <Sparkles className="w-3 h-3" />
              {c.cta}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
