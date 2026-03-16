import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert review analysis AI for R8ESTATE, a real estate reputation platform. Analyze reviews for:

1. SENTIMENT: Classify as "positive", "negative", "neutral", or "mixed". Provide a confidence score 0-1.
2. FAKE DETECTION: Assess if the review is likely fake/spam. Consider:
   - Generic/vague language with no specific details
   - Extreme sentiment without justification
   - Repetitive patterns or bot-like language
   - Suspicious timing or formatting
   - Overly promotional or defamatory without substance
3. KEY THEMES: Extract 1-3 main topics (e.g., "delivery", "quality", "pricing", "communication")
4. ACTIONABLE INSIGHT: One-sentence summary useful for the developer or buyer.

Return analysis via the provided tool.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reviews, mode } = await req.json();
    // mode: "batch" (analyze multiple) or "single" (one review)

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviewTexts = Array.isArray(reviews) ? reviews : [reviews];
    
    const prompt = reviewTexts.map((r: any, i: number) => 
      `Review #${i + 1} (ID: ${r.id || i}):\nRating: ${r.rating}/5\nAuthor: ${r.author || r.author_name || r.guest_name || "Unknown"}\nComment: ${r.comment}\n`
    ).join("\n---\n");

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
          { role: "user", content: `Analyze the following ${reviewTexts.length} review(s):\n\n${prompt}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_analysis",
              description: "Return the analysis results for all reviews",
              parameters: {
                type: "object",
                properties: {
                  analyses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        review_id: { type: "string" },
                        sentiment: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] },
                        sentiment_confidence: { type: "number", description: "0-1 confidence score" },
                        is_suspicious: { type: "boolean", description: "Whether the review appears fake or spam" },
                        suspicion_reasons: { type: "array", items: { type: "string" }, description: "Reasons why it may be fake" },
                        suspicion_score: { type: "number", description: "0-1, higher = more likely fake" },
                        themes: { type: "array", items: { type: "string" }, description: "1-3 key themes" },
                        insight: { type: "string", description: "One actionable insight sentence" },
                      },
                      required: ["review_id", "sentiment", "sentiment_confidence", "is_suspicious", "suspicion_score", "themes", "insight"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["analyses"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No analysis returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analyses = JSON.parse(toolCall.function.arguments);

    // Track usage
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await serviceClient.from("ai_usage").insert({
      user_id: user.id,
      function_name: "review-analysis",
      tokens_used: reviewTexts.length,
    });

    return new Response(JSON.stringify(analyses), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
