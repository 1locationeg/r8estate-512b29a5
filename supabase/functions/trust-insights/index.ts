import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert AI assistant for R8ESTATE Trust Meter, a platform helping buyers make confident decisions about off-plan real estate in Egypt.

Your role is to provide trust insights about:
- Real estate developers and their track records (Palm Hills, Emaar Misr, SODIC, Ora Developers, Tatweer Misr, Mountain View, Hyde Park, etc.)
- Egyptian off-plan property risks and how to mitigate them
- Payment plans and financial considerations in EGP
- Egyptian Real Estate Regulatory Authority (RERA) compliance and legal protections
- Market trends in New Cairo, Sheikh Zayed, North Coast, Ain Sokhna, and New Administrative Capital
- Due diligence best practices for Egyptian real estate

Guidelines:
- Be concise but thorough
- Always prioritize buyer protection and education
- Cite specific factors that affect trust scores when relevant
- Use bullet points for clarity when listing multiple items
- Be honest about risks while remaining constructive
- Format responses with markdown for better readability
- Reference Egyptian locations: New Cairo, Sheikh Zayed, North Coast, Sokhna, New Capital, 6th October City

Trust Score Categories you should reference:
1. Developer Trust (track record, financial stability, delivery history)
2. Risk Assessment (market conditions, project status, payment security)
3. Buyer Experience (customer service, transparency, communication)
4. Market Insights (location value, appreciation potential, demand trends in Egypt)`;

async function checkAndTrackUsage(serviceClient: any, userId: string, functionName: string): Promise<{ allowed: boolean; error?: string }> {
  const { data: settings } = await serviceClient
    .from("platform_settings")
    .select("key, value")
    .in("key", ["ai_daily_limit", "ai_monthly_limit"]);

  const dailyLimit = parseInt(settings?.find((s: any) => s.key === "ai_daily_limit")?.value || "50", 10);
  const monthlyLimit = parseInt(settings?.find((s: any) => s.key === "ai_monthly_limit")?.value || "500", 10);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: dailyCount } = await serviceClient
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay);

  if ((dailyCount || 0) >= dailyLimit) {
    return { allowed: false, error: `Daily AI limit reached (${dailyLimit} requests/day). Try again tomorrow.` };
  }

  const { count: monthlyCount } = await serviceClient
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth);

  if ((monthlyCount || 0) >= monthlyLimit) {
    return { allowed: false, error: `Monthly AI limit reached (${monthlyLimit} requests/month).` };
  }

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Check usage limits
    const { allowed, error: limitError } = await checkAndTrackUsage(serviceClient, userId, "trust-insights");
    if (!allowed) {
      return new Response(JSON.stringify({ error: limitError }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Trust insights error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
