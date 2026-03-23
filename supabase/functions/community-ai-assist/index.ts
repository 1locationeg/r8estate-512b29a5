import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    // Track usage
    await serviceClient.from("ai_usage").insert({
      user_id: userId,
      function_name: "community-ai-assist",
      tokens_used: 1,
    });

    const { action, title, body, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "suggest_titles") {
      systemPrompt = `You are an AI assistant for R8ESTATE community hub — a real estate trust platform in Egypt. Generate engaging discussion titles that spark conversation and engagement. Keep them concise, compelling, and relevant to real estate buyers' concerns.`;
      userPrompt = `Category: ${category || 'discussion'}. Current draft title: "${title || '(empty)'}". Body hint: "${body || '(none)'}".
Generate 4 compelling title suggestions that would get high engagement. Make them feel human, warm, and relatable to Egyptian real estate buyers.`;
    } else if (action === "enhance_post") {
      systemPrompt = `You are an AI writing assistant for R8ESTATE community. Improve the user's post while keeping their authentic voice. Make it more engaging, clear, and likely to receive helpful responses. Add structure if needed. Keep the same language (Arabic or English) as the input.`;
      userPrompt = `Category: ${category}. Title: "${title}". 
Enhance this community post body (keep meaning, improve clarity and engagement):
"${body}"`;
    } else if (action === "suggest_reply") {
      systemPrompt = `You are an AI assistant for R8ESTATE community. Generate helpful, warm reply suggestions for community discussions about real estate in Egypt. Be constructive, add value, and encourage further discussion.`;
      userPrompt = `Post title: "${title}". Post body: "${body}".
Generate 3 short, helpful reply suggestions that add value to this discussion. Keep them authentic and conversational.`;
    } else if (action === "sentiment_preview") {
      systemPrompt = `You are a sentiment analyst for R8ESTATE community. Analyze the emotional tone and engagement potential of community posts. Be brief and actionable.`;
      userPrompt = `Analyze this post. Title: "${title}". Body: "${body}".
Rate its engagement potential and suggest a quick improvement tip.`;
    }

    const toolParams: Record<string, any> = {
      suggest_titles: {
        titles: { type: "array", items: { type: "string" }, description: "4 engaging title suggestions" },
        tips: { type: "array", items: { type: "string" }, description: "2 quick tips for better engagement" },
      },
      enhance_post: {
        enhanced_body: { type: "string", description: "Improved post body" },
        changes: { type: "string", description: "Brief description of improvements" },
        engagement_tip: { type: "string", description: "Tip to boost engagement" },
      },
      suggest_reply: {
        replies: { type: "array", items: { type: "string" }, description: "3 helpful reply suggestions" },
      },
      sentiment_preview: {
        tone: { type: "string", enum: ["positive", "neutral", "constructive", "concerned", "excited"] },
        engagement_score: { type: "number", description: "1-10 predicted engagement" },
        tip: { type: "string", description: "Quick tip to improve engagement" },
      },
    };

    const requiredFields: Record<string, string[]> = {
      suggest_titles: ["titles", "tips"],
      enhance_post: ["enhanced_body", "changes", "engagement_tip"],
      suggest_reply: ["replies"],
      sentiment_preview: ["tone", "engagement_score", "tip"],
    };

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
        tools: [{
          type: "function",
          function: {
            name: "community_assist",
            description: "Return AI assistance for community writing",
            parameters: {
              type: "object",
              properties: toolParams[action] || toolParams.enhance_post,
              required: requiredFields[action] || requiredFields.enhance_post,
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "community_assist" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unexpected AI response format");
  } catch (e) {
    console.error("community-ai-assist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
