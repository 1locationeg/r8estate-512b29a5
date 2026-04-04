import { useState } from "react";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CopilotOnboardingProps {
  onComplete: (prefs: { purpose: string; budget_range: string; preferred_locations: string[]; concerns: string[] }) => void;
}

const STEPS = [
  {
    key: "purpose",
    title: "What brings you here?",
    subtitle: "Help me understand your goal",
    multi: false,
    options: [
      { label: "🏠 First Home", value: "first_home" },
      { label: "💰 Investment", value: "investment" },
      { label: "🔄 Resale", value: "resale" },
      { label: "🌴 Vacation Home", value: "vacation" },
      { label: "🏢 Commercial", value: "commercial" },
    ],
  },
  {
    key: "budget_range",
    title: "What's your budget?",
    subtitle: "I'll filter everything to match",
    multi: false,
    options: [
      { label: "Under 2M", value: "under_2m" },
      { label: "2M – 5M", value: "2m_5m" },
      { label: "5M – 10M", value: "5m_10m" },
      { label: "10M – 20M", value: "10m_20m" },
      { label: "20M+", value: "20m_plus" },
    ],
  },
  {
    key: "preferred_locations",
    title: "Where are you looking?",
    subtitle: "Select all that interest you",
    multi: true,
    options: [
      { label: "📍 New Cairo", value: "New Cairo" },
      { label: "📍 Sheikh Zayed", value: "Sheikh Zayed" },
      { label: "📍 6th October", value: "6th October" },
      { label: "🏖️ North Coast", value: "North Coast" },
      { label: "🏙️ New Capital", value: "New Capital" },
      { label: "📍 Mostakbal City", value: "Mostakbal City" },
      { label: "📍 New Alamein", value: "New Alamein" },
      { label: "📍 Ain Sokhna", value: "Ain Sokhna" },
    ],
  },
  {
    key: "concerns",
    title: "What concerns you most?",
    subtitle: "I'll keep an eye on these for you",
    multi: true,
    options: [
      { label: "🛡️ Developer Trust", value: "developer_trust" },
      { label: "⏳ Delivery Delays", value: "delivery_delays" },
      { label: "💸 Hidden Fees", value: "hidden_fees" },
      { label: "📄 Contract Terms", value: "contract_terms" },
      { label: "📈 Resale Value", value: "resale_value" },
      { label: "🏗️ Build Quality", value: "build_quality" },
    ],
  },
];

export const CopilotOnboarding = ({ onComplete }: CopilotOnboardingProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({
    purpose: "",
    budget_range: "",
    preferred_locations: [],
    concerns: [],
  });
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];

  const toggleSelection = (value: string) => {
    if (current.multi) {
      const arr = (selections[current.key] as string[]) || [];
      if (arr.includes(value)) {
        setSelections({ ...selections, [current.key]: arr.filter((v) => v !== value) });
      } else {
        setSelections({ ...selections, [current.key]: [...arr, value] });
      }
    } else {
      setSelections({ ...selections, [current.key]: value });
    }
  };

  const isSelected = (value: string) => {
    const sel = selections[current.key];
    if (Array.isArray(sel)) return sel.includes(value);
    return sel === value;
  };

  const canProceed = () => {
    const sel = selections[current.key];
    if (Array.isArray(sel)) return sel.length > 0;
    return !!sel;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setSaving(true);
    try {
      const prefs = {
        purpose: selections.purpose as string,
        budget_range: selections.budget_range as string,
        preferred_locations: selections.preferred_locations as string[],
        concerns: selections.concerns as string[],
      };

      if (user) {
        const { error } = await supabase.from("copilot_preferences").upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        if (error) throw error;
      }

      toast.success("Preferences saved! Generating your briefing...");
      onComplete(prefs);
    } catch (e) {
      console.error("Save prefs error:", e);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 ai-glow relative">
      {/* Agent avatar with glow */}
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center mb-6 ai-float ai-icon-glow ai-shimmer-border">
        <Sparkles className="w-8 h-8 text-primary-foreground relative z-10" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ai-pulse-dot ring-2 ring-background z-10" />
      </div>

      {/* Step title */}
      <h2 className="text-xl font-bold text-foreground mb-1 text-center ai-slide-up" key={`title-${step}`}>
        {current.title}
      </h2>
      <p className="text-sm text-muted-foreground mb-8 text-center ai-slide-up" style={{ animationDelay: "0.1s" }} key={`sub-${step}`}>
        {current.subtitle}
      </p>

      {/* Preference clouds with glow effects */}
      <div className="flex flex-wrap gap-3 justify-center max-w-md mb-8" key={`opts-${step}`}>
        {current.options.map((opt, idx) => (
          <button
            key={opt.value}
            onClick={() => toggleSelection(opt.value)}
            className={`
              relative px-4 py-2.5 rounded-full text-sm font-medium
              transition-all duration-300 ai-scale-in
              ${isSelected(opt.value)
                ? "bg-primary/15 text-primary shadow-[0_0_12px_2px_hsla(var(--glow-primary),0.15)] border border-primary/40 scale-105"
                : "ai-glass border border-border/50 text-foreground hover:border-primary/30 hover:shadow-[0_0_8px_1px_hsla(var(--glow-primary),0.08)]"
              }
            `}
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            {isSelected(opt.value) && (
              <Check className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
            )}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Progress + Next */}
      <div className="flex flex-col items-center gap-4 ai-slide-up" style={{ animationDelay: "0.3s" }}>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || saving}
          className="min-w-[160px] gap-2 shadow-[0_4px_20px_-4px_hsla(var(--glow-primary),0.3)] hover:shadow-[0_4px_24px_-2px_hsla(var(--glow-primary),0.4)] transition-shadow"
        >
          {saving ? "Saving..." : step < STEPS.length - 1 ? "Next" : "Let's Go"}
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Progress dots with glow */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step
                  ? "bg-primary w-6 shadow-[0_0_8px_2px_hsla(var(--glow-primary),0.3)]"
                  : i < step
                  ? "bg-primary/60 w-2"
                  : "bg-muted-foreground/20 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
