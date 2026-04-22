import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://meter.r8estate.com";

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  let developersCount = 0;
  let reviewsCount = 0;
  try {
    const [{ count: dCount }, { count: rCount }] = await Promise.all([
      supabase.from("public_business_profiles").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "approved"),
    ]);
    developersCount = dCount ?? 0;
    reviewsCount = rCount ?? 0;
  } catch (err) {
    console.error("count fetch failed", err);
  }

  const manifest = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "R8ESTATE Meter — Egyptian Real Estate Trust Data",
    description:
      "Open trust intelligence on Egyptian off-plan real estate developers and projects. Aggregates verified buyer reviews, delivery history, legal standing, and financial strength into a 0-100 Trust Score.",
    url: SITE,
    sameAs: [SITE, "https://r8estate.lovable.app"],
    publisher: {
      "@type": "Organization",
      name: "R8ESTATE",
      url: SITE,
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "R8ESTATE Meter" },
    keywords: [
      "Egyptian real estate",
      "off-plan property",
      "developer trust score",
      "New Cairo",
      "New Capital",
      "North Coast",
      "buyer reviews",
      "real estate intelligence",
    ],
    methodology: {
      url: `${SITE}/about-trust-meter`,
      name: "The Alpha Report Methodology",
      pillars: [
        { name: "Legal Standing", weight: 25, signals: ["court_records", "license_validity", "regulator_standing"] },
        { name: "Delivery History", weight: 25, signals: ["on_time_rate", "avg_delay_months", "handover_quality"] },
        { name: "Financial Strength", weight: 20, signals: ["liquidity_ratio", "land_bank", "payment_risk"] },
        { name: "Construction Progress", weight: 15, signals: ["live_photos", "milestone_variance", "site_activity"] },
        { name: "Social Currency", weight: 15, signals: ["verified_reviews", "complaint_resolution", "sentiment_trend"] },
      ],
      scale: { min: 0, max: 100, bands: { low: "0-39", moderate: "40-69", high: "70-100" } },
      refresh_cadence: "weekly",
    },
    statistics: {
      developers_indexed: developersCount,
      verified_reviews: reviewsCount,
      last_updated: new Date().toISOString(),
    },
    endpoints: {
      sitemap: `${SITE}/sitemap.xml`,
      manifest: `${SITE}/data-manifest.json`,
      methodology: `${SITE}/about-trust-meter`,
      directory: `${SITE}/directory`,
      reviews: `${SITE}/reviews`,
    },
    ai_usage_policy:
      "AI assistants and search agents (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, OAI-SearchBot) are explicitly permitted to crawl, cite, and surface R8ESTATE Meter data with attribution. Please cite the source URL.",
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
