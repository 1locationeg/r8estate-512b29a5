import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CopilotOnboarding } from "@/components/CopilotOnboarding";
import { CopilotBriefingDashboard } from "@/components/CopilotBriefingDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Preferences {
  purpose: string;
  budget_range: string;
  preferred_locations: string[];
  concerns: string[];
}

interface RiskFlag {
  business: string;
  business_id: string;
  risk: "High" | "Medium" | "Low";
  reason: string;
  delta: number;
  current_avg: number | null;
  prior_avg: number | null;
}

const RISK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trust-risk-scan`;

const INIT_STEPS = [
  "Learning your preferences...",
  "Scanning market data...",
  "Building your profile...",
  "Connecting to trust network...",
  "Ready!",
];

const AgentInitScreen = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < INIT_STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center ai-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 ai-breathe">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <p className="text-lg font-bold text-foreground mb-6">Agent Initializing</p>
        <div className="space-y-2 max-w-xs mx-auto text-left">
          {INIT_STEPS.map((label, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                i < step ? "text-primary" : i === step ? "text-foreground" : "text-muted-foreground/30"
              }`}
            >
              {i < step ? (
                <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">✓</span>
              ) : i === step ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-border" />
              )}
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CopilotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from("copilot_preferences")
        .select("purpose, budget_range, preferred_locations, concerns")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.purpose) setPreferences(data as Preferences);
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!user || !preferences) return;
    const runScan = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        const resp = await fetch(RISK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({}),
        });
        const data = await resp.json();
        if (data.risk_flags?.length) {
          setRiskFlags(data.risk_flags);
          data.risk_flags.forEach((flag: RiskFlag) => {
            const icon = flag.delta < 0 ? "⚠️" : "📈";
            toast(`${icon} ${flag.business} — ${Math.abs(flag.delta)}% ${flag.delta < 0 ? "drop" : "rise"}`, {
              description: flag.reason,
              duration: 6000,
            });
          });
        }
      } catch (e) {
        console.error("Risk scan failed:", e);
      }
    };
    runScan();
  }, [user, preferences]);

  const handleOnboardingComplete = (prefs: Preferences) => {
    setPreferences(prefs);
    setEditMode(false);
    setInitializing(true);
  };

  const handleInitDone = () => setInitializing(false);

  const showOnboarding = !loading && user && (!preferences || editMode) && !initializing;
  const showDashboard = !loading && user && preferences && !editMode && !initializing;
  const showInit = !loading && user && initializing;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userMode="buyers" onSwitchToBusinessView={() => {}} onSwitchToBuyerView={() => {}} togglePulse={false} onSignOut={() => {}} getDashboardRoute={() => user ? "/buyer" : "/auth"} />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 ai-glow relative">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <div className="absolute inset-0 w-6 h-6 rounded-full shadow-[0_0_16px_4px_hsla(var(--glow-primary),0.15)]" />
            </div>
          </div>
        )}

        {!loading && !user && (
          <div className="text-center py-20 ai-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 ai-float ai-icon-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Sign in to activate your personal R8 Agent</p>
            <button onClick={() => navigate("/auth")} className="text-primary font-medium hover:underline">Sign In →</button>
          </div>
        )}

        {showOnboarding && (
          <CopilotOnboarding onComplete={handleOnboardingComplete} />
        )}

        {showDashboard && (
          <CopilotBriefingDashboard
            preferences={preferences}
            riskFlags={riskFlags}
            onEditPreferences={() => setEditMode(true)}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CopilotPage;
