import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { review_text, rating, content_type } = await req.json();
    if (!review_text || typeof review_text !== "string") {
      return new Response(JSON.stringify({ error: "review_text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const contentLabel = content_type === "post" ? "community post" : content_type === "reply" ? "community reply" : "review";

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
            content: `You are a content moderation analyzer for an Egyptian real estate ${contentLabel} platform (R8ESTATE). Analyze the text and return a JSON assessment. Check for ALL of the following:

1. **Profanity & Insults** — Arabic (Egyptian dialect included: شتائم, ألفاظ خارجة, كلام وسخ), English slurs, personal name-calling
2. **Personal Attacks & Defamation** — Unsubstantiated accusations (e.g. "حرامي", "نصاب", "scammer" without evidence), targeting individuals by name with slurs
3. **Competitor Attacks** — Malicious comparisons designed to harm another business (e.g. "don't buy from X", "X is a fraud" without proof), sabotage reviews
4. **Bias & Discrimination** — Sectarian, regional, gender-based, or class-based prejudice
5. **Threats & Incitement** — Direct or implied threats, calls to harm someone or their business
6. **Marketing/Promotional Language** — Overly generic praise, repetitive patterns common in fake/planted reviews, sounds like marketing copy
7. **Generic/Evidence-Free Content** — Reviews that contain no specific details, no dates, no evidence, just vague statements like "best developer" or "worst company ever"

IMPORTANT DISTINCTIONS:
- A legitimate negative review with specifics ("delivery was 6 months late, unit 204 had cracks") is FINE — low score
- A vague attack without evidence ("they are thieves and liars") is NOT fine — high score
- Egyptian dialect expressions of frustration are OK if not crossing into slurs

Return ONLY a valid JSON object with these fields:
- suspicion_score: number 0-100 (0=clean, 100=severe violation)
- flags: string[] (list of specific concerns found)
- suggestion: string (brief feedback for the user, in the same language they wrote in)
- violation_type: string (one of: "profanity", "personal_attack", "competitor_attack", "bias", "threat", "defamation", "promotional", "generic_no_evidence", "none")
- severity: string (one of: "low", "medium", "high", "critical")

Consider that content can be in Arabic or English. Be culturally aware of Egyptian Arabic expressions.`,
          },
          {
            role: "user",
            content: `Content type: ${contentLabel}\nRating: ${rating || "not provided"}/5\nText: "${review_text}"`,
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
                  suggestion: { type: "string", description: "Feedback for user" },
                  violation_type: { type: "string", enum: ["profanity", "personal_attack", "competitor_attack", "bias", "threat", "defamation", "promotional", "generic_no_evidence", "none"], description: "Primary violation type" },
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Severity level" },
                },
                required: ["suspicion_score", "flags", "suggestion", "violation_type", "severity"],
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
    let result = { suspicion_score: 0, flags: [], suggestion: "", violation_type: "none", severity: "low" };

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
