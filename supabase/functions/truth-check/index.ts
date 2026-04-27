// Truth-Check edge function: grounds AI verdict on a developer's marketing claim
// against verified buyer reviews + approved contract receipts.
//
// Returns a single non-streaming JSON response with:
//   { verdict, headline, evidence: [{ review_id, snippet }], stats, lang }
//
// Server-side guardrails:
//   - Pulls reviews/receipts via service role using the client-supplied developer_id
//   - Caps grounding context (25 reviews, 50 receipts, latest snapshot)
//   - Forces tool-calling structured output and validates every cited review_id
//     belongs to the supplied list (prevents hallucinated citations)
//   - Per-IP throttle (1 call / 10s) — best-effort, in-memory.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VERDICTS = [
  "backed_by_buyers",
  "mixed_signals",
  "contradicted_by_buyers",
  "insufficient_evidence",
] as const;
type Verdict = (typeof VERDICTS)[number];

const REVIEW_LIMIT = 25;
const RECEIPT_LIMIT = 50;
const CLAIM_MAX = 500;

// In-memory throttle (best-effort; resets on cold start). Maps IP -> last call ms.
const lastCallByIp = new Map<string, number>();
const THROTTLE_MS = 10_000;

function checkThrottle(req: Request): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const now = Date.now();
  const last = lastCallByIp.get(ip) ?? 0;
  if (now - last < THROTTLE_MS) return false;
  lastCallByIp.set(ip, now);
  // Cheap GC
  if (lastCallByIp.size > 5_000) {
    for (const [k, v] of lastCallByIp.entries()) {
      if (now - v > 60_000) lastCallByIp.delete(k);
    }
  }
  return true;
}

interface ReviewRow {
  id: string;
  rating: number | null;
  comment: string | null;
  author_name: string | null;
  developer_name: string | null;
  is_verified: boolean | null;
  verification_level: string | null;
  category_ratings: Record<string, number> | null;
  created_at: string;
}

interface Snapshot {
  computed_score: number | null;
  avg_rating: number | null;
  review_count: number | null;
  verified_pct: number | null;
}

const tool = {
  type: "function" as const,
  function: {
    name: "truth_check_verdict",
    description:
      "Return a grounded verdict on the user's claim using ONLY the supplied reviews/receipts.",
    parameters: {
      type: "object",
      properties: {
        verdict: {
          type: "string",
          enum: [...VERDICTS],
          description: "Verdict label.",
        },
        headline: {
          type: "string",
          description:
            "One short sentence (max 140 chars) summarising the verdict in the user's language.",
        },
        evidence: {
          type: "array",
          maxItems: 4,
          items: {
            type: "object",
            properties: {
              review_id: {
                type: "string",
                description:
                  "MUST be one of the review IDs supplied in the context. Use empty string if citing aggregate stats only.",
              },
              snippet: {
                type: "string",
                description:
                  "Short, plain-language reason (max 160 chars) referring to that review's content or the aggregate stats.",
              },
            },
            required: ["review_id", "snippet"],
            additionalProperties: false,
          },
        },
      },
      required: ["verdict", "headline", "evidence"],
      additionalProperties: false,
    },
  },
};

