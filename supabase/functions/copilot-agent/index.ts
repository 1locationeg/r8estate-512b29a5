import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are R8 Agent — an autonomous AI assistant for the R8Estate real estate trust platform in Egypt. You have access to tools that query the live database. Use them to provide real, verified data — never make up numbers.

When users ask about developers, trust scores, reviews, launches, or comparisons, ALWAYS use your tools first. After getting data, present it clearly with the actual numbers.

Guidelines:
- Be concise and data-driven
- Always cite real numbers from tool results
- Respond in the same language as the user (Arabic or English)
- For investment advice, recommend due diligence
- If a tool returns no data, say so honestly`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "query_reviews",
      description: "Search reviews for a developer by name. Returns rating, comment, verification status.",
      parameters: {
        type: "object",
        properties: {
          developer_name: { type: "string", description: "Developer/company name to search" },
          min_rating: { type: "number", description: "Minimum rating filter (1-5)" },
        },
        required: ["developer_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_launches",
      description: "Search new project launches by district and/or max price per m².",
      parameters: {
        type: "object",
        properties: {
          district: { type: "string", description: "District name (e.g. New Cairo, 6th October)" },
          max_price: { type: "number", description: "Max price per m² in EGP" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_trust_score",
      description: "Compute live trust score for a developer: avg rating, review count, verified buyer %.",
      parameters: {
        type: "object",
        properties: {
          business_name: { type: "string", description: "Developer/business name" },
        },
        required: ["business_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_developers",
      description: "Side-by-side comparison of two developers' trust scores.",
      parameters: {
        type: "object",
        properties: {
          name_a: { type: "string", description: "First developer name" },
          name_b: { type: "string", description: "Second developer name" },
        },
        required: ["name_a", "name_b"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_installment",
      description: "Calculate monthly installment for a property purchase.",
      parameters: {
        type: "object",
        properties: {
          price: { type: "number", description: "Total price in EGP" },
          down_pct: { type: "number", description: "Down payment percentage" },
          years: { type: "number", description: "Installment period in years" },
          rate: { type: "number", description: "Annual interest rate %. Use 0 for interest-free." },
        },
        required: ["price", "down_pct", "years"],
      },
    },
  },
];

async function computeTrustScore(db: any, businessName: string) {
  const { data: reviews } = await db
    .from("reviews")
    .select("rating, is_verified, created_at")
    .ilike("developer_name", `%${businessName}%`)
    .eq("status", "approved");

  if (!reviews?.length) return { found: false, business: businessName };

  const total = reviews.length;
  const avgRating = +(reviews.reduce((s: number, r: any) => s + r.rating, 0) / total).toFixed(2);
  const verifiedCount = reviews.filter((r: any) => r.is_verified).length;
  const verifiedPct = +((verifiedCount / total) * 100).toFixed(1);

  const now = Date.now();
  const recentReviews = reviews.filter((r: any) => now - new Date(r.created_at).getTime() < 90 * 86400000).length;
  const recencyScore = Math.min(recentReviews / 5, 1);

  const score = +(
    avgRating * 0.4 * 20 +
    Math.min(total / 20, 1) * 0.3 * 100 +
    recencyScore * 0.15 * 100 +
    (verifiedPct / 100) * 0.15 * 100
  ).toFixed(1);

  return { found: true, business: businessName, avg_rating: avgRating, review_count: total, verified_pct: verifiedPct, trust_score: score };
}

async function executeTool(db: any, name: string, args: any): Promise<string> {
  switch (name) {
    case "query_reviews": {
      let query = db
        .from("reviews")
        .select("rating, comment, title, author_name, is_verified, created_at, developer_name")
        .ilike("developer_name", `%${args.developer_name}%`)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10);
      if (args.min_rating) query = query.gte("rating", args.min_rating);
      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({ reviews: data || [], count: data?.length || 0 });
    }
    case "query_launches": {
      let query = db
        .from("launches")
        .select("project_name, location_district, location_compound, current_price_per_m2, total_units, units_remaining, launch_date, status, down_payment_pct, installment_years")
        .in("status", ["upcoming", "open", "last_units"])
        .order("created_at", { ascending: false })
        .limit(10);
      if (args.district) query = query.ilike("location_district", `%${args.district}%`);
      if (args.max_price) query = query.lte("current_price_per_m2", args.max_price);
      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({ launches: data || [], count: data?.length || 0 });
    }
    case "get_trust_score": {
      const result = await computeTrustScore(db, args.business_name);
      return JSON.stringify(result);
    }
    case "compare_developers": {
      const [a, b] = await Promise.all([
        computeTrustScore(db, args.name_a),
        computeTrustScore(db, args.name_b),
      ]);
      return JSON.stringify({ developer_a: a, developer_b: b });
    }
    case "calculate_installment": {
      const price = args.price;
      const downPct = args.down_pct || 0;
      const years = args.years || 1;
      const rate = args.rate || 0;
      const downPayment = price * (downPct / 100);
      const remaining = price - downPayment;
      const months = years * 12;
      let monthly: number;
      if (rate === 0) {
        monthly = remaining / months;
      } else {
        const r = rate / 100 / 12;
        monthly = remaining * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      }
      return JSON.stringify({
        total_price: price,
        down_payment: downPayment,
        financed_amount: remaining,
        monthly_installment: +monthly.toFixed(2),
        total_months: months,
        interest_rate: rate,
      });
    }
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    // Rate limit check
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await anonClient.auth.getClaims(token);
      if (claimsData?.claims?.sub) userId = claimsData.claims.sub as string;
    }

    if (userId) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const { count } = await db
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfDay);
      if ((count || 0) >= 50) {
        return new Response(JSON.stringify({ error: "Daily AI limit reached. Try again tomorrow." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await db.from("ai_usage").insert({ user_id: userId, function_name: "copilot-agent", tokens_used: 1 });
    }

    // Step 1: Call LLM with tools
    const aiMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: aiMessages, tools: TOOLS, stream: false }),
    });

    if (!firstResponse.ok) {
      const t = await firstResponse.text();
      console.error("AI error:", firstResponse.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstResult = await firstResponse.json();
    const choice = firstResult.choices?.[0];

    // If no tool calls, stream the direct response
    if (!choice?.message?.tool_calls?.length) {
      // Return as SSE for compatibility
      const content = choice?.message?.content || "I couldn't process that request.";
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(sseData, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Step 2: Execute tool calls
    const toolCalls = choice.message.tool_calls;
    
    // Send tool_status event first, then execute tools
    const toolResults: any[] = [];
    for (const tc of toolCalls) {
      const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
      const result = await executeTool(db, tc.function.name, args);
      toolResults.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }

    // Step 3: Call LLM again with tool results for final answer
    const finalMessages = [
      ...aiMessages,
      choice.message,
      ...toolResults,
    ];

    const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: finalMessages, stream: true }),
    });

    if (!finalResponse.ok || !finalResponse.body) {
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepend tool_status event then stream the rest
    const toolStatusEvent = `data: ${JSON.stringify({ tool_status: "done", tools_used: toolCalls.map((tc: any) => tc.function.name) })}\n\n`;
    
    const encoder = new TextEncoder();
    const toolStatusBytes = encoder.encode(toolStatusEvent);
    
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(toolStatusBytes);
        const reader = finalResponse.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("copilot-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
