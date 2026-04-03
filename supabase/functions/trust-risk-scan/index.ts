import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ risk_flags: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData } = await anonClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub as string | undefined;

    if (!userId) {
      return new Response(JSON.stringify({ risk_flags: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch followed businesses
    const { data: followed } = await db
      .from("followed_businesses")
      .select("business_id, business_name")
      .eq("user_id", userId)
      .limit(10);

    if (!followed?.length) {
      return new Response(JSON.stringify({ risk_flags: [], message: "No followed businesses" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();

    const riskFlags: any[] = [];

    for (const biz of followed) {
      // Current period (last 30 days)
      const { data: recentReviews } = await db
        .from("reviews")
        .select("rating")
        .eq("developer_id", biz.business_id)
        .eq("status", "approved")
        .gte("created_at", thirtyDaysAgo);

      // Prior period (30-60 days ago)
      const { data: priorReviews } = await db
        .from("reviews")
        .select("rating")
        .eq("developer_id", biz.business_id)
        .eq("status", "approved")
        .gte("created_at", sixtyDaysAgo)
        .lt("created_at", thirtyDaysAgo);

      if (!recentReviews?.length && !priorReviews?.length) continue;

      const currentAvg = recentReviews?.length
        ? recentReviews.reduce((s: number, r: any) => s + r.rating, 0) / recentReviews.length
        : null;
      const priorAvg = priorReviews?.length
        ? priorReviews.reduce((s: number, r: any) => s + r.rating, 0) / priorReviews.length
        : null;

      // Upsert snapshot
      if (currentAvg !== null) {
        const allReviews = await db
          .from("reviews")
          .select("rating, is_verified")
          .eq("developer_id", biz.business_id)
          .eq("status", "approved");

        const totalCount = allReviews.data?.length || 0;
        const verifiedPct = totalCount > 0
          ? +((allReviews.data!.filter((r: any) => r.is_verified).length / totalCount) * 100).toFixed(1)
          : 0;
        const overallAvg = totalCount > 0
          ? +(allReviews.data!.reduce((s: number, r: any) => s + r.rating, 0) / totalCount).toFixed(2)
          : 0;

        await db.from("trust_score_snapshots").upsert({
          business_id: biz.business_id,
          avg_rating: overallAvg,
          review_count: totalCount,
          verified_pct: verifiedPct,
          snapshot_date: now.toISOString().split("T")[0],
        }, { onConflict: "business_id,snapshot_date" });
      }

      // Compute delta
      if (currentAvg !== null && priorAvg !== null && priorAvg > 0) {
        const deltaPct = ((currentAvg - priorAvg) / priorAvg) * 100;
        if (Math.abs(deltaPct) > 5) {
          const risk = Math.abs(deltaPct) > 15 ? "High" : Math.abs(deltaPct) > 5 ? "Medium" : "Low";
          const reason = deltaPct < 0 ? "Declining reviews" : "Improving ratings";
          riskFlags.push({
            business: biz.business_name,
            business_id: biz.business_id,
            risk,
            reason,
            delta: +deltaPct.toFixed(1),
            current_avg: +currentAvg.toFixed(2),
            prior_avg: +priorAvg.toFixed(2),
          });
        }
      } else if (recentReviews?.length && !priorReviews?.length) {
        // New activity where there was none
        riskFlags.push({
          business: biz.business_name,
          business_id: biz.business_id,
          risk: "Low",
          reason: "New activity detected",
          delta: 0,
          current_avg: currentAvg ? +currentAvg.toFixed(2) : null,
          prior_avg: null,
        });
      }
    }

    return new Response(JSON.stringify({ risk_flags: riskFlags, scanned: followed.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trust-risk-scan error:", e);
    return new Response(JSON.stringify({ risk_flags: [], error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
