import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ScanSearch, ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle, ArrowRight, Sparkles, Loader2, FileCheck2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { fireCorridorEngage } from "@/lib/corridorEvents";
import { useTruthCheckSettings } from "@/hooks/useTruthCheckSettings";
import { useAuth } from "@/contexts/AuthContext";

export type TruthCheckVerdict =
  | "backed_by_buyers"
  | "mixed_signals"
  | "contradicted_by_buyers"
  | "insufficient_evidence";

interface TruthCheckResult {
  verdict: TruthCheckVerdict;
  headline: string;
  evidence: Array<{ review_id: string; snippet: string }>;
  stats: {
    reviewCount: number;
    verifiedPct: number | null;
    contractVerifiedCount: number;
    trustScore: number | null;
  };
  lang: "ar" | "en";
}

interface TruthCheckHeroProps {
  developerId?: string;
  developerName?: string;
  initialClaim?: string;
  variant?: "hero" | "compact";
  className?: string;
}

const verdictMeta: Record<
  TruthCheckVerdict,
  { tone: string; icon: typeof ShieldCheck; pillClass: string; ringClass: string }
> = {
  backed_by_buyers: {
    tone: "good",
    icon: ShieldCheck,
    pillClass:
      "bg-trust-excellent/15 text-trust-excellent border-trust-excellent/40",
    ringClass: "ring-trust-excellent/30",
  },
  mixed_signals: {
    tone: "warn",
    icon: AlertTriangle,
    pillClass: "bg-amber-500/15 text-amber-600 border-amber-500/40 dark:text-amber-400",
    ringClass: "ring-amber-500/30",
  },
  contradicted_by_buyers: {
    tone: "bad",
    icon: ShieldAlert,
    pillClass: "bg-destructive/15 text-destructive border-destructive/40",
    ringClass: "ring-destructive/30",
  },
  insufficient_evidence: {
    tone: "neutral",
    icon: HelpCircle,
    pillClass: "bg-muted text-muted-foreground border-border",
    ringClass: "ring-border",
  },
};

