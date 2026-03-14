import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a helpful AI assistant for R8Estate, a real estate trust and review platform in Egypt. You help users with:

1. **Platform Help**: How the trust scoring works, how to search for developers, how to write reviews, how to verify buyer status, etc.
2. **Real Estate Advisory**: Help users find the right developer based on their needs, budget, and preferred locations in Egypt. Provide insights about Egyptian real estate market trends, areas (New Cairo, 6th October, North Coast, New Administrative Capital, etc.).

Guidelines:
- Be friendly, professional, and concise.
- If asked about specific developers, reference the platform's trust scores and reviews.
- For investment advice, always recommend users do their own due diligence.
- Respond in the same language the user writes in (Arabic or English).
- Keep responses focused and actionable.`;

async function checkAndTrackUsage(serviceClient: any, userId: string, functionName: string): Promise<{ allowed: boolean; error?: string }> {
  // Get limits from platform_settings
  const { data: settings } = await serviceClient
    .from("platform_settings")
    .select("key, value")
    .in("key", ["ai_daily_limit", "ai_monthly_limit"]);

  const dailyLimit = parseInt(settings?.find((s: any) => s.key === "ai_daily_limit")?.value || "50", 10);
  const monthlyLimit = parseInt(settings?.find((s: any) => s.key === "ai_monthly_limit")?.value || "500", 10);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Count daily usage
  const { count: dailyCount } = await serviceClient
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay);

  if ((dailyCount || 0) >= dailyLimit) {
    return { allowed: false, error: `Daily AI limit reached (${dailyLimit} requests/day). Try again tomorrow.` };
  }

  // Count monthly usage
  const { count: monthlyCount } = await serviceClient
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth);

  if ((monthlyCount || 0) >= monthlyLimit) {
    return { allowed: false, error: `Monthly AI limit reached (${monthlyLimit} requests/month).` };
  }

  // Track this usage
  await serviceClient.from("ai_usage").insert({
    user_id: userId,
    function_name: functionName,
    tokens_used: 1,
  });

  return { allowed: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Check auth (optional for ai-chat - allow anonymous but track if authenticated)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await anonClient.auth.getClaims(token);
      if (claimsData?.claims?.sub) {
        userId = claimsData.claims.sub as string;
      }
    }

    // Enforce rate limits for authenticated users
    if (userId) {
      const { allowed, error } = await checkAndTrackUsage(serviceClient, userId, "ai-chat");
      if (!allowed) {
        return new Response(JSON.stringify({ error }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