function buildSystemPrompt(lang: "ar" | "en") {
  const langLine =
    lang === "ar"
      ? "Reply in colloquial Egyptian Arabic (Ammiya), warm and concise."
      : "Reply in plain English, warm and concise.";
  return `You are R8ESTATE's Truth-Check assistant for the Egyptian off-plan real-estate market.
You evaluate a developer's marketing claim against ONLY the verified buyer evidence supplied below.

Hard rules:
- Use ONLY the supplied reviews and aggregate stats. Do NOT invent buyer names, numbers, projects, or events.
- Every evidence item MUST reference a review_id from the supplied list, OR use empty string review_id if the snippet only summarises the aggregate stats.
- If fewer than 3 verified reviews are supplied, OR the supplied evidence is unrelated to the claim, return verdict="insufficient_evidence" and say so plainly.
- Never reveal full reviewer names or contact info. Reference reviewers as "a verified buyer" / "مشتري موثّق".
- Keep headline under 140 characters and snippets under 160 characters.
- ${langLine}

Verdict scale:
- backed_by_buyers: most relevant verified reviews support the claim.
- mixed_signals: relevant reviews are split.
- contradicted_by_buyers: most relevant verified reviews contradict the claim.
- insufficient_evidence: not enough relevant verified data to judge.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!checkThrottle(req)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a few seconds." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const claimRaw = typeof body?.claim === "string" ? body.claim.trim() : "";
    const developerId =
      typeof body?.developer_id === "string" && body.developer_id.length > 0
        ? body.developer_id
        : null;
    const lang: "ar" | "en" = body?.lang === "ar" ? "ar" : "en";

    if (!claimRaw || claimRaw.length < 8) {
      return new Response(
        JSON.stringify({
          error:
            lang === "ar"
              ? "اكتب الكلام اللي عاوز تتحقق منه (٨ حروف على الأقل)."
              : "Please paste the claim you want to fact-check (8+ chars).",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const claim = claimRaw.slice(0, CLAIM_MAX);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ── Pull grounding context ────────────────────────────────────────────
    const reviewsQuery = supabase
      .from("reviews")
      .select(
        "id, rating, comment, author_name, developer_name, is_verified, verification_level, category_ratings, created_at",
      )
      .eq("status", "approved")
      .order("is_verified", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(REVIEW_LIMIT);

    if (developerId) reviewsQuery.eq("developer_id", developerId);

    const [reviewsResp, snapshotResp, contractResp] = await Promise.all([
      reviewsQuery,
      developerId
        ? supabase
            .from("trust_score_snapshots")
            .select("computed_score, avg_rating, review_count, verified_pct")
            .eq("business_id", developerId)
            .order("snapshot_date", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("receipt_submissions")
        .select("id, document_type, authenticity_score, developer_name")
        .eq("status", "approved")
        .gte("authenticity_score", 75)
        .in("document_type", ["reservation_form", "payment_receipt", "sale_contract"])
        .limit(RECEIPT_LIMIT),
    ]);

    const reviews: ReviewRow[] = (reviewsResp.data ?? []) as ReviewRow[];
    const snapshot = (snapshotResp.data ?? null) as Snapshot | null;
    const allReceipts = (contractResp.data ?? []) as Array<{
      developer_name: string | null;
    }>;

    // Filter receipts by developer_name fuzzy-match if we have a developerId-scoped review set
    const developerName =
      reviews.find((r) => r.developer_name)?.developer_name?.trim().toLowerCase() ?? null;
    const contractVerifiedCount = developerName
      ? allReceipts.filter((r) =>
          (r.developer_name ?? "").trim().toLowerCase().includes(developerName),
        ).length
      : allReceipts.length;

    // Drop reviews with no comment AND no rating signal
    const usable = reviews.filter(
      (r) => (r.comment && r.comment.trim().length > 0) || (r.rating ?? 0) > 0,
    );

    if (usable.length === 0) {
      return new Response(
        JSON.stringify({
          verdict: "insufficient_evidence" satisfies Verdict,
          headline:
            lang === "ar"
              ? "لسه مفيش تقييمات موثّقة كفاية على المطوّر ده."
              : "Not enough verified buyer reviews on this developer yet.",
          evidence: [],
          stats: { reviewCount: 0, verifiedPct: 0, contractVerifiedCount, trustScore: null },
          lang,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build compact evidence block for the model (no PII surfaced)
    const evidenceBlock = usable
      .map((r, i) => {
        const verifiedTag = r.is_verified ? "[VERIFIED]" : "[UNVERIFIED]";
        const cats = r.category_ratings
          ? Object.entries(r.category_ratings)
              .filter(([, v]) => typeof v === "number" && v > 0)
              .map(([k, v]) => `${k}:${v}`)
              .join(",")
          : "";
        const snippet = (r.comment ?? "").slice(0, 360).replace(/\s+/g, " ");
        return `#${i + 1} id=${r.id} ${verifiedTag} rating=${r.rating ?? "?"}/5${
          cats ? ` cats=${cats}` : ""
        }\n"${snippet}"`;
      })
      .join("\n\n");

    const statsBlock = [
      developerName ? `developer="${developerName}"` : "developer=unknown",
      snapshot
        ? `trust_score=${snapshot.computed_score ?? "n/a"} avg_rating=${snapshot.avg_rating ?? "n/a"} reviews=${snapshot.review_count ?? "n/a"} verified_pct=${snapshot.verified_pct ?? "n/a"}`
        : "no_snapshot",
      `contract_verified_buyers=${contractVerifiedCount}`,
    ].join(" | ");

    const userMessage = `CLAIM (paste from buyer): "${claim}"\n\nSTATS: ${statsBlock}\n\nVERIFIED REVIEWS (use review_id values verbatim when citing):\n${evidenceBlock}`;

    // ── Call AI Gateway with structured tool output ───────────────────────
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(lang) },
          { role: "user", content: userMessage },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "truth_check_verdict" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const txt = await aiResp.text();
      console.error("truth-check: AI gateway error", aiResp.status, txt.slice(0, 400));
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await aiResp.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("truth-check: no tool call in response");
      return new Response(JSON.stringify({ error: "AI returned no structured result" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Validate & sanitize ───────────────────────────────────────────────
    const verdict: Verdict = (VERDICTS as readonly string[]).includes(parsed.verdict)
      ? parsed.verdict
      : "insufficient_evidence";

    const headline =
      typeof parsed.headline === "string" ? parsed.headline.trim().slice(0, 200) : "";

    const validIds = new Set(usable.map((r) => r.id));
    const evidence = Array.isArray(parsed.evidence)
      ? parsed.evidence
          .map((e: any) => ({
            review_id:
              typeof e?.review_id === "string" && validIds.has(e.review_id) ? e.review_id : "",
            snippet:
              typeof e?.snippet === "string" ? e.snippet.trim().slice(0, 240) : "",
          }))
          .filter((e: any) => e.snippet.length > 0)
          .slice(0, 4)
      : [];

    return new Response(
      JSON.stringify({
        verdict,
        headline,
        evidence,
        stats: {
          reviewCount: snapshot?.review_count ?? usable.length,
          verifiedPct: snapshot?.verified_pct ?? null,
          contractVerifiedCount,
          trustScore: snapshot?.computed_score ?? null,
        },
        lang,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("truth-check error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});