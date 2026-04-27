import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Receipt, BadgeCheck, Sparkles, TrendingUp, Trophy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewWithCategories } from "@/hooks/useReviews";
import { cn } from "@/lib/utils";

/**
 * BadgeEarningTrail — chronological audit log of how a developer's badges & milestones
 * were earned. Pure derivation from existing data; no schema changes.
 *
 * Sources:
 *   - business_claims (status='approved', reviewed_at) → "Verified Business" badge
 *   - dbReviews where verified=true → each "Verified Buyer" badge minted
 *   - dbReviews where profileVerified=true → each "Identity-Linked" badge minted
 *   - Review-count milestones (1, 10, 25, 50, 100) → growth trail
 *   - Trust-score tier crossings (Fair → Good → Excellent) using cumulative averages
 */

type TrailEventKind =
  | "business_verified"
  | "verified_buyer"
  | "identity_linked"
  | "review_milestone"
  | "tier_crossed"
  | "first_review";

interface TrailEvent {
  kind: TrailEventKind;
  date: string; // ISO
  title: string;
  detail: string;
  icon: typeof ShieldCheck;
  tone: "excellent" | "good" | "fair" | "neutral";
  estimated?: boolean;
}

interface BadgeEarningTrailProps {
  developerId: string;
  developerVerified: boolean;
  reviews: ReviewWithCategories[];
}

const KIND_TONE: Record<TrailEventKind, TrailEvent["tone"]> = {
  business_verified: "excellent",
  verified_buyer: "excellent",
  identity_linked: "good",
  review_milestone: "good",
  tier_crossed: "excellent",
  first_review: "neutral",
};

const KIND_ICON: Record<TrailEventKind, typeof ShieldCheck> = {
  business_verified: ShieldCheck,
  verified_buyer: Receipt,
  identity_linked: BadgeCheck,
  review_milestone: Trophy,
  tier_crossed: TrendingUp,
  first_review: Sparkles,
};

