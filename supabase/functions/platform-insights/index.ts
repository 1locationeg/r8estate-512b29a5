import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CACHE_KEY = "platform_insights_cache";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Parse request body for force refresh flag
    let forceRefresh = false;
    try {
      const body = await req.json();
      forceRefresh = body?.forceRefresh === true;
    } catch {
      // No body or invalid JSON — that's fine
    }

    // Check cache first
    if (!forceRefresh) {
      const { data: cached } = await serviceClient
        .from("platform_settings")
        .select("value, updated_at")
        .eq("key", CACHE_KEY)
        .maybeSingle();

      if (cached) {
        const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
        if (cacheAge < CACHE_TTL_MS) {
          try {
            const cachedData = JSON.parse(cached.value);
            return new Response(JSON.stringify({
              ...cachedData,
              cached: true,
              cached_at: cached.updated_at,
              expires_in_minutes: Math.round((CACHE_TTL_MS - cacheAge) / 60000),
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          } catch {
            // Invalid cache, regenerate
          }
        }
      }
    }

    // Check usage limits (only counted when actually calling AI)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const { data: settings } = await serviceClient
      .from("platform_settings")
      .select("key, value")
      .in("key", ["ai_daily_limit"]);
    const dailyLimit = parseInt(settings?.find((s: any) => s.key === "ai_daily_limit")?.value || "50", 10);
    const { count: dailyCount } = await serviceClient
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDay);
    if ((dailyCount || 0) >= dailyLimit) {
      return new Response(JSON.stringify({ error: `Daily AI limit reached (${dailyLimit}/day). Try again tomorrow.` }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await serviceClient.from("ai_usage").insert({ user_id: userId, function_name: "platform-insights", tokens_used: 1 });

    // Gather real platform data
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalReviews },
      { count: recentReviews },
      { count: totalGuestReviews },
      { count: totalBusinesses },
      { data: parentBusinesses },
      { data: recentReviewsData },
      { count: totalUsers },
      { data: engagementData },
    ] = await Promise.all([
      serviceClient.from("reviews").select("id", { count: "exact", head: true }),
      serviceClient.from("reviews").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
      serviceClient.from("guest_reviews").select("id", { count: "exact", head: true }),
      serviceClient.from("business_profiles").select("id", { count: "exact", head: true }),
      serviceClient.from("business_profiles").select("id, company_name, is_reviewable, parent_id, location, specialties").is("parent_id", null),
      serviceClient.from("reviews").select("rating, developer_name, experience_type, created_at").order("created_at", { ascending: false }).limit(100),
      serviceClient.from("user_roles").select("id", { count: "exact", head: true }),
      serviceClient.from("buyer_engagement").select("developers_viewed, projects_saved, reports_unlocked, helpful_votes").limit(100),
    ]);

    const { data: childBusinesses } = await serviceClient
      .from("business_profiles")
      .select("parent_id, company_name, is_reviewable")
      .not("parent_id", "is", null);

    const parentChildMap: Record<string, number> = {};
    (childBusinesses || []).forEach((c: any) => {
      parentChildMap[c.parent_id] = (parentChildMap[c.parent_id] || 0) + 1;
    });

    const ratingDist = [0, 0, 0, 0, 0];
    (recentReviewsData || []).forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating - 1]++;
    });
    const avgRating = recentReviewsData?.length
      ? (recentReviewsData.reduce((s: number, r: any) => s + r.rating, 0) / recentReviewsData.length).toFixed(2)
      : "N/A";

    const engAgg = { totalViewed: 0, totalSaved: 0, totalReports: 0, totalVotes: 0 };
    (engagementData || []).forEach((e: any) => {
      engAgg.totalViewed += e.developers_viewed || 0;
      engAgg.totalSaved += e.projects_saved || 0;
      engAgg.totalReports += e.reports_unlocked || 0;
      engAgg.totalVotes += e.helpful_votes || 0;
    });

    const devMentions: Record<string, number> = {};
    (recentReviewsData || []).forEach((r: any) => {
      if (r.developer_name) devMentions[r.developer_name] = (devMentions[r.developer_name] || 0) + 1;
    });
    const topReviewedDevs = Object.entries(devMentions).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const platformSnapshot = {
      totalRegisteredUsers: totalUsers || 0,
      totalAuthenticatedReviews: totalReviews || 0,
      recentReviews30d: recentReviews || 0,
      totalGuestReviews: totalGuestReviews || 0,
      totalBusinessProfiles: totalBusinesses || 0,
      parentDevelopers: (parentBusinesses || []).length,
      childProjects: (childBusinesses || []).length,
      parentChildBreakdown: (parentBusinesses || []).slice(0, 10).map((p: any) => ({
        name: p.company_name,
        reviewable: p.is_reviewable,
        childCount: parentChildMap[p.id] || 0,
      })),
      averageRating: avgRating,
      ratingDistribution: { "1star": ratingDist[0], "2star": ratingDist[1], "3star": ratingDist[2], "4star": ratingDist[3], "5star": ratingDist[4] },
      topReviewedDevelopers: topReviewedDevs.map(([name, count]) => ({ name, reviewCount: count })),
      buyerEngagement: engAgg,
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the AI analytics engine for R8ESTATE, an Egyptian off-plan real estate review platform.

You will receive a JSON snapshot of REAL platform data. Analyze it and return EXACTLY 6 insight cards as a JSON array using tool calling.

Each insight should be data-driven, actionable, and specific. Categories:
- "reviews": Review volume, quality trends, sentiment
- "engagement": Buyer activity, saved projects, report usage
- "businesses": Developer/project profiles, completeness, hierarchy
- "growth": User/review growth trajectories
- "risk": Low review coverage, rating anomalies, gaps
- "opportunity": Untapped potential, recommendations

For each insight provide:
- category (one of above)
- title (short, punchy, max 8 words)
- summary (1-2 sentences with specific numbers from the data)
- trend: "up" | "down" | "stable" | "alert"
- metric_label (e.g. "Reviews This Month")
- metric_value (the actual number or percentage)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the current platform data snapshot:\n${JSON.stringify(platformSnapshot, null, 2)}\n\nGenerate 6 insight cards.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Return exactly 6 AI-generated insight cards based on real platform data.",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["reviews", "engagement", "businesses", "growth", "risk", "opportunity"] },
                        title: { type: "string" },
                        summary: { type: "string" },
                        trend: { type: "string", enum: ["up", "down", "stable", "alert"] },
                        metric_label: { type: "string" },
                        metric_value: { type: "string" },
                      },
                      required: ["category", "title", "summary", "trend", "metric_label", "metric_value"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate insights" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return structured insights" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const insights = JSON.parse(toolCall.function.arguments);
    const resultPayload = { insights: insights.insights, snapshot: platformSnapshot };

    // Store in cache
    const cacheValue = JSON.stringify(resultPayload);
    const { data: existing } = await serviceClient
      .from("platform_settings")
      .select("id")
      .eq("key", CACHE_KEY)
      .maybeSingle();

    if (existing) {
      await serviceClient
        .from("platform_settings")
        .update({ value: cacheValue, updated_at: new Date().toISOString() })
        .eq("key", CACHE_KEY);
    } else {
      await serviceClient
        .from("platform_settings")
        .insert({ key: CACHE_KEY, value: cacheValue });
    }

    return new Response(JSON.stringify({
      ...resultPayload,
      cached: false,
      cached_at: new Date().toISOString(),
      expires_in_minutes: Math.round(CACHE_TTL_MS / 60000),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Platform insights error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
