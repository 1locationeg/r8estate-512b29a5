import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://meter.r8estate.com";

const STATIC_ROUTES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/directory", priority: "0.9", changefreq: "daily" },
  { loc: "/businesses", priority: "0.9", changefreq: "daily" },
  { loc: "/reviews", priority: "0.9", changefreq: "daily" },
  { loc: "/categories", priority: "0.8", changefreq: "weekly" },
  { loc: "/community", priority: "0.8", changefreq: "daily" },
  { loc: "/launch-watch", priority: "0.8", changefreq: "daily" },
  { loc: "/deal-watch", priority: "0.8", changefreq: "daily" },
  { loc: "/leaderboard", priority: "0.7", changefreq: "weekly" },
  { loc: "/rewards", priority: "0.6", changefreq: "weekly" },
  { loc: "/about-trust-meter", priority: "0.8", changefreq: "monthly" },
  { loc: "/about", priority: "0.5", changefreq: "monthly" },
  { loc: "/contact", priority: "0.5", changefreq: "monthly" },
  { loc: "/reviewer-program", priority: "0.7", changefreq: "monthly" },
  { loc: "/impact", priority: "0.6", changefreq: "monthly" },
  { loc: "/products", priority: "0.6", changefreq: "monthly" },
  { loc: "/sitemap", priority: "0.4", changefreq: "monthly" },
  { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
  { loc: "/terms", priority: "0.3", changefreq: "yearly" },
];

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

Deno.serve(async (_req) => {
  const today = new Date().toISOString().split("T")[0];
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  let entityUrls = "";
  try {
    const { data } = await supabase
      .from("public_business_profiles")
      .select("id, updated_at")
      .limit(5000);
    if (data) {
      entityUrls = data
        .map(
          (e: { id: string; updated_at: string }) =>
            `<url><loc>${SITE}/entity/${escape(e.id)}</loc><lastmod>${(e.updated_at ?? today).split("T")[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
        )
        .join("");
    }
  } catch (err) {
    console.error("entity fetch failed", err);
  }

  const staticUrls = STATIC_ROUTES.map(
    (r) =>
      `<url><loc>${SITE}${r.loc}</loc><lastmod>${today}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
  ).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${entityUrls}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
