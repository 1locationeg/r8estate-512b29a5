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
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, text, developerName, rating, experienceType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "suggest") {
      systemPrompt = `You are an AI assistant for R8ESTATE, a real estate trust platform. Help users write better property reviews. 
Return a JSON object with these fields:
- suggestions: array of 3-5 short sentence suggestions relevant to the context
- emojis: array of 5-8 relevant emojis for the review context
- keywords: array of 5-8 relevant keywords/phrases the reviewer might want to use
Keep suggestions specific to real estate experiences.`;
      
      userPrompt = `The user is writing a review for "${developerName || 'a developer'}". 
Rating: ${rating || 'not set'}/5 stars. 
Experience type: ${experienceType || 'not specified'}.
Current review text so far: "${text || '(empty - just starting)'}"

Provide helpful suggestions, relevant emojis, and keywords to help them write a great review.`;
    } else if (action === "enhance") {
      systemPrompt = `You are an AI writing assistant for R8ESTATE. Improve the user's review text while keeping their voice and meaning. 
Return a JSON object with:
- enhanced: the improved review text (fix grammar, improve clarity, add detail)
- changes: brief description of what was improved`;
      
      userPrompt = `Please enhance this real estate review (keep the same meaning but improve grammar, clarity, and professionalism):
"${text}"`;
    } else if (action === "enhance_voice") {
      systemPrompt = `You are an AI assistant for R8ESTATE. The user dictated a review using voice-to-text. Clean up the transcription, fix any speech-to-text errors, improve grammar and flow while preserving the reviewer's voice and meaning.
Return a JSON object with:
- enhanced: the cleaned up and improved review text
- changes: brief description of what was improved`;
      
      userPrompt = `This is a voice-dictated real estate review for "${developerName || 'a developer'}". Please clean it up and improve it:
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
