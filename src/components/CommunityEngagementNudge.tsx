import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Gift, Share2, Users, Star, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Engagement nudge cards shown in community feed to motivate
 * sharing, referrals, and deeper platform engagement.
 */
export const CommunityEngagementNudge = ({ variant }: { variant: "referral" | "share" | "review" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const configs = {
    referral: {
      icon: Gift,
      iconColor: "text-primary",
      bgColor: "bg-primary/5 border-primary/15",
      title: t("community.referralNudge", "Invite friends, earn rewards 🎁"),
      desc: t("community.referralNudgeDesc", "Share R8ESTATE with friends and unlock exclusive badges & points"),
      cta: t("community.inviteFriends", "Invite Friends"),
      action: () => navigate("/buyer"),
    },
    share: {
      icon: Share2,
      iconColor: "text-accent-foreground",
      bgColor: "bg-accent/30 border-accent/20",
      title: t("community.shareNudge", "Found this helpful? Share it! 📢"),
      desc: t("community.shareNudgeDesc", "Help other buyers make better decisions by sharing valuable discussions"),
      cta: t("community.shareNow", "Share R8ESTATE"),
      action: async () => {
        try {
          if (navigator.share) {
            await navigator.share({ title: "R8ESTATE Community", url: window.location.href });
          } else {
            await navigator.clipboard.writeText(window.location.href);
          }
        } catch {
          try { await navigator.clipboard.writeText(window.location.href); } catch {}
        }
      },
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
          <Button size="sm" className="mt-2 h-7 text-xs gap-1" onClick={c.action}>
            <Sparkles className="w-3 h-3" />
            {c.cta}
          </Button>
        </div>
      </div>
    </div>
  );
};
