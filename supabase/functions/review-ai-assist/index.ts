import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    // Check usage limits
    const { allowed, error: limitError } = await checkAndTrackUsage(serviceClient, userId, "review-ai-assist");
    if (!allowed) {
      return new Response(JSON.stringify({ error: limitError }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, text, developerName, rating, experienceType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "suggest") {
      systemPrompt = `You are an AI assistant for R8ESTATE, a real estate trust platform. Help users write powerful, emotionally compelling property reviews using the "Transformation Story" framework.

The best reviews follow a BEFORE → MOMENT → AFTER arc:
- BEFORE: What was the situation? What fears or doubts existed?
- MOMENT: What specific thing happened (discovery on R8ESTATE, a red flag found, a trust score checked)?
- AFTER: What was the outcome? What was saved or gained?

Example transformation stories:
- "I was 2 days from signing a 3M EGP contract. R8ESTATE showed me 47 complaints about delayed delivery. I walked away. Six months later, that project froze."
- "Every developer felt like a gamble. Then R8ESTATE's trust scores led me to a verified developer with 4.8 stars. I signed, moved in on time."

Return a JSON object with these fields:
- suggestions: array of 3-5 short sentence starters that nudge the user toward telling their before/after story (e.g., "I was about to...", "Before R8ESTATE, I...", "The moment I saw the trust score...")
- emojis: array of 5-8 relevant emojis for the review context
- keywords: array of 5-8 relevant keywords/phrases (include emotional ones like "saved me", "walked away", "game-changer", "wish I knew sooner")
Keep suggestions specific to real estate experiences. Encourage vivid, personal storytelling.`;
      
      userPrompt = `The user is writing a review for "${developerName || 'a developer'}". 
Rating: ${rating || 'not set'}/5 stars. 
Experience type: ${experienceType || 'not specified'}.
Current review text so far: "${text || '(empty - just starting)'}"

Provide transformation-story style suggestions, relevant emojis, and emotional keywords to help them write a compelling before/after review.`;
    } else if (action === "enhance") {
      systemPrompt = `You are an AI writing assistant for R8ESTATE. Improve the user's review using the "Transformation Story" framework while keeping their voice and meaning.

If the review is flat or generic, restructure it into a BEFORE → MOMENT → AFTER arc:
- BEFORE: What was the situation/fear?
- MOMENT: What changed? What did R8ESTATE reveal?
- AFTER: What was the result?

Keep it authentic — don't add fake details. Just reshape their existing points into a more compelling narrative flow.

Return a JSON object with:
- enhanced: the improved review text (restructured as a transformation story, fix grammar, improve clarity)
- changes: brief description of what was improved (mention if you applied the transformation story structure)`;
      
      userPrompt = `Please enhance this real estate review into a compelling transformation story (keep the same meaning but restructure as before/after narrative, improve grammar and emotional impact):
"${text}"`;
    } else if (action === "enhance_voice") {
      systemPrompt = `You are an AI assistant for R8ESTATE. The user dictated a review using voice-to-text. Clean up the transcription, fix any speech-to-text errors, and reshape it into a compelling "Transformation Story" (BEFORE → MOMENT → AFTER) while preserving the reviewer's voice and meaning.
Return a JSON object with:
- enhanced: the cleaned up review text reshaped as a transformation narrative
- changes: brief description of what was improved`;
      
      userPrompt = `This is a voice-dictated real estate review for "${developerName || 'a developer'}". Please clean it up and reshape it into a transformation story:
"${text}"`;
    }

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
            name: "review_assist",
            description: "Return AI assistance for review writing",
            parameters: {
              type: "object",
              properties: action === "suggest" ? {
                suggestions: { type: "array", items: { type: "string" } },
                emojis: { type: "array", items: { type: "string" } },
                keywords: { type: "array", items: { type: "string" } },
              } : {
                enhanced: { type: "string" },
                changes: { type: "string" },
              },
              required: action === "suggest" ? ["suggestions", "emojis", "keywords"] : ["enhanced", "changes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "review_assist" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
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
    console.error("review-ai-assist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
