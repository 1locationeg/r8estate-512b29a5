import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete old weekly records (older than current week)
    const { error } = await supabase
      .from("weekly_buyer_engagement")
      .delete()
      .lt("week_start", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error("Error cleaning weekly engagement:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: "Weekly leaderboard reset complete" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Weekly reset error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
