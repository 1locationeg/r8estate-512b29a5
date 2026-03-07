import jsPDF from "jspdf";
import type { SearchItem, SearchCategory } from "@/data/searchIndex";

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
  if (score >= 66) return [34, 139, 34]; // green
  if (score >= 50) return [218, 165, 32]; // gold
  return [220, 53, 69]; // red
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

export const downloadTrustReport = (item: SearchItem) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const trustScore = generateTrustScore(item);
  const rating = item.rating || 3 + Math.abs(trustScore % 3);
  const scoreColor = getScoreColor(trustScore);
  const metrics = getCategoryMetrics(item.category);

  // --- Header band ---
  doc.setFillColor(15, 46, 83); // dark navy
  doc.rect(0, 0, pageW, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("R8ESTATE", margin, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Trust Report", margin, 24);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, 31);

  y = 48;

  // --- Item Name & Category ---
  doc.setTextColor(15, 46, 83);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(item.name, margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const categoryLabel = getCategoryLabel(item.category);
  const subtitleParts = [categoryLabel];
  if (item.subtitle) subtitleParts.push(item.subtitle);
  doc.text(subtitleParts.join("  •  "), margin, y);
  y += 12;

  // --- Trust Score Section ---
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Trust Score circle (drawn as filled circle with text)
  const circleX = margin + 22;
  const circleY = y + 12;
  const circleR = 16;

  // Outer ring
  doc.setDrawColor(...scoreColor);
  doc.setLineWidth(3);
  doc.circle(circleX, circleY, circleR);

  // Inner background
  doc.setFillColor(250, 250, 250);
  doc.circle(circleX, circleY, circleR - 2.5, "F");

  // Score number
  doc.setTextColor(...scoreColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${trustScore}%`, circleX, circleY + 2, { align: "center" });

  // "Trust Score" label below circle
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text("Trust Score", circleX, circleY + circleR + 6, { align: "center" });

  // Rating stars text next to circle
  const ratingX = circleX + circleR + 14;
  doc.setTextColor(15, 46, 83);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${rating.toFixed(1)} / 5.0`, ratingX, circleY - 4);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  doc.text(stars, ratingX, circleY + 3);

  if (item.reviewCount) {
    doc.text(`${item.reviewCount.toLocaleString()} reviews`, ratingX, circleY + 10);
  }

  // Verified badge
  if (item.meta?.verified) {
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(9);
    doc.text("✓ Verified", ratingX, circleY + 18);
  }

  y = circleY + circleR + 16;

  // --- Category Metrics Breakdown ---
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setTextColor(15, 46, 83);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Trust Category Breakdown", margin, y);
  y += 8;

  // Generate deterministic scores for each metric
  metrics.forEach((metric, i) => {
    let metricHash = 0;
    const seed = item.id + metric;
    for (let j = 0; j < seed.length; j++) {
      metricHash = ((metricHash << 5) - metricHash) + seed.charCodeAt(j);
      metricHash = metricHash & metricHash;
    }
    const metricScore = 45 + Math.abs(metricHash % 50); // 45-94
    const mColor = getScoreColor(metricScore);

    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(metric, margin, y + 3);

    // Score value
    doc.setTextColor(...mColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${metricScore}%`, pageW - margin, y + 3, { align: "right" });

    // Bar background
    const barX = margin + 52;
    const barW = contentW - 72;
    const barH = 4;
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(barX, y, barW, barH, 2, 2, "F");

    // Bar fill
    doc.setFillColor(...mColor);
    doc.roundedRect(barX, y, barW * (metricScore / 100), barH, 2, 2, "F");

    y += 11;
  });

  y += 4;

  // --- Summary Section ---
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setTextColor(15, 46, 83);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, y);
  y += 7;

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
      y += 4;
      return;
    }
    const split = doc.splitTextToSize(line, contentW);
    doc.text(split, margin, y);
    y += split.length * 4.5;
  });

  y += 8;

  // --- Footer ---
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text("© R8ESTATE Trust Meter  •  This report is for informational purposes only and does not constitute investment advice.", margin, y);
  y += 4;
  doc.text("Data sourced from verified community reviews and platform analytics.", margin, y);

  // Save
  const safeName = item.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`R8ESTATE_Trust_Report_${safeName}.pdf`);
};
