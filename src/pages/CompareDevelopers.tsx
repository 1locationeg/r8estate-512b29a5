import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, Trophy, Minus, BadgeCheck, Star, BarChart3, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StationPageWrapper } from "@/components/StationPageWrapper";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { developers as mockDevelopers, reviews as mockReviews } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import {
  calculateTrustScore,
  trustColorClass,
  type TrustScoreBreakdown,
} from "@/lib/trustScoreCalculator";
import type { ReviewWithCategories } from "@/hooks/useReviews";

type DevSummary = {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  trustScore: number;
  verified: boolean;
};

const PILLAR_META = [
  { key: "rating", icon: Star, max: 60 },
  { key: "volume", icon: BarChart3, max: 25 },
  { key: "verification", icon: BadgeCheck, max: 10 },
  { key: "recency", icon: Clock, max: 5 },
] as const;

const fetchReviewsFor = async (devId: string): Promise<ReviewWithCategories[]> => {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("developer_id", devId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const dbReviews: ReviewWithCategories[] = (data || []).map((r: any) => ({
    id: r.id,
    developerId: r.developer_id,
    author: r.author_name || "User",
    profileVerified: r.is_verified,
    tier: "bronze",
    rating: r.rating,
    date: new Date(r.created_at).toISOString().split("T")[0],
    project: r.experience_type || "",
    comment: r.comment || "",
    verified: r.is_verified,
    categoryRatings: r.category_ratings || {},
  }));

  const mocks = mockReviews
    .filter((r) => r.developerId === devId)
    .map((r) => ({ ...r, categoryRatings: undefined } as ReviewWithCategories));

  return [...dbReviews, ...mocks];
};

const useBreakdown = (dev: DevSummary | null) => {
  const [breakdown, setBreakdown] = useState<TrustScoreBreakdown | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!dev) {
      setBreakdown(null);
      return;
    }
    fetchReviewsFor(dev.id).then((reviews) => {
      if (cancelled) return;
      setBreakdown(
        calculateTrustScore(reviews, {
          rating: dev.rating,
          reviewCount: dev.reviewCount,
          trustScore: dev.trustScore,
        })
      );
    });
    return () => {
      cancelled = true;
    };
  }, [dev?.id]);

  return breakdown;
};