export const TruthCheckHero = ({
  developerId,
  developerName,
  initialClaim,
  variant = "hero",
  className,
}: TruthCheckHeroProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useTruthCheckSettings();
  const { user } = useAuth();

  const [claim, setClaim] = useState(initialClaim ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TruthCheckResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const lang: "ar" | "en" = i18n.language?.startsWith("ar") ? "ar" : "en";

  const examples = useMemo(
    () => settings.exampleClaims,
    [settings.exampleClaims],
  );

  const minChars = Math.max(1, settings.minClaimChars || 8);

  const submit = async (claimText: string) => {
    const trimmed = claimText.trim();
    if (trimmed.length < 8) {
      toast({
        title: t("truthCheck.tooShort", "Paste a longer claim"),
        description: t(
          "truthCheck.tooShortDesc",
          "Add at least 8 characters from the developer's marketing copy.",
        ),
      });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("truth-check", {
        body: {
          claim: trimmed,
          developer_id: developerId ?? null,
          lang,
        },
      });

      if (controller.signal.aborted) return;

      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 429) {
          toast({
            title: t("truthCheck.rateLimited", "Slow down a sec"),
            description: t(
              "truthCheck.rateLimitedDesc",
              "You're sending checks too fast. Try again in a few seconds.",
            ),
            variant: "destructive",
          });
          return;
        }
        if (status === 402) {
          toast({
            title: t("truthCheck.outOfCredits", "AI credits exhausted"),
            description: t(
              "truthCheck.outOfCreditsDesc",
              "Please top up Lovable AI credits in workspace settings.",
            ),
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (!data || typeof data !== "object" || !("verdict" in data)) {
        throw new Error("Malformed response");
      }

      setResult(data as TruthCheckResult);
      fireCorridorEngage(2, "truth_check");
    } catch (e) {
      if (controller.signal.aborted) return;
      console.error("truth-check failed", e);
      toast({
        title: t("truthCheck.failed", "Couldn't run Truth-Check"),
        description: t(
          "truthCheck.failedDesc",
          "Something went wrong on our side. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const verdictKey = result ? `truthCheck.verdict.${result.verdict}` : null;
  const meta = result ? verdictMeta[result.verdict] : null;
  const VerdictIcon = meta?.icon ?? ShieldCheck;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5",
        "shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.18)]",
        variant === "hero" ? "p-4 md:p-6" : "p-3 md:p-4",
        className,
      )}
    >
      {/* Decorative gold corner */}
      <div className="pointer-events-none absolute -top-12 -end-12 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ScanSearch className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">
                {t("truthCheck.title", "Truth-Check a marketing claim")}
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 border-accent/50 bg-accent/10 text-accent-foreground"
              >
                <Sparkles className="w-2.5 h-2.5 me-1" />
                {t("truthCheck.aiBadge", "AI · Verified buyers")}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-snug">
              {developerName
                ? t("truthCheck.subtitleDev", {
                    defaultValue: "Paste any claim about {{name}} and we'll check it against verified buyer reviews.",
                    name: developerName,
                  })
                : t(
                    "truthCheck.subtitle",
                    "Paste a brochure claim. We check it against verified buyer reviews — instantly.",
                  )}
            </p>
          </div>
        </div>

        <Textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value.slice(0, 500))}
          placeholder={t(
            "truthCheck.placeholder",
            "e.g. \"Delivery in 2026, 100% on schedule, 12% ROI\"",
          )}
          rows={3}
          className="resize-none bg-background/80 border-border/60 focus-visible:ring-primary/30 text-sm"
          maxLength={500}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-medium me-1">
              {t("truthCheck.tryExample", "Try:")}
            </span>
            {examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setClaim(ex);
                  submit(ex);
                }}
                disabled={loading}
                className="text-[10px] md:text-[11px] px-2 py-1 rounded-full border border-border/60 bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition text-foreground/80 truncate max-w-[180px] md:max-w-[260px]"
                title={ex}
              >
                {ex.length > 36 ? ex.slice(0, 34) + "…" : ex}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => submit(claim)}
            disabled={loading || claim.trim().length < 8}
            className="gap-2 min-h-[36px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("truthCheck.checking", "Checking…")}
              </>
            ) : (
              <>
                <ScanSearch className="w-3.5 h-3.5" />
                {t("truthCheck.cta", "Truth-Check")}
              </>
            )}
          </Button>
        </div>

        {/* Result block */}
        {loading && !result && (
          <div className="mt-4 space-y-2 animate-pulse">
            <div className="h-8 rounded-lg bg-muted/60 w-2/3" />
            <div className="h-4 rounded-md bg-muted/40 w-full" />
            <div className="h-4 rounded-md bg-muted/40 w-5/6" />
          </div>
        )}

        {result && meta && verdictKey && (
          <div className={cn("mt-4 rounded-xl border bg-background/70 p-3 md:p-4 ring-1", meta.ringClass)}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={cn(
                  "h-6 px-2 text-[11px] font-bold gap-1.5 inline-flex items-center",
                  meta.pillClass,
                )}
              >
                <VerdictIcon className="w-3 h-3" />
                {t(verdictKey, defaultVerdictLabel(result.verdict, lang))}
              </Badge>
              {result.stats.contractVerifiedCount > 0 && (
                <Badge
                  variant="outline"
                  className="h-6 px-2 text-[10px] gap-1 border-accent/50 bg-accent/5 text-accent-foreground"
                >
                  <FileCheck2 className="w-3 h-3 text-accent" />
                  {t("truthCheck.contractCount", {
                    defaultValue: "{{n}} contract-verified buyers",
                    n: result.stats.contractVerifiedCount,
                  })}
                </Badge>
              )}
              {result.stats.trustScore !== null && (
                <span className="text-[10px] text-muted-foreground">
                  {t("truthCheck.trustScore", "Trust Score")}:{" "}
                  <span className="font-semibold text-foreground">{result.stats.trustScore}</span>
                  /100
                </span>
              )}
            </div>

            {result.headline && (
              <p className="text-sm md:text-[15px] font-medium text-foreground leading-snug mb-2">
                {result.headline}
              </p>
            )}

            {result.evidence.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {result.evidence.map((ev, i) => {
                  const clickable = ev.review_id.length > 0 && developerId;
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs md:text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                      {clickable ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/reviews?developer=${developerId}&highlight=${ev.review_id}`)
                          }
                          className="text-start text-foreground/90 hover:text-primary transition leading-snug"
                        >
                          {ev.snippet}
                        </button>
                      ) : (
                        <span className="text-foreground/90 leading-snug">{ev.snippet}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {developerId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/entity/${developerId}`)}
                className="h-8 px-2 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/5"
              >
                {t("truthCheck.viewReport", "See full trust report")}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Button>
            )}

            <p className="mt-2 text-[10px] text-muted-foreground/80 leading-snug">
              {t(
                "truthCheck.disclaimer",
                "Grounded in approved reviews and contract receipts. AI summaries — always verify before signing.",
              )}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

function defaultVerdictLabel(v: TruthCheckVerdict, lang: "ar" | "en") {
  if (lang === "ar") {
    switch (v) {
      case "backed_by_buyers":
        return "✅ المشترين بيأكدوا";
      case "mixed_signals":
        return "⚠️ إشارات متضاربة";
      case "contradicted_by_buyers":
        return "❌ المشترين بينفوا";
      case "insufficient_evidence":
        return "ℹ️ مفيش دليل كافي";
    }
  }
  switch (v) {
    case "backed_by_buyers":
      return "✅ Backed by buyers";
    case "mixed_signals":
      return "⚠️ Mixed signals";
    case "contradicted_by_buyers":
      return "❌ Contradicted by buyers";
    case "insufficient_evidence":
      return "ℹ️ Not enough evidence";
  }
}

export default TruthCheckHero;