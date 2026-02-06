import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
          ...messages,
        ],
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
