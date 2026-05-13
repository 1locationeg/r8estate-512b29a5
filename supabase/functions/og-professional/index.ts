import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://meter.r8estate.com";
const BRAND = "R8ESTATE";
const DEFAULT_OG_IMAGE =
  "https://mcekdnvxeblikixmfyni.supabase.co/storage/v1/object/public/og-assets/r8estate-og.png";
const DEFAULT_DESCRIPTION =
  "R8ESTATE professional trust page — showcasing real client reviews, expertise, achievements, certifications, and trusted off-plan real estate experience.";
const htmlHeaders = {
  ...corsHeaders,
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
};

function toPreviewImageUrl(imageUrl: string) {
  try {
    const parsed = new URL(imageUrl);
    if (!parsed.pathname.includes("/storage/v1/object/public/")) return imageUrl;
    parsed.pathname = parsed.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    parsed.searchParams.set("width", "1200");
    parsed.searchParams.set("height", "630");
    parsed.searchParams.set("resize", "cover");
    parsed.searchParams.set("quality", "60");
    return parsed.toString();
  } catch {
    return imageUrl;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function compactDescription(s: string) {
  const text = stripHtml(s).replace(/\s+/g, " ").trim();
  return text.length > 220 ? `${text.slice(0, 217).trim()}...` : text;
}

function buildHtml(meta: {
  title: string;
  description: string;
  image: string;
  shareUrl: string;
  targetUrl: string;
}) {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const i = escapeHtml(meta.image);
  const shareUrl = escapeHtml(meta.shareUrl);
  const targetUrl = escapeHtml(meta.targetUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${t}</title>
<meta name="description" content="${d}"/>
<meta property="og:type" content="profile"/>
<meta property="og:site_name" content="${BRAND}"/>
<meta property="og:title" content="${t}"/>
<meta property="og:description" content="${d}"/>
<meta property="og:image" content="${i}"/>
<meta property="og:image:secure_url" content="${i}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${t}"/>
<meta property="og:url" content="${shareUrl}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${t}"/>
<meta name="twitter:description" content="${d}"/>
<meta name="twitter:image" content="${i}"/>
<meta name="twitter:image:alt" content="${t}"/>
<meta name="robots" content="noindex,follow"/>
<link rel="canonical" href="${shareUrl}"/>
</head>
<body>
<script>window.location.replace(${JSON.stringify(meta.targetUrl)});</script>
<p>Open <a href="${targetUrl}">${BRAND}</a>.</p>
</body>
</html>`;
}

function htmlResponse(html: string) {
  return new Response(new Blob([html], { type: "text/html; charset=utf-8" }), {
    headers: htmlHeaders,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Accept ?slug=xxx OR trailing path segment /og-professional/xxx
  let slug = url.searchParams.get("slug");
  if (!slug) {
    const parts = url.pathname.split("/").filter(Boolean);
    slug = parts[parts.length - 1] || null;
    if (slug === "og-professional") slug = null;
  }

  const shareUrl = slug ? `${SITE_URL}/p/${slug}` : SITE_URL;
  const targetUrl = slug ? `${SITE_URL}/pro/${slug}` : SITE_URL;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let title = `${BRAND} — Professional Trust Page`;
    let description = DEFAULT_DESCRIPTION;
    let image = DEFAULT_OG_IMAGE;

    if (slug) {
      // 1) Admin override wins
      const { data: override } = await supabase
        .from("og_overrides")
        .select("image_url, title, description, body_html, enabled")
        .eq("slug", slug)
        .maybeSingle();

      // 2) Professional data fallback
      const { data: proRows } = await supabase.rpc(
        "get_professional_by_slug",
        { _slug: slug }
      );
      const pro = Array.isArray(proRows) && proRows.length ? proRows[0] : null;

      if (pro?.full_name) {
        title = `${pro.full_name} — ${BRAND} Trust Page`;
      }
      if (pro?.cover_url) {
        image = toPreviewImageUrl(pro.cover_url);
      }
      if (pro?.headline) {
        description = compactDescription(`${pro.headline}. ${DEFAULT_DESCRIPTION}`);
      } else if (pro?.bio) {
        description = compactDescription(pro.bio);
      }

      if (override && override.enabled) {
        if (override.title) title = override.title;
        if (override.image_url) image = toPreviewImageUrl(override.image_url);
        if (override.description) {
          description = compactDescription(override.description);
        } else if (override.body_html) {
          const text = compactDescription(override.body_html);
          if (text) description = text;
        }
      }
    }

    const html = buildHtml({ title, description, image, shareUrl, targetUrl });
    return htmlResponse(html);
  } catch (err) {
    console.error("og-professional error:", err);
    const html = buildHtml({
      title: `${BRAND} — Professional Trust Page`,
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_OG_IMAGE,
      shareUrl,
      targetUrl,
    });
    return htmlResponse(html);
  }
});