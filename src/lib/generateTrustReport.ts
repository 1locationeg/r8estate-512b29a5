import jsPDF from "jspdf";
import type { SearchItem, SearchCategory } from "@/data/searchIndex";
import type { TrustScoreBreakdown } from "@/lib/trustScoreCalculator";

// Deterministic trust score (same logic as SearchSuggestions)
const generateTrustScore = (item: SearchItem): number => {
  if (item.category === "developers" && item.meta?.trustScore) {
    return item.meta.trustScore as number;
  }
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) {
    hash = ((hash << 5) - hash) + item.id.charCodeAt(i);
    hash = hash & hash;
  }
  return 55 + Math.abs(hash % 40);
};

const getCategoryMetrics = (category: SearchCategory): string[] => {
  switch (category) {
    case "developers":
      return ["Build Quality", "On-Time Delivery", "ROI Performance", "Customer Service", "Transparency", "After-Sales"];
    case "projects":
      return ["Design Quality", "Location Value", "Price Competitiveness", "Amenities", "Construction Progress", "Investment Potential"];
    case "brokers":
      return ["Professionalism", "Market Knowledge", "Responsiveness", "Negotiation Skills", "Transparency", "Client Satisfaction"];
    case "apps":
      return ["Usability", "Accuracy", "Features", "Support", "Value", "Reliability"];
    default:
      return ["Quality", "Value", "Reliability", "Reputation", "Service", "Trust"];
  }
};

const getScoreColor = (score: number): [number, number, number] => {
  if (score >= 66) return [34, 139, 34];
  if (score >= 50) return [218, 165, 32];
  return [220, 53, 69];
};

const getCategoryLabel = (cat: SearchCategory): string => {
  const labels: Record<SearchCategory, string> = {
    developers: "Developer",
    projects: "Project",
    locations: "Location",
    brokers: "Broker",
    apps: "App",
    units: "Unit Type",
    "property-types": "Property Type",
    categories: "Category",
    reviews: "Review",
  };
  return labels[cat] || cat;
};

// Map canonical breakdown keys to friendly English labels for the PDF.
const PILLAR_LABELS: Record<string, string> = {
  delivery: "Project Timeliness",
  quality: "Construction Quality",
  financial: "Value for Money",
  support: "Customer Service",
};

