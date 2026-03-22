import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Trophy, Star, ArrowRight } from "lucide-react";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { useAuth } from "@/contexts/AuthContext";

const WELCOME_GIFT_KEY = "r8_welcome_gift_shown";

export function WelcomeGiftOverlay() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `${WELCOME_GIFT_KEY}_${user.id}`;
    if (localStorage.getItem(key)) return;

    // Show after a short delay so dashboard loads first
    const timer = setTimeout(() => {
      setOpen(true);
      setConfetti(true);
      localStorage.setItem(key, "true");
      setTimeout(() => setConfetti(false), 3500);
    }, 1200);

    return () => clearTimeout(timer);
  }, [user]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0">
        <div className="relative">
          <ConfettiCelebration trigger={confetti} duration={3000} particleCount={80} />

          {/* Header gradient */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 text-center text-primary-foreground">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-3">
              <Gift className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {t("welcome.giftTitle", "Welcome Gift! 🎁")}
            </h2>
            <p className="text-sm opacity-90">
              {t("welcome.giftSubtitle", "You've earned 5 bonus points just for joining!")}
            </p>
          </div>

          {/* Points display */}
          <div className="px-6 py-4 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="text-2xl font-bold text-accent">+5</span>
              <span className="text-sm font-medium text-muted-foreground">
                {t("welcome.points", "points")}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t("welcome.giftMessage", "Start exploring, writing reviews, and engaging with the community to earn more points and climb the leaderboard!")}
            </p>

            {/* Quick perks preview */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                <Star className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground">{t("welcome.perkReviews", "Write reviews")}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                <Trophy className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-muted-foreground">{t("welcome.perkLeaderboard", "Climb ranks")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 flex flex-col gap-2">
            <Button
              onClick={() => { setOpen(false); navigate("/leaderboard"); }}
              className="w-full gap-2"
              size="sm"
            >
              <Trophy className="w-4 h-4" />
              {t("welcome.viewLeaderboard", "View Leaderboard")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full text-muted-foreground"
              size="sm"
            >
              {t("welcome.exploreLater", "Explore Later")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
