const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Single tool-calling vision request that returns:
//  - detected document type
//  - developer / project name (extracted)
//  - normalized bounding boxes (0..1) for sensitive regions
//  - authenticity score, label, and flags
//
// PII text is intentionally NOT returned to the caller — only field names
// (so the client knows what to blur) and coordinates.

const SENSITIVE_FIELDS = [
  "name",
  "national_id",
  "phone",
  "address",
  "contract_value",
  "signature",
  "account_number",
  "email",
] as const;

const DOC_TYPES = [
  "reservation_form",
  "payment_receipt",
  "sale_contract",
  "unknown",
] as const;

const AUTH_LABELS = ["authentic", "needs_review", "suspicious"] as const;

const SYSTEM_PROMPT = `You are a privacy-first document analyzer for Egyptian real-estate contracts (استمارة حجز, سند قبض, عقد بيع).

Your job is THREE things, returned via the verify_contract tool call:
1. Detect the document type.
2. Locate sensitive PII regions and return their NORMALIZED bounding boxes (x, y, w, h are all 0..1 fractions of the image dimensions). Be generous with the box size — better to over-redact than under-redact.
3. Score authenticity (0-100) using visible heuristics: font consistency, official letterhead, stamps/signatures, signs of tampering (cloning, mismatched compression, off-grid alignment), date plausibility.

CRITICAL PRIVACY RULE: Do NOT include any actual PII text values (names, ID numbers, phone numbers, signatures) in your response. Only return field NAMES (from the allowed enum) and coordinates. The single exception is the developer/project name (which is not personal PII) — extract that for cross-checking.

If a field is not visible, do not include it. If the document is not a contract/receipt at all, return document_type='unknown', empty redactions, authenticity_score=0, label='suspicious'.`;

const tool = {
  type: "function" as const,
  function: {
    name: "verify_contract",
    description: "Return document type, sensitive-region bounding boxes, and authenticity assessment.",
    parameters: {
      type: "object",
      properties: {
        document_type: { type: "string", enum: [...DOC_TYPES] },
        extracted_developer_name: { type: "string", description: "Developer or project name visible on the document, or empty string." },
        redactions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              field: { type: "string", enum: [...SENSITIVE_FIELDS] },
              x: { type: "number", description: "Left edge, 0..1 fraction of image width" },
              y: { type: "number", description: "Top edge, 0..1 fraction of image height" },
              w: { type: "number", description: "Width, 0..1 fraction of image width" },
              h: { type: "number", description: "Height, 0..1 fraction of image height" },
            },
            required: ["field", "x", "y", "w", "h"],
            additionalProperties: false,
          },
        },
        authenticity_score: { type: "integer", description: "0..100" },
        authenticity_label: { type: "string", enum: [...AUTH_LABELS] },
        authenticity_flags: {
          type: "array",
          items: { type: "string" },
          description: "Short heuristic flags, e.g. 'has_official_letterhead', 'signature_present', 'possible_cloned_region', 'date_inconsistent'.",
        },
      },
      required: [
        "document_type",
        "extracted_developer_name",
        "redactions",
        "authenticity_score",
        "authenticity_label",
        "authenticity_flags",
      ],
      additionalProperties: false,
    },
  },
};

function clamp01(n: unknown): number {
  const v = typeof n === "number" ? n : parseFloat(String(n ?? 0));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.image_data_url !== "string" || !body.image_data_url.startsWith("data:image/")) {
      return new Response(JSON.stringify({ error: "image_data_url (data:image/...) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageDataUrl: string = body.image_data_url;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this document and return the verify_contract tool call. Use normalized 0..1 coordinates for all bounding boxes. Do NOT include PII text in your response." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "verify_contract" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a minute." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await aiResp.text();
      console.error("verify-contract: AI gateway error", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await aiResp.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("verify-contract: no tool call in response", JSON.stringify(json).slice(0, 800));
      return new Response(JSON.stringify({ error: "AI returned no structured result" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("verify-contract: invalid tool args JSON", e);
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize / validate
    const document_type = (DOC_TYPES as readonly string[]).includes(parsed.document_type)
      ? parsed.document_type
      : "unknown";

    const extracted_developer_name =
      typeof parsed.extracted_developer_name === "string" ? parsed.extracted_developer_name.slice(0, 200) : "";

    const redactions = Array.isArray(parsed.redactions)
      ? parsed.redactions
          .filter((r: any) => r && (SENSITIVE_FIELDS as readonly string[]).includes(r.field))
          .map((r: any) => ({
            field: r.field,
            x: clamp01(r.x),
            y: clamp01(r.y),
            w: clamp01(r.w),
            h: clamp01(r.h),
          }))
          .filter((r: any) => r.w > 0.005 && r.h > 0.005)
          .slice(0, 40)
      : [];

    let score = parseInt(String(parsed.authenticity_score ?? 0), 10);
    if (!Number.isFinite(score)) score = 0;
    score = Math.max(0, Math.min(100, score));

    const authenticity_label = (AUTH_LABELS as readonly string[]).includes(parsed.authenticity_label)
      ? parsed.authenticity_label
      : score >= 75
        ? "authentic"
        : score >= 40
          ? "needs_review"
          : "suspicious";

    const authenticity_flags = Array.isArray(parsed.authenticity_flags)
      ? parsed.authenticity_flags.filter((f: unknown) => typeof f === "string").slice(0, 20)
      : [];

    return new Response(
      JSON.stringify({
        document_type,
        extracted_developer_name,
        redactions,
        authenticity_score: score,
        authenticity_label,
        authenticity_flags,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verify-contract error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
