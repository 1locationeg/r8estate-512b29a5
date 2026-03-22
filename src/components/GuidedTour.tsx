import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Search,
  Star,
  Shield,
  Building2,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from "lucide-react";

const TOUR_SEEN_KEY = "r8_guided_tour_seen";

interface TourStep {
  icon: React.ReactNode;
  titleKey: string;
  titleFallback: string;
  descKey: string;
  descFallback: string;
}

const tourSteps: TourStep[] = [
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    titleKey: "tour.welcome.title",
    titleFallback: "Welcome to R8ESTATE!",
    descKey: "tour.welcome.desc",
    descFallback:
      "Your trusted platform for real estate reviews and insights. Let us show you around in 30 seconds.",
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    titleKey: "tour.search.title",
    titleFallback: "Search & Explore",
    descKey: "tour.search.desc",
    descFallback:
      "Search developers, projects, and locations. Browse categories to find exactly what you need.",
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    titleKey: "tour.reviews.title",
    titleFallback: "Read & Write Reviews",
    descKey: "tour.reviews.desc",
    descFallback:
      "See real buyer experiences and trust scores. Sign up to write your own reviews and earn points.",
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    titleKey: "tour.trust.title",
    titleFallback: "Trust Scores & Insights",
    descKey: "tour.trust.desc",
    descFallback:
      "Every developer has a trust score based on verified reviews. Compare developers side by side.",
  },
  {
    icon: <Building2 className="h-8 w-8 text-primary" />,
    titleKey: "tour.business.title",
    titleFallback: "For Businesses",
    descKey: "tour.business.desc",
    descFallback:
      "Claim your business profile, respond to reviews, and showcase your projects to thousands of buyers.",
  },
  {
    icon: <User className="h-8 w-8 text-primary" />,
    titleKey: "tour.signup.title",
    titleFallback: "Join & Earn Rewards",
    descKey: "tour.signup.desc",
    descFallback:
      "Create a free account to save favorites, track developers, write reviews, and earn gamification points!",
  },
];

export function GuidedTour() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(TOUR_SEEN_KEY, "true");
  }, []);

  const next = useCallback(() => {
    if (step < tourSteps.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const handleSignUp = useCallback(() => {
    dismiss();
    navigate("/auth");
  }, [dismiss, navigate]);

  if (!visible) return null;

  const current = tourSteps[step];
  const isLast = step === tourSteps.length - 1;
  const progress = ((step + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl animate-scale-in overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 end-3 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {current.icon}
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">
            {t(current.titleKey, current.titleFallback)}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            {t(current.descKey, current.descFallback)}
          </p>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === step
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("tour.prev", "Back")}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={dismiss}>
                {t("tour.skip", "Skip")}
              </Button>

              {isLast ? (
                <Button size="sm" onClick={handleSignUp} className="gap-1">
                  {t("tour.getStarted", "Get Started")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={next} className="gap-1">
                  {t("tour.next", "Next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step counter */}
        <div className="pb-3 text-center text-xs text-muted-foreground">
          {step + 1} / {tourSteps.length}
        </div>
      </div>
    </div>
  );
}
