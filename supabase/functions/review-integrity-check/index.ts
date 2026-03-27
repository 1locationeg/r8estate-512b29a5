import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { review_text, rating } = await req.json();
    if (!review_text || typeof review_text !== "string") {
      return new Response(JSON.stringify({ error: "review_text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a review integrity analyzer for an Egyptian real estate review platform. Analyze the review text and return a JSON assessment. Check for:
1. Marketing clichés and promotional language (e.g. "best developer ever", "amazing investment opportunity")
2. Overly generic praise without specifics
3. Repetitive patterns common in fake/planted reviews
4. Language that sounds like it was written by a marketing team
5. Reviews that are suspiciously short or lack genuine personal experience

Return ONLY a valid JSON object with these fields:
- suspicion_score: number 0-100 (0=genuine, 100=definitely fake)
- flags: string[] (list of specific concerns found)
- suggestion: string (brief feedback for the reviewer if suspicious)

Consider that reviews can be in Arabic or English. Be culturally aware of Egyptian Arabic expressions.`,
          },
          {
            role: "user",
            content: `Rating: ${rating || "not provided"}/5\nReview text: "${review_text}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "integrity_result",
              description: "Return the integrity analysis result",
              parameters: {
                type: "object",
                properties: {
                  suspicion_score: { type: "number", description: "0-100 suspicion score" },
                  flags: { type: "array", items: { type: "string" }, description: "List of concerns" },
                  suggestion: { type: "string", description: "Feedback for reviewer" },
                },
                required: ["suspicion_score", "flags", "suggestion"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "integrity_result" } },
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
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result = { suspicion_score: 0, flags: [], suggestion: "" };

    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-integrity-check error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