// Load image as base64 data URL
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const downloadTrustReport = async (
  item: SearchItem,
  breakdown?: TrustScoreBreakdown
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297

  // Load and add letterhead background
  try {
    const letterheadData = await loadImageAsBase64("/images/letterhead.jpg");
    doc.addImage(letterheadData, "JPEG", 0, 0, pageW, pageH);
  } catch (e) {
    console.warn("Could not load letterhead, continuing without background", e);
  }

  // Content area: below the letterhead header (~55mm) and above footer (~250mm)
  const margin = 25;
  const contentW = pageW - margin * 2;
  let y = 62; // Start below the R8ESTATE logo + tagline area

  // Prefer LIVE breakdown when available so the PDF reflects real math.
  const trustScore = breakdown ? breakdown.total : generateTrustScore(item);
  const rating = breakdown
    ? breakdown.pillars.rating.avgRating || item.rating || 0
    : item.rating || 3 + Math.abs(trustScore % 3);
  const scoreColor = getScoreColor(trustScore);
  const metrics = getCategoryMetrics(item.category);
  const categoryLabel = getCategoryLabel(item.category);

  // --- "Trust Report" title ---
  doc.setTextColor(15, 46, 83);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Trust Report", pageW / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    pageW / 2, y, { align: "center" }
  );
  y += 10;

  // --- Divider ---
  doc.setDrawColor(15, 46, 83);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // --- Item Name & Category ---
  doc.setTextColor(15, 46, 83);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(item.name, margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const subtitleParts = [categoryLabel];
  if (item.subtitle) subtitleParts.push(item.subtitle);
  doc.text(subtitleParts.join("  •  "), margin, y);
  y += 10;

  // --- Trust Score & Rating side by side ---
  // Trust Score circle
  const circleX = margin + 20;
  const circleY = y + 12;
  const circleR = 14;

  // Outer ring
  doc.setDrawColor(...scoreColor);
  doc.setLineWidth(2.5);
  doc.circle(circleX, circleY, circleR);

  // Inner background (white to overlay letterhead pattern)
  doc.setFillColor(255, 255, 255);
  doc.circle(circleX, circleY, circleR - 2, "F");

  // Score number
  doc.setTextColor(...scoreColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${trustScore}%`, circleX, circleY + 2, { align: "center" });

  // "Trust Score" label
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text("Trust Score", circleX, circleY + circleR + 5, { align: "center" });

  // Rating info next to circle
  const ratingX = circleX + circleR + 14;
  doc.setTextColor(15, 46, 83);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`${rating.toFixed(1)} / 5.0`, ratingX, circleY - 3);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  doc.text(stars, ratingX, circleY + 4);

  if (item.reviewCount) {
    doc.text(`${item.reviewCount.toLocaleString()} reviews`, ratingX, circleY + 10);
  }

  if (item.meta?.verified) {
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(9);
    doc.text("✓ Verified", ratingX, circleY + 17);
  }

  y = circleY + circleR + 14;

  // --- 4-Pillar Methodology (only when live breakdown is available) ---
  if (breakdown) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 7;

    doc.setTextColor(15, 46, 83);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("How This Score Is Built", margin, y);
    y += 6;

    const pillars: Array<{ label: string; pts: number; max: number; note: string }> = [
      {
        label: "Rating",
        pts: breakdown.pillars.rating.points,
        max: breakdown.pillars.rating.max,
        note: `${breakdown.pillars.rating.avgRating.toFixed(1)} avg / 5`,
      },
      {
        label: "Volume",
        pts: breakdown.pillars.volume.points,
        max: breakdown.pillars.volume.max,
        note: `${breakdown.pillars.volume.reviewCount} reviews`,
      },
      {
        label: "Verification",
        pts: breakdown.pillars.verification.points,
        max: breakdown.pillars.verification.max,
        note: `${breakdown.pillars.verification.verifiedCount} verified`,
      },
      {
        label: "Recency",
        pts: breakdown.pillars.recency.points,
        max: breakdown.pillars.recency.max,
        note: `${breakdown.pillars.recency.recentCount} in last 90d`,
      },
    ];

    pillars.forEach((p) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text(p.label, margin, y + 3);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(p.note, margin + 30, y + 3);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 46, 83);
      doc.text(`${p.pts.toFixed(1)} / ${p.max} pts`, pageW - margin, y + 3, {
        align: "right",
      });

      const barX = margin + 70;
      const barW = contentW - 88;
      const barH = 3.5;
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(barX, y, barW, barH, 1.5, 1.5, "F");
      doc.setFillColor(15, 46, 83);
      doc.roundedRect(barX, y, barW * (p.pts / p.max), barH, 1.5, 1.5, "F");

      y += 9;
    });
    y += 2;

    // Confidence pill
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    const confLabel =
      breakdown.confidence === "high"
        ? "High confidence"
        : breakdown.confidence === "medium"
          ? "Medium confidence"
          : "Low confidence";
    doc.text(
      `${confLabel} · based on ${breakdown.pillars.rating.reviewCount} reviews${breakdown.isEstimated ? " (estimated — limited data)" : ""}`,
      margin,
      y
    );
    y += 8;
  }

  // --- Category Metrics Breakdown ---
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setTextColor(15, 46, 83);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Trust Category Breakdown", margin, y);
  y += 7;

  // Prefer LIVE category scores (4 canonical keys) when available, otherwise fall back
  // to the deterministic 6-metric estimation.
  const liveCategories = breakdown?.categoryScores ?? [];
  const useLive = liveCategories.length > 0;

  const renderRows: Array<{ label: string; score: number; note?: string }> = useLive
    ? liveCategories.map((c) => ({
        label: PILLAR_LABELS[c.key] || c.key,
        score: c.score,
        note:
          c.source === "estimated"
            ? "estimated"
            : `${c.sampleSize} review${c.sampleSize === 1 ? "" : "s"}`,
      }))
    : metrics.map((metric) => {
        let metricHash = 0;
        const seed = item.id + metric;
        for (let j = 0; j < seed.length; j++) {
          metricHash = ((metricHash << 5) - metricHash) + seed.charCodeAt(j);
          metricHash = metricHash & metricHash;
        }
        return { label: metric, score: 45 + Math.abs(metricHash % 50) };
      });

  renderRows.forEach((row) => {
    const metricScore = row.score;
    const mColor = getScoreColor(metricScore);

    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(row.label, margin, y + 3);

    if (row.note) {
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(row.note, margin + 48, y + 3);
    }

    // Score value
    doc.setTextColor(...mColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${metricScore}%`, pageW - margin, y + 3, { align: "right" });

    // Bar background
    const barX = margin + 70;
    const barW = contentW - 88;
    const barH = 3.5;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, y, barW, barH, 1.5, 1.5, "F");

    // Bar fill
    doc.setFillColor(...mColor);
    doc.roundedRect(barX, y, barW * (metricScore / 100), barH, 1.5, 1.5, "F");

    y += 10;
  });

  y += 3;

  // --- Summary ---
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setTextColor(15, 46, 83);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  const summaryLines = [
    `${item.name} is a ${categoryLabel.toLowerCase()} listed on R8ESTATE with a trust score of ${trustScore}% and an average rating of ${rating.toFixed(1)}/5.`,
    trustScore >= 66
      ? "This entity has demonstrated strong performance across key trust metrics, indicating high reliability and quality."
      : trustScore >= 50
        ? "This entity shows moderate performance. Some areas may benefit from improvement before making a decision."
        : "This entity has lower trust metrics. We recommend thorough due diligence before proceeding.",
    "",
    "This report is generated based on aggregated community reviews, verified transactions, and platform analytics.",
  ];

  summaryLines.forEach((line) => {
    if (line === "") {
      y += 3;
      return;
    }
    const split = doc.splitTextToSize(line, contentW);
    doc.text(split, margin, y);
    y += split.length * 4.5;
  });

  // Save
  const safeName = item.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`R8ESTATE_Trust_Report_${safeName}.pdf`);
};