const Picker = ({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: DevSummary[];
  placeholder: string;
  onChange: (id: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((d) => (
        <SelectItem key={d.id} value={d.id}>
          {d.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const DevHeader = ({ dev }: { dev: DevSummary | null }) => {
  const { t } = useTranslation();
  if (!dev) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground text-sm py-6">
        {t("compareDevs.empty", "Select a developer")}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center text-center gap-2">
      {dev.logo ? (
        <img
          src={dev.logo}
          alt={dev.name}
          className="w-16 h-16 rounded-full object-cover bg-muted"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-muted" />
      )}
      <Link
        to={`/entity/${dev.id}`}
        className="font-semibold text-foreground hover:underline line-clamp-2"
      >
        {dev.name}
      </Link>
      {dev.verified && (
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <BadgeCheck className="w-3 h-3" />
          {t("compareDevs.verified", "Verified")}
        </Badge>
      )}
    </div>
  );
};

const ScorePanel = ({
  breakdown,
  isWinner,
}: {
  breakdown: TrustScoreBreakdown | null;
  isWinner: boolean;
}) => {
  const { t } = useTranslation();
  if (!breakdown) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        {t("compareDevs.loading", "Loading…")}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-extrabold ${trustColorClass(breakdown.total)}`}>
          {breakdown.total}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
        {isWinner && <Trophy className="w-4 h-4 text-[hsl(45_96%_54%)] ms-1" />}
      </div>
      <span className="text-[11px] text-muted-foreground">
        {t(`trustMethod.confidence.${breakdown.confidence}`, breakdown.confidence)}
      </span>
    </div>
  );
};

const CompareDevelopers = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [searchParams, setSearchParams] = useSearchParams();

  // Pull developer summaries (mock + DB business profiles).
  const [allDevs, setAllDevs] = useState<DevSummary[]>(() =>
    mockDevelopers.map((d) => ({
      id: d.id,
      name: d.name,
      logo: d.logo,
      rating: d.rating,
      reviewCount: d.reviewCount,
      trustScore: d.trustScore,
      verified: d.verified,
    }))
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("business_profiles")
        .select("id, company_name, logo_url")
        .not("company_name", "is", null);
      if (cancelled || !data) return;
      const dbDevs: DevSummary[] = data.map((b: any) => ({
        id: b.id,
        name: b.company_name,
        logo: b.logo_url || undefined,
        rating: 0,
        reviewCount: 0,
        trustScore: 0,
        verified: false,
      }));
      setAllDevs((prev) => {
        const map = new Map(prev.map((d) => [d.id, d]));
        dbDevs.forEach((d) => {
          if (!map.has(d.id)) map.set(d.id, d);
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const aId = searchParams.get("a") || mockDevelopers[0]?.id || "";
  const bId = searchParams.get("b") || mockDevelopers[1]?.id || "";

  const setPair = (slot: "a" | "b", id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(slot, id);
    setSearchParams(next, { replace: true });
  };
  const swap = () => {
    const next = new URLSearchParams(searchParams);
    next.set("a", bId);
    next.set("b", aId);
    setSearchParams(next, { replace: true });
  };

  const devA = useMemo(() => allDevs.find((d) => d.id === aId) || null, [allDevs, aId]);
  const devB = useMemo(() => allDevs.find((d) => d.id === bId) || null, [allDevs, bId]);

  const breakdownA = useBreakdown(devA);
  const breakdownB = useBreakdown(devB);

  const winner: "a" | "b" | "tie" | null = useMemo(() => {
    if (!breakdownA || !breakdownB) return null;
    if (breakdownA.total === breakdownB.total) return "tie";
    return breakdownA.total > breakdownB.total ? "a" : "b";
  }, [breakdownA, breakdownB]);

  const renderPillarRow = (pillarKey: (typeof PILLAR_META)[number]["key"]) => {
    const meta = PILLAR_META.find((p) => p.key === pillarKey)!;
    const Icon = meta.icon;
    const a = breakdownA?.pillars[pillarKey];
    const b = breakdownB?.pillars[pillarKey];
    const aPts = a?.points ?? 0;
    const bPts = b?.points ?? 0;
    const lead =
      !a || !b ? null : Math.abs(aPts - bPts) < 0.05 ? "tie" : aPts > bPts ? "a" : "b";

    return (
      <div key={pillarKey} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 border-b border-border/50 last:border-b-0">
        {/* A */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold ${lead === "a" ? trustColorClass(80) : "text-foreground"}`}>
              {aPts.toFixed(1)}
            </span>
            <span className="text-muted-foreground">/{meta.max}</span>
          </div>
          <Progress value={(aPts / meta.max) * 100} className="h-1.5" />
        </div>

        {/* Label */}
        <div className="flex flex-col items-center gap-1 px-2 min-w-[110px]">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-[11px] font-medium text-foreground text-center leading-tight">
            {t(`trustMethod.pillar.${pillarKey}.label`, pillarKey)}
          </span>
          {lead && lead !== "tie" && (
            <span className="text-[10px] text-muted-foreground">
              +{Math.abs(aPts - bPts).toFixed(1)} {lead === "a" ? "←" : "→"}
            </span>
          )}
          {lead === "tie" && <Minus className="w-3 h-3 text-muted-foreground" />}
        </div>

        {/* B */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">/{meta.max}</span>
            <span className={`font-semibold ${lead === "b" ? trustColorClass(80) : "text-foreground"}`}>
              {bPts.toFixed(1)}
            </span>
          </div>
          <Progress value={(bPts / meta.max) * 100} className="h-1.5" />
        </div>
      </div>
    );
  };

  const verifRow = (label: string, valA: string | number, valB: string | number) => (
    <div className="grid grid-cols-3 items-center text-sm py-2 border-b border-border/40 last:border-b-0">
      <div className="text-foreground font-medium text-start">{valA}</div>
      <div className="text-[11px] text-muted-foreground text-center px-2">{label}</div>
      <div className="text-foreground font-medium text-end">{valB}</div>
    </div>
  );

  return (
    <StationPageWrapper className="min-h-screen bg-background">
      <PageHeader
        title={t("compareDevs.title", "Compare Developers")}
        breadcrumbs={[{ label: t("compareDevs.title", "Compare Developers") }]}
      />

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-[1100px]">
        <p className="text-sm text-muted-foreground mb-4">
          {t(
            "compareDevs.subtitle",
            "Pick any two developers to see their TrustScore, pillar breakdown, and verification differences side-by-side."
          )}
        </p>

        {/* Pickers */}
        <Card className="p-4 md:p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t("compareDevs.devA", "Developer A")}
              </label>
              <Picker
                value={aId}
                options={allDevs.filter((d) => d.id !== bId)}
                placeholder={t("compareDevs.choose", "Choose…")}
                onChange={(v) => setPair("a", v)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={swap}
              className="self-end mb-0.5"
              aria-label={t("compareDevs.swap", "Swap")}
            >
              <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
            </Button>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t("compareDevs.devB", "Developer B")}
              </label>
              <Picker
                value={bId}
                options={allDevs.filter((d) => d.id !== aId)}
                placeholder={t("compareDevs.choose", "Choose…")}
                onChange={(v) => setPair("b", v)}
              />
            </div>
          </div>
        </Card>

        {/* Side-by-side header + score */}
        <Card className="p-5 md:p-6 mb-6">
          <div className="grid grid-cols-3 items-center gap-4 mb-6">
            <DevHeader dev={devA} />
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {t("compareDevs.trustScore", "Trust Score")}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {t("compareDevs.maxScore", "out of 100")}
              </div>
            </div>
            <DevHeader dev={devB} />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <ScorePanel breakdown={breakdownA} isWinner={winner === "a"} />
            <div className="text-center">
              {winner === "tie" ? (
                <Badge variant="outline" className="gap-1">
                  <Minus className="w-3 h-3" /> {t("compareDevs.tie", "Tie")}
                </Badge>
              ) : winner ? (
                <span className="text-[11px] font-medium text-foreground">
                  {t("compareDevs.diff", "Δ")}{" "}
                  {Math.abs((breakdownA?.total || 0) - (breakdownB?.total || 0))}
                </span>
              ) : null}
            </div>
            <ScorePanel breakdown={breakdownB} isWinner={winner === "b"} />
          </div>
        </Card>

        {/* Pillars */}
        <Card className="p-5 md:p-6 mb-6">
          <h2 className="text-base font-semibold mb-4 text-foreground">
            {t("compareDevs.pillarsTitle", "Trust Pillar Breakdown")}
          </h2>
          {PILLAR_META.map((p) => renderPillarRow(p.key))}
        </Card>

        {/* Verification & evidence */}
        <Card className="p-5 md:p-6 mb-6">
          <h2 className="text-base font-semibold mb-3 text-foreground">
            {t("compareDevs.verifTitle", "Verification & Evidence")}
          </h2>
          {verifRow(
            t("compareDevs.reviewCount", "Reviews on file"),
            breakdownA?.pillars.rating.reviewCount ?? "—",
            breakdownB?.pillars.rating.reviewCount ?? "—"
          )}
          {verifRow(
            t("compareDevs.avgRating", "Average rating"),
            breakdownA ? `${breakdownA.pillars.rating.avgRating.toFixed(1)} ★` : "—",
            breakdownB ? `${breakdownB.pillars.rating.avgRating.toFixed(1)} ★` : "—"
          )}
          {verifRow(
            t("compareDevs.verifiedReviews", "Verified reviews"),
            breakdownA
              ? `${breakdownA.pillars.verification.verifiedCount} (${Math.round(
                  breakdownA.pillars.verification.ratio * 100
                )}%)`
              : "—",
            breakdownB
              ? `${breakdownB.pillars.verification.verifiedCount} (${Math.round(
                  breakdownB.pillars.verification.ratio * 100
                )}%)`
              : "—"
          )}
          {verifRow(
            t("compareDevs.recent90", "Reviews in last 90d"),
            breakdownA?.pillars.recency.recentCount ?? "—",
            breakdownB?.pillars.recency.recentCount ?? "—"
          )}
          {verifRow(
            t("compareDevs.confidence", "Data confidence"),
            breakdownA
              ? t(`trustMethod.confidence.${breakdownA.confidence}`, breakdownA.confidence)
              : "—",
            breakdownB
              ? t(`trustMethod.confidence.${breakdownB.confidence}`, breakdownB.confidence)
              : "—"
          )}
          {verifRow(
            t("compareDevs.profileVerified", "Profile verified"),
            devA?.verified ? t("compareDevs.yes", "Yes") : t("compareDevs.no", "No"),
            devB?.verified ? t("compareDevs.yes", "Yes") : t("compareDevs.no", "No")
          )}
        </Card>

        {/* Category breakdown */}
        <Card className="p-5 md:p-6 mb-8">
          <h2 className="text-base font-semibold mb-4 text-foreground">
            {t("compareDevs.categoriesTitle", "Category Ratings")}
          </h2>
          <div className="space-y-3">
            {breakdownA?.categoryScores.map((catA, i) => {
              const catB = breakdownB?.categoryScores[i];
              if (!catB) return null;
              const lead =
                catA.score === catB.score ? "tie" : catA.score > catB.score ? "a" : "b";
              return (
                <div
                  key={catA.key}
                  className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span
                        className={`font-semibold ${
                          lead === "a" ? trustColorClass(80) : "text-foreground"
                        }`}
                      >
                        {catA.score}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        n={catA.sampleSize}
                      </span>
                    </div>
                    <Progress value={catA.score} className="h-1.5" />
                  </div>
                  <div className="text-[11px] text-foreground font-medium text-center min-w-[110px]">
                    {t(catA.labelKey, catA.key)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[10px] text-muted-foreground">
                        n={catB.sampleSize}
                      </span>
                      <span
                        className={`font-semibold ${
                          lead === "b" ? trustColorClass(80) : "text-foreground"
                        }`}
                      >
                        {catB.score}
                      </span>
                    </div>
                    <Progress value={catB.score} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link to="/about-trust-meter">
              {t("compareDevs.methodology", "Read the Trust Meter methodology")}
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </StationPageWrapper>
  );
};

export default CompareDevelopers;