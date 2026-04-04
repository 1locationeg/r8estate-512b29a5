import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { review, platform, businessName } = await req.json();

    if (!review?.comment || !review?.rating) {
      return new Response(JSON.stringify({ error: "Missing review data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const charLimits: Record<string, number> = {
      twitter: 280,
      instagram: 2200,
      linkedin: 3000,
      general: 500,
    };
    const targetPlatform = platform || "general";
    const charLimit = charLimits[targetPlatform] || 500;

    const systemPrompt = `You are a social media marketing expert for real estate companies. Your job is to transform customer reviews into engaging, branded social media posts. Rules:
- Keep the post within ${charLimit} characters
- Include relevant emojis
- Add 3-5 hashtags at the end
- Include a subtle call-to-action
- Keep it authentic — don't over-embellish
- Platform: ${targetPlatform}
- If Twitter/X, be concise and punchy
- If Instagram, be more visual/emotional
- If LinkedIn, be professional and credible
- Never fabricate quotes; paraphrase the review naturally
- Reference the star rating naturally (e.g. "⭐⭐⭐⭐⭐")`;

    const userPrompt = `Transform this review into a social media post for ${businessName || "our company"}:

Rating: ${review.rating}/5
Author: ${review.author || "A valued customer"}
Review: "${review.comment}"
${review.project ? `Project: ${review.project}` : ""}`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_social_post",
              description: "Return the generated social media post",
              parameters: {
                type: "object",
                properties: {
                  post_text: { type: "string", description: "The full social media post text including hashtags" },
                  hashtags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Individual hashtags used",
                  },
                  caption: { type: "string", description: "A short image caption suggestion for the post" },
                },
                required: ["post_text", "hashtags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_social_post" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No post generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-to-social error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
