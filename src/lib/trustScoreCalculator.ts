import type { ReviewWithCategories } from "@/hooks/useReviews";

/**
 * TrustScore Calculator — single source of truth for the developer detail page.
 *
 * Formula (max 100):
 *   ratingScore        = (avgRating / 5) * 60          // 60 pts — what reviewers say
 *   volumeScore        = log10(n+1)/log10(100) * 25    // 25 pts — sample size, full at 100 reviews
 *   verificationBoost  = verifiedRatio * 10            // 10 pts — % of verified reviews
 *   recencyAdjustment  = recentRatio * 5               //  5 pts — share of reviews in last 90d
 *
 * If there are zero real reviews, we fall back to the seed `trustScore` (mock data)
 * so the visual stays meaningful, but the breakdown is flagged as "estimated".
 */

// 4 canonical category keys actually written to reviews.category_ratings (JSONB)
// (matches getCategoryMetricKeys('developers') in WriteReviewModal + ItemDetailSection)
export const DEVELOPER_CATEGORY_KEYS = [
  "delivery",
  "quality",
  "financial",
  "support",
] as const;

export type DeveloperCategoryKey = (typeof DEVELOPER_CATEGORY_KEYS)[number];

// Map each stored key to a human-friendly i18n label key in the existing `trust.*` namespace.
export const DEVELOPER_CATEGORY_LABEL_KEY: Record<DeveloperCategoryKey, string> = {
  delivery: "trust.projectTimeliness",
  quality: "trust.constructionQuality",
  financial: "trust.valueForMoney",
  support: "trust.customerService",
};

export interface PillarBreakdown {
  points: number;
  max: number;
}

export interface CategoryBreakdown {
  key: DeveloperCategoryKey;
  labelKey: string;
  score: number; // 0-100
  source: "reviews" | "estimated";
  sampleSize: number;
}

export interface TrustScoreBreakdown {
  total: number; // 0-100
  isEstimated: boolean;
  confidence: "low" | "medium" | "high";
  pillars: {
    rating: PillarBreakdown & { avgRating: number; reviewCount: number };
    volume: PillarBreakdown & { reviewCount: number };
    verification: PillarBreakdown & { verifiedCount: number; ratio: number };
    recency: PillarBreakdown & { recentCount: number };
  };
  categoryScores: CategoryBreakdown[];
}

export interface TrustScoreFallback {
  rating: number;
  reviewCount: number;
  trustScore: number;
}

const RATING_MAX = 60;
const VOLUME_MAX = 25;
const VERIFICATION_MAX = 10;
const RECENCY_MAX = 5;
const VOLUME_FULL_AT = 100; // 100 real reviews = full volume credit
const RECENCY_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function computeConfidence(reviewCount: number): "low" | "medium" | "high" {
  if (reviewCount < 5) return "low";
  if (reviewCount < 20) return "medium";
  return "high";
}

/**
 * Compute the trust score and full breakdown.
 * Pure function — safe to call inside useMemo.
 */
export function calculateTrustScore(
  reviews: ReviewWithCategories[],
  fallback: TrustScoreFallback
): TrustScoreBreakdown {
  const realReviews = reviews ?? [];
  const hasRealData = realReviews.length > 0;

  // ---- Pillar inputs ----
  const reviewCount = hasRealData ? realReviews.length : fallback.reviewCount || 0;
  const avgRating = hasRealData
    ? realReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / realReviews.length
    : fallback.rating || 0;

  const verifiedCount = hasRealData
    ? realReviews.filter((r) => r.verified || r.profileVerified).length
    : 0;
  const verifiedRatio = hasRealData ? verifiedCount / realReviews.length : 0;

  const now = Date.now();
  const recentCount = hasRealData
    ? realReviews.filter((r) => {
        const t = new Date(r.date).getTime();
        return !Number.isNaN(t) && now - t <= RECENCY_WINDOW_MS;
      }).length
    : 0;
  const recentRatio = hasRealData ? recentCount / realReviews.length : 0;

  // ---- Pillar points ----
  const ratingPoints = clamp((avgRating / 5) * RATING_MAX, 0, RATING_MAX);
  const volumePoints = clamp(
    (Math.log10(reviewCount + 1) / Math.log10(VOLUME_FULL_AT + 1)) * VOLUME_MAX,
    0,
    VOLUME_MAX
  );
  const verificationPoints = clamp(verifiedRatio * VERIFICATION_MAX, 0, VERIFICATION_MAX);
  const recencyPoints = clamp(recentRatio * RECENCY_MAX, 0, RECENCY_MAX);

  let total = Math.round(ratingPoints + volumePoints + verificationPoints + recencyPoints);

  // If there's no real data at all, anchor the gauge to the seed score so the page
  // doesn't look broken for static developers, but flag the whole thing as estimated.
  if (!hasRealData && fallback.trustScore > 0) {
    total = clamp(Math.round(fallback.trustScore));
  }

  // ---- Category breakdown ----
  const categoryScores: CategoryBreakdown[] = DEVELOPER_CATEGORY_KEYS.map((key) => {
    const reviewsWithKey = realReviews.filter(
      (r) =>
        r.categoryRatings &&
        typeof r.categoryRatings[key] === "number" &&
        r.categoryRatings[key] > 0
    );
    if (reviewsWithKey.length > 0) {
      const avg =
        reviewsWithKey.reduce((sum, r) => sum + (r.categoryRatings![key] || 0), 0) /
        reviewsWithKey.length;
      return {
        key,
        labelKey: DEVELOPER_CATEGORY_LABEL_KEY[key],
        score: clamp(Math.round((avg / 5) * 100)),
        source: "reviews",
        sampleSize: reviewsWithKey.length,
      };
    }
    // Fallback: derive from the displayed total with deterministic mild variance per key
    // so estimated bars are visually distinct but not wildly off.
    const variance: Record<DeveloperCategoryKey, number> = {
      delivery: -2,
      quality: 1,
      financial: -1,
      support: -3,
    };
    return {
      key,
      labelKey: DEVELOPER_CATEGORY_LABEL_KEY[key],
      score: clamp(total + variance[key]),
      source: "estimated",
      sampleSize: 0,
    };
  });

  return {
    total,
    isEstimated: !hasRealData,
    confidence: computeConfidence(reviewCount),
    pillars: {
      rating: {
        points: Math.round(ratingPoints * 10) / 10,
        max: RATING_MAX,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
      },
      volume: {
        points: Math.round(volumePoints * 10) / 10,
        max: VOLUME_MAX,
        reviewCount,
      },
      verification: {
        points: Math.round(verificationPoints * 10) / 10,
        max: VERIFICATION_MAX,
        verifiedCount,
        ratio: Math.round(verifiedRatio * 100) / 100,
      },
      recency: {
        points: Math.round(recencyPoints * 10) / 10,
        max: RECENCY_MAX,
        recentCount,
      },
    },
    categoryScores,
  };
}

/** Color helper shared with the gauge & bars. */
export function trustColorClass(score: number): string {
  if (score >= 66) return "text-trust-excellent";
  if (score >= 50) return "text-trust-good";
  return "text-trust-fair";
}

export function trustBgClass(score: number): string {
  if (score >= 66) return "bg-trust-excellent";
  if (score >= 50) return "bg-trust-good";
  return "bg-trust-fair";
}

export function trustStrokeClass(score: number): string {
  if (score >= 66) return "stroke-trust-excellent";
  if (score >= 50) return "stroke-trust-good";
  return "stroke-trust-fair";
}