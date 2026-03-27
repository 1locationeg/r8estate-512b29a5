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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    discussion: "💬",
    question: "❓",
    tip: "💡",
    experience: "📖",
    poll: "📊",
  };
  return map[cat] || "💬";
}

function buildHtml(meta: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const i = escapeHtml(meta.image);
  const u = escapeHtml(meta.url);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${t}</title>
<meta name="description" content="${d}"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="${BRAND} Community"/>
<meta property="og:title" content="${t}"/>
<meta property="og:description" content="${d}"/>
<meta property="og:image" content="${i}"/>
<meta property="og:url" content="${u}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${t}"/>
<meta name="twitter:description" content="${d}"/>
<meta name="twitter:image" content="${i}"/>
<meta http-equiv="refresh" content="0;url=${u}"/>
</head>
<body>
<p>Redirecting to <a href="${u}">${BRAND} Community</a>…</p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("post");

    // Default fallback if no post ID
    if (!postId) {
      const html = buildHtml({
        title: `${BRAND} Community — Real Estate Discussions`,
        description:
          "Join Egypt's most trusted real estate community. Share experiences, ask questions, and make informed decisions.",
        image: DEFAULT_OG_IMAGE,
        url: `${SITE_URL}/community`,
      });
      return new Response(html, {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: post } = await supabase
      .from("community_posts")
      .select("id, title, body, category, upvotes, reply_count, created_at")
      .eq("id", postId)
      .maybeSingle();

    if (!post) {
      const html = buildHtml({
        title: `${BRAND} Community`,
        description: "This post may have been removed or is no longer available.",
        image: DEFAULT_OG_IMAGE,
        url: `${SITE_URL}/community`,
      });
      return new Response(html, {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const emoji = categoryEmoji(post.category);
    const stats: string[] = [];
    if (post.upvotes > 0) stats.push(`👍 ${post.upvotes} upvotes`);
    if (post.reply_count > 0) stats.push(`💬 ${post.reply_count} replies`);

    const title = `${emoji} ${post.title}`;

    // Build a compelling description with engagement proof
    let description = post.body.slice(0, 120).replace(/\n/g, " ");
    if (post.body.length > 120) description += "…";
    if (stats.length > 0) {
      description = `${stats.join(" · ")} — ${description}`;
    }
    description += ` | Join the conversation on ${BRAND}`;

    const canonicalUrl = `${SITE_URL}/community`;

    const html = buildHtml({
      title,
      description,
      image: DEFAULT_OG_IMAGE,
      url: canonicalUrl,
    });

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("og-community error:", err);
    const html = buildHtml({
      title: `${BRAND} Community`,
      description: "Join Egypt's most trusted real estate community.",
      image: DEFAULT_OG_IMAGE,
      url: `${SITE_URL}/community`,
    });
    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});