const TONE_CLASS: Record<TrailEvent["tone"], string> = {
  excellent: "bg-trust-excellent/10 text-trust-excellent border-trust-excellent/30",
  good: "bg-trust-good/10 text-trust-good border-trust-good/30",
  fair: "bg-trust-fair/10 text-trust-fair border-trust-fair/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const MILESTONES = [1, 10, 25, 50, 100];

export const BadgeEarningTrail = ({
  developerId,
  developerVerified,
  reviews,
}: BadgeEarningTrailProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [showAll, setShowAll] = useState(false);
  const [claimDate, setClaimDate] = useState<string | null>(null);

  // Pull the approved claim's reviewed_at timestamp, if one exists for this developer.
  // RLS only lets the claimant see their own row, so this typically returns null for visitors.
  // We still try — when present we get an exact "Verified Business" timestamp.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!developerVerified || !developerId) return;
      try {
        const { data } = await supabase
          .from("business_claims" as any)
          .select("reviewed_at, created_at")
          .eq("business_profile_id", developerId)
          .eq("status", "approved")
          .order("reviewed_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled || !data) return;
        const d = (data as any).reviewed_at || (data as any).created_at;
        if (d) setClaimDate(d);
      } catch {
        /* ignore — visitor without read access */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [developerId, developerVerified]);

  const events: TrailEvent[] = useMemo(() => {
    const list: TrailEvent[] = [];

    // Sort reviews oldest → newest for cumulative computations
    const sorted = [...reviews].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 1. Verified Business
    if (developerVerified) {
      // RLS hides business_claims.reviewed_at from non-claimant viewers, so
      // claimDate will usually be null for visitors. Fall back to a sensible
      // estimate: earliest verified-buyer review (proxy for "trust gate opened"),
      // else the first review date, else today. Mark it so the UI can label it.
      const estimatedFallback =
        sorted.find((r) => r.verified)?.date ||
        sorted[0]?.date ||
        new Date().toISOString();
      const isEstimated = !claimDate;
      list.push({
        kind: "business_verified",
        date: claimDate || estimatedFallback,
        title: t("trail.event.businessVerified.title", "Verified Business badge issued"),
        detail: isEstimated
          ? t(
              "trail.event.businessVerified.detailEstimated",
              "Trade license approved by R8ESTATE moderation. Exact approval date isn't visible to your role — date estimated from the earliest verified activity on file."
            )
          : t(
              "trail.event.businessVerified.detail",
              "Trade license submitted and approved by R8ESTATE moderation."
            ),
        icon: KIND_ICON.business_verified,
        tone: KIND_TONE.business_verified,
        estimated: isEstimated,
      });
    }

    // 2. First review marker
    if (sorted.length > 0) {
      list.push({
        kind: "first_review",
        date: sorted[0].date,
        title: t("trail.event.firstReview.title", "First review received"),
        detail: t("trail.event.firstReview.detail", "{{author}} rated {{rating}}/5 — the trail begins.", {
          author: sorted[0].author,
          rating: sorted[0].rating,
        }),
        icon: KIND_ICON.first_review,
        tone: KIND_TONE.first_review,
      });
    }

    // 3. Per-review badge mintings (verified buyer + identity-linked)
    sorted.forEach((r) => {
      if (r.verified) {
        list.push({
          kind: "verified_buyer",
          date: r.date,
          title: t("trail.event.verifiedBuyer.title", "Verified Buyer review added"),
          detail: t(
            "trail.event.verifiedBuyer.detail",
            "{{author}} uploaded an approved purchase receipt and posted a {{rating}}★ review.",
            { author: r.author, rating: r.rating }
          ),
          icon: KIND_ICON.verified_buyer,
          tone: KIND_TONE.verified_buyer,
        });
      } else if (r.profileVerified) {
        list.push({
          kind: "identity_linked",
          date: r.date,
          title: t("trail.event.identityLinked.title", "Identity-linked review added"),
          detail: t(
            "trail.event.identityLinked.detail",
            "{{author}} linked a verified identity profile and posted a {{rating}}★ review.",
            { author: r.author, rating: r.rating }
          ),
          icon: KIND_ICON.identity_linked,
          tone: KIND_TONE.identity_linked,
        });
      }
    });

    // 4. Review-count milestones
    MILESTONES.forEach((m) => {
      if (sorted.length >= m && m > 1) {
        const r = sorted[m - 1];
        list.push({
          kind: "review_milestone",
          date: r.date,
          title: t("trail.event.milestone.title", "{{count}}-review milestone", { count: m }),
          detail: t(
            "trail.event.milestone.detail",
            "Crossed {{count}} reviews — sample size now {{label}}.",
            {
              count: m,
              label:
                m >= 50
                  ? t("trail.size.strong", "statistically strong")
                  : m >= 10
                  ? t("trail.size.solid", "solid")
                  : t("trail.size.early", "early"),
            }
          ),
          icon: KIND_ICON.review_milestone,
          tone: KIND_TONE.review_milestone,
        });
      }
    });

    // 5. Tier crossings (Fair < 50 ≤ Good < 66 ≤ Excellent) using cumulative star avg → 0-100
    let runningSum = 0;
    let lastTier: "fair" | "good" | "excellent" | null = null;
    sorted.forEach((r, i) => {
      runningSum += r.rating;
      const cumulativeScore = (runningSum / (i + 1) / 5) * 100;
      const tier =
        cumulativeScore >= 66 ? "excellent" : cumulativeScore >= 50 ? "good" : "fair";
      if (lastTier && tier !== lastTier && (tier === "good" || tier === "excellent")) {
        list.push({
          kind: "tier_crossed",
          date: r.date,
          title: t(`trail.event.tier.${tier}.title`, {
            defaultValue:
              tier === "excellent" ? "Reached Excellent trust tier" : "Reached Good trust tier",
          }),
          detail: t("trail.event.tier.detail", {
            score: Math.round(cumulativeScore),
            count: i + 1,
            defaultValue: "Cumulative score crossed {{score}} after {{count}} reviews.",
          }),
          icon: KIND_ICON.tier_crossed,
          tone: tier === "excellent" ? "excellent" : "good",
        });
      }
      lastTier = tier;
    });

    // Newest first for display
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reviews, developerVerified, claimDate, t]);

  if (events.length === 0) {
    return (
      <div className="border border-border rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("trail.empty", "No badges earned yet — the trail will start with the first verified action.")}
        </p>
      </div>
    );
  }

  const visible = showAll ? events : events.slice(0, 5);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold text-foreground">
            {t("trail.title", "Badge & verification trail")}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t(
            "trail.subtitle",
            "Every action that earned a badge or moved the score, with the date it happened."
          )}
        </p>
      </div>

      <ol className={cn("relative px-4 py-4", isRTL ? "pe-6" : "ps-6")}>
        {/* spine */}
        <span
          aria-hidden
          className={cn(
            "absolute top-4 bottom-4 w-px bg-border",
            isRTL ? "right-7" : "left-7"
          )}
        />
        {visible.map((ev, i) => {
          const Icon = ev.icon;
          return (
            <li key={i} className="relative pb-4 last:pb-0">
              <span
                className={cn(
                  "absolute top-0 flex items-center justify-center w-6 h-6 rounded-full border bg-background",
                  TONE_CLASS[ev.tone],
                  isRTL ? "-right-3" : "-left-3"
                )}
              >
                <Icon className="w-3 h-3" />
              </span>
              <div className={cn(isRTL ? "pe-4" : "ps-4")}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground">{ev.title}</p>
                  <time
                    className="text-[11px] font-mono text-muted-foreground tabular-nums inline-flex items-center gap-1"
                    title={
                      ev.estimated
                        ? t(
                            "trail.estimatedTooltip",
                            "Approximate date — exact award timestamp is restricted by privacy rules."
                          )
                        : undefined
                    }
                  >
                    {ev.estimated && (
                      <span className="text-muted-foreground/70" aria-hidden>
                        ~
                      </span>
                    )}
                    {formatDate(ev.date, i18n.language)}
                    {ev.estimated && (
                      <span className="ms-1 px-1 py-px rounded text-[9px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground border border-border">
                        {t("trail.estimatedBadge", "est.")}
                      </span>
                    )}
                  </time>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{ev.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {events.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-full px-4 py-2.5 text-xs font-medium text-primary hover:bg-secondary/50 transition-colors border-t border-border"
        >
          {showAll
            ? t("trail.showLess", "Show less")
            : t("trail.showAll", "Show all {{count}} events", { count: events.length })}
        </button>
      )}
    </div>
  );
};

export default BadgeEarningTrail;