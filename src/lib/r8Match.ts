import { developers, projects, type Developer, type Project } from "@/data/mockData";

export interface MatchBrief {
  budgetMinM: number;       // EGP millions
  budgetMaxM: number;       // EGP millions
  areas: string[];          // location names
  unitType: string;         // "any" | "Studio" | "1BR" | "2BR" | "3BR+" | "Villa" | "Townhouse"
  timeline: string;         // "any" | "2026" | "2027" | "2028+"
  priority: "trust" | "price" | "delivery" | "amenities";
}

export interface MatchedProject {
  project: Project;
  developer: Developer;
  score: number;            // 0–100
  reasons: string[];        // 2–3 short reasons
  trustPct: number;
  meterPct: number;         // synthetic "R8 Meter" score (project quality)
  deliveryPct: number;      // on-time delivery %
}

/** Parse "EGP 3M - 15M" → { min: 3, max: 15 } */
function parsePriceRange(range: string): { min: number; max: number } {
  const m = range.match(/(\d+(?:\.\d+)?)\s*M\s*-\s*(\d+(?:\.\d+)?)\s*M/i);
  if (!m) return { min: 0, max: 999 };
  return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
}

/** Synthetic R8 Meter score per project (deterministic from id) */
function r8MeterScore(p: Project, dev: Developer): number {
  const base = dev.trustScore;
  const completionBonus = p.status === "Completed" || p.status === "Occupied" ? 4 : 0;
  const constructionBonus = p.status === "Under Construction" ? 2 : 0;
  return Math.min(100, Math.round(base * 0.85 + completionBonus + constructionBonus + (dev.sentimentScore ?? 7)));
}

/** % on-time delivery — deterministic synthetic value */
function deliveryRate(dev: Developer): number {
  // Use trust score as proxy + small per-developer modifier
  const seed = dev.id.length;
  return Math.min(99, Math.round(60 + (dev.trustScore - 80) * 1.2 + (seed % 7)));
}

/** Extract completion year from "2026-Q4" → 2026 */
function completionYear(p: Project): number {
  const m = p.expectedCompletion.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : 9999;
}

export function runR8Match(brief: MatchBrief): MatchedProject[] {
  const filtered = projects.filter((p) => {
    const { min, max } = parsePriceRange(p.priceRange);
    // Overlap check between buyer budget and project price range
    const overlapsBudget = max >= brief.budgetMinM && min <= brief.budgetMaxM;
    if (!overlapsBudget) return false;

    if (brief.areas.length > 0 && !brief.areas.some((a) => p.location.toLowerCase().includes(a.toLowerCase()))) {
      return false;
    }

    if (brief.unitType !== "any" && !p.unitTypes.includes(brief.unitType)) return false;

    if (brief.timeline !== "any") {
      const y = completionYear(p);
      if (brief.timeline === "2026" && y > 2026) return false;
      if (brief.timeline === "2027" && y > 2027) return false;
      if (brief.timeline === "2028+" && y < 2028) return false;
    }

    return true;
  });

  const priorityWeights: Record<MatchBrief["priority"], { trust: number; meter: number; reviews: number; delivery: number }> = {
    trust:      { trust: 0.50, meter: 0.20, reviews: 0.15, delivery: 0.15 },
    price:      { trust: 0.35, meter: 0.20, reviews: 0.15, delivery: 0.30 },
    delivery:   { trust: 0.30, meter: 0.20, reviews: 0.15, delivery: 0.35 },
    amenities:  { trust: 0.40, meter: 0.30, reviews: 0.15, delivery: 0.15 },
  };
  const w = priorityWeights[brief.priority];

  const scored: MatchedProject[] = filtered
    .map((p) => {
      const dev = developers.find((d) => d.id === p.developerId);
      if (!dev) return null;

      const meterPct = r8MeterScore(p, dev);
      const deliveryPct = deliveryRate(dev);
      const reviewBoost = Math.min(100, Math.log10(Math.max(1, dev.reviewCount)) * 30);

      const score = Math.round(
        dev.trustScore * w.trust +
        meterPct * w.meter +
        reviewBoost * w.reviews +
        deliveryPct * w.delivery
      );

      const reasons: string[] = [];
      if (dev.trustScore >= 90) reasons.push(`${dev.trustScore} trust score`);
      if (deliveryPct >= 85) reasons.push(`${deliveryPct}% on-time delivery`);
      if (dev.reviewCount >= 500) reasons.push(`${dev.reviewCount} verified reviews`);
      if (meterPct >= 90 && reasons.length < 3) reasons.push(`R8 Meter ${meterPct}/100`);
      if (reasons.length === 0) reasons.push(`Trust score ${dev.trustScore}`);

      return {
        project: p,
        developer: dev,
        score,
        reasons: reasons.slice(0, 3),
        trustPct: dev.trustScore,
        meterPct,
        deliveryPct,
      } satisfies MatchedProject;
    })
    .filter((x): x is MatchedProject => x !== null);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

export const AREA_OPTIONS = [
  "New Cairo",
  "Sheikh Zayed",
  "North Coast",
  "New Capital",
  "Sokhna",
  "6th of October",
];

export const UNIT_TYPE_OPTIONS = ["any", "Studio", "1BR", "2BR", "3BR+", "Villa", "Townhouse"];
export const TIMELINE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "any", label: "Any time" },
  { value: "2026", label: "By 2026" },
  { value: "2027", label: "By 2027" },
  { value: "2028+", label: "2028 or later" },
];
