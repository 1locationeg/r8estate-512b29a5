import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, Circle, User, Star, Search, Building2, 
  Tag, X, Sparkles, ArrowRight, ChevronDown, ChevronUp 
} from "lucide-react";
import { toast } from "sonner";

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  completed: boolean;
}

export const OnboardingWizard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role, profile } = useAuth();
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setStepsCompleted(data.steps_completed || []);
        setIsDismissed(data.is_dismissed);
      } else {
        // Create onboarding record
        await supabase.from("onboarding_progress").insert({
          user_id: user.id,
          role: role || "buyer",
          steps_completed: [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch onboarding progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const markStep = async (stepId: string) => {
    if (!user || stepsCompleted.includes(stepId)) return;
    const updated = [...stepsCompleted, stepId];
    setStepsCompleted(updated);
    
    await supabase
      .from("onboarding_progress")
      .update({ 
        steps_completed: updated, 
        updated_at: new Date().toISOString(),
        completed_at: updated.length >= steps.length ? new Date().toISOString() : null
      })
      .eq("user_id", user.id);

    if (updated.length >= steps.length) {
      toast.success(t("onboarding.completeToast", "🎉 You're all set."));
    }
  };

  const dismiss = async () => {
    setIsDismissed(true);
    if (!user) return;
    await supabase
      .from("onboarding_progress")
      .update({ is_dismissed: true })
      .eq("user_id", user.id);
  };

  const buyerSteps: OnboardingStep[] = [
    {
      id: "complete_profile",
      label: t("onboarding.buyer.completeProfileLabel", "Complete your profile"),
      description: t("onboarding.buyer.completeProfileDescription", "Add your name and preferences"),
      icon: <User className="w-4 h-4" />,
      action: () => { navigate("/buyer/settings"); markStep("complete_profile"); },
      completed: stepsCompleted.includes("complete_profile") || !!profile?.full_name,
    },
    {
      id: "browse_directory",
      label: t("onboarding.buyer.browseDirectoryLabel", "Explore the directory"),
      description: t("onboarding.buyer.browseDirectoryDescription", "Browse businesses and developers"),
      icon: <Search className="w-4 h-4" />,
      action: () => { navigate("/directory"); markStep("browse_directory"); },
      completed: stepsCompleted.includes("browse_directory"),
    },
    {
      id: "write_review",
      label: t("onboarding.buyer.writeReviewLabel", "Write your first review"),
      description: t("onboarding.buyer.writeReviewDescription", "Share your experience with others"),
      icon: <Star className="w-4 h-4" />,
      action: () => { navigate("/reviews"); markStep("write_review"); },
      completed: stepsCompleted.includes("write_review"),
    },
    {
      id: "join_community",
      label: t("onboarding.buyer.joinCommunityLabel", "Join the community"),
      description: t("onboarding.buyer.joinCommunityDescription", "Ask questions and share tips"),
      icon: <Sparkles className="w-4 h-4" />,
      action: () => { navigate("/community"); markStep("join_community"); },
      completed: stepsCompleted.includes("join_community"),
    },
  ];

  const businessSteps: OnboardingStep[] = [
    {
      id: "complete_profile",
      label: t("onboarding.business.completeProfileLabel", "Set up your business profile"),
      description: t("onboarding.business.completeProfileDescription", "Add your company details and logo"),
      icon: <Building2 className="w-4 h-4" />,
      action: () => { navigate("/business/profile"); markStep("complete_profile"); },
      completed: stepsCompleted.includes("complete_profile"),
    },
    {
      id: "add_project",
      label: t("onboarding.business.addProjectLabel", "Add your first project"),
      description: t("onboarding.business.addProjectDescription", "Show buyers what you are building"),
      icon: <Building2 className="w-4 h-4" />,
      action: () => { navigate("/business/projects"); markStep("add_project"); },
      completed: stepsCompleted.includes("add_project"),
    },
    {
      id: "submit_deal",
      label: t("onboarding.business.submitDealLabel", "Submit a deal"),
      description: t("onboarding.business.submitDealDescription", "Post an offer for buyers to compare"),
      icon: <Tag className="w-4 h-4" />,
      action: () => { navigate("/business/submit-deal"); markStep("submit_deal"); },
      completed: stepsCompleted.includes("submit_deal"),
    },
    {
      id: "request_review",
      label: t("onboarding.business.requestReviewLabel", "Request a review"),
      description: t("onboarding.business.requestReviewDescription", "Invite buyers to review your business"),
      icon: <Star className="w-4 h-4" />,
      action: () => { navigate("/business/request-review"); markStep("request_review"); },
      completed: stepsCompleted.includes("request_review"),
    },
  ];

  const steps = role === "business" ? businessSteps : buyerSteps;
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  if (!user || loading || isDismissed || completedCount >= steps.length) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-sm text-foreground">
              {t("onboarding.title", "Getting Started")}
            </h3>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{steps.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={dismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2 mb-3" />

        {/* Steps */}
        {!isCollapsed && (
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={step.action}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                  step.completed
                    ? "bg-verified/10 border border-verified/20"
                    : "bg-background/60 border border-border hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-verified flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
                {!step.completed && <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
