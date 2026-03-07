import jsPDF from "jspdf";
import type { SearchItem, SearchCategory } from "@/data/searchIndex";
import { reviews } from "@/data/mockData";

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

const getScoreColor = (score: number): [number, number, number] => {
  if (score >= 66) return [34, 139, 34];
  if (score >= 50) return [218, 165, 32];
  return [220, 53, 69];
};

const getCategoryLabel = (cat: SearchCategory): string => {
  const labels: Record<SearchCategory, string> = {
    developers: "Developer", projects: "Project", locations: "Location",
    brokers: "Broker", apps: "App", units: "Unit Type",
    "property-types": "Property Type", categories: "Category", reviews: "Review",
  };
  return labels[cat] || cat;
};

interface ComparisonData {
  itemA: SearchItem;
  itemB: SearchItem;
  scoresA: { trustScore: number; rating: number; categoryScores: Record<string, number>; metricKeys: string[] };
  scoresB: { trustScore: number; rating: number; categoryScores: Record<string, number>; metricKeys: string[] };
  metricLabels: Record<string, string>;
}

const getItemReviews = (item: SearchItem) => {
  return reviews.filter(r => r.developerId === item.id).slice(0, 3);
};

export const downloadComparisonReport = async (data: ComparisonData) => {
  const { itemA, itemB, scoresA, scoresB, metricLabels } = data;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Load letterhead
  try {
    const letterheadData = await loadImageAsBase64("/images/letterhead.jpg");
    doc.addImage(letterheadData, "JPEG", 0, 0, pageW, pageH);
  } catch (e) {
    console.warn("Could not load letterhead", e);
  }

  const margin = 25;
  const contentW = pageW - margin * 2;
  const colW = (contentW - 10) / 2;
  let y = 62;

  // Title
  doc.setTextColor(15, 46, 83);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Comparison Report", pageW / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageW / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(15, 46, 83);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Side by side names
  const leftX = margin;
  const rightX = margin + colW + 10;

  const drawItemHeader = (item: SearchItem, scores: typeof scoresA, x: number, w: number) => {
    const startY = y;
    doc.setTextColor(15, 46, 83);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(item.name, x + w / 2, startY, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(getCategoryLabel(item.category), x + w / 2, startY + 5, { align: "center" });

    // Trust score
    const scoreColor = getScoreColor(scores.trustScore);
    const cx = x + w / 2;
    const cy = startY + 18;
    doc.setDrawColor(...scoreColor);
    doc.setLineWidth(2);
    doc.circle(cx, cy, 10);
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, 8, "F");
    doc.setTextColor(...scoreColor);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${scores.trustScore}%`, cx, cy + 2, { align: "center" });

    // Rating
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Rating: ${scores.rating.toFixed(1)} / 5.0`, x + w / 2, cy + 14, { align: "center" });
  };

  drawItemHeader(itemA, scoresA, leftX, colW);
  drawItemHeader(itemB, scoresB, rightX, colW);

  // VS in center
  doc.setTextColor(15, 46, 83);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("VS", pageW / 2, y + 18, { align: "center" });

  y += 38;

  // Metrics comparison
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setTextColor(15, 46, 83);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Category Breakdown", margin, y);
  y += 6;

  const metricKeys = scoresA.metricKeys;
  metricKeys.forEach((key) => {
    const scoreA = scoresA.categoryScores[key] || 0;
    const scoreB = scoresB.categoryScores[key] || 0;
    const label = metricLabels[key] || key;
    const colorA = getScoreColor(scoreA);
    const colorB = getScoreColor(scoreB);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(label, pageW / 2, y + 2, { align: "center" });

    // Left bar (right-aligned)
    const barW = colW - 10;
    const barH = 3;
    const barLeftX = margin;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barLeftX, y + 4, barW, barH, 1, 1, "F");
    doc.setFillColor(...colorA);
    const fillA = barW * (scoreA / 100);
    doc.roundedRect(barLeftX + barW - fillA, y + 4, fillA, barH, 1, 1, "F");
    doc.setTextColor(...colorA);
    doc.setFontSize(7);
    doc.text(`${scoreA}%`, barLeftX, y + 3);

    // Right bar
    const barRightX = rightX;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barRightX, y + 4, barW, barH, 1, 1, "F");
    doc.setFillColor(...colorB);
    doc.roundedRect(barRightX, y + 4, barW * (scoreB / 100), barH, 1, 1, "F");
    doc.setTextColor(...colorB);
    doc.text(`${scoreB}%`, barRightX + barW + 2, y + 3);

    y += 10;
  });

  y += 4;

  // Reviews section
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setTextColor(15, 46, 83);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Recent Reviews", margin, y);
  y += 6;

  const reviewsA = getItemReviews(itemA);
  const reviewsB = getItemReviews(itemB);

  const drawReviews = (revs: typeof reviewsA, x: number, w: number, itemName: string) => {
    let ry = y;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 46, 83);
    doc.text(itemName, x, ry);
    ry += 4;

    if (revs.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.text("No reviews available", x, ry);
      ry += 5;
    } else {
      revs.forEach((rev) => {
        if (ry > 260) return; // Don't overflow past footer
        const stars = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(7);
        doc.text(`${rev.author}  ${stars}`, x, ry);
        ry += 3.5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(6.5);
        const lines = doc.splitTextToSize(rev.comment, w - 2);
        const maxLines = lines.slice(0, 3);
        doc.text(maxLines, x, ry);
        ry += maxLines.length * 3 + 2;
      });
    }
    return ry;
  };

  const endA = drawReviews(reviewsA, leftX, colW, itemA.name);
  const endB = drawReviews(reviewsB, rightX, colW, itemB.name);
  y = Math.max(endA, endB) + 4;

  // Summary
  if (y < 255) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    doc.setTextColor(15, 46, 83);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", margin, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    const winner = scoresA.trustScore > scoresB.trustScore ? itemA.name : scoresA.trustScore < scoresB.trustScore ? itemB.name : null;
    const summary = winner
      ? `${winner} leads this comparison with a higher overall trust score. Both entities were evaluated across multiple performance categories.`
      : `Both ${itemA.name} and ${itemB.name} have equal trust scores, indicating comparable performance across key metrics.`;
    const lines = doc.splitTextToSize(summary, contentW);
    doc.text(lines, margin, y);
  }

  const safeA = itemA.name.replace(/[^a-zA-Z0-9]/g, "_");
  const safeB = itemB.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`R8ESTATE_Comparison_${safeA}_vs_${safeB}.pdf`);
};
